"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FolderLock, Loader2, ArrowLeft, Mail,
  Eye, EyeOff, RefreshCw, Check, X, KeyRound
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "email" | "otp" | "reset" | "done"

const passwordReqs = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
]

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetError, setResetError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  // Step indicator dots
  const steps: Step[] = ["email", "otp", "reset"]
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`h-2 w-2 rounded-full transition-colors ${
            s === step || steps.indexOf(step) > i ? "bg-primary" : "bg-muted"
          }`} />
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 transition-colors ${
              steps.indexOf(step) > i ? "bg-primary" : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  // ── Step 1: Email ──────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    setEmailError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setEmailError(data.error ?? "Failed to send OTP"); return }
      setStep("otp")
      setResendTimer(60)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: OTP ────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("")
      const newOtp = [...otp]
      pasted.forEach((c, i) => { if (index + i < 6) newOtp[index + i] = c })
      setOtp(newOtp)
      inputRefs.current[Math.min(index + pasted.length, 5)]?.focus()
      return
    }
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, "")
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    setOtpError("")
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length !== 6) { setOtpError("Enter the complete 6-digit code"); return }
    setLoading(true)
    try {
      // Verify OTP by attempting a dry-run — we'll verify on reset step
      // Just move to reset step; actual verification happens on password reset
      setStep("reset")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setOtp(["", "", "", "", "", ""])
      setOtpError("")
      setResendTimer(60)
    } finally {
      setIsResending(false)
    }
  }

  // ── Step 3: Reset ──────────────────────────────────────────
  const metReqs = passwordReqs.filter((r) => r.test(password))
  const passwordStrong = metReqs.length >= 3

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordStrong) { setResetError("Password is too weak"); return }
    if (password !== confirmPassword) { setResetError("Passwords do not match"); return }
    setResetError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { setResetError(data.error ?? "Reset failed"); return }
      setStep("done")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
            <FolderLock className="h-6 w-6 text-background" />
          </div>
          <span className="text-xl font-semibold">VaultDrop</span>
        </Link>
      </div>

      {step !== "done" && <StepDots />}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="text-muted-foreground text-sm">Enter your email and we&apos;ll send a verification code.</p>
          </div>
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${emailError ? "border-red-500" : ""}`}
                />
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...</> : "Send verification code"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Remember it?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
          </p>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <>
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground">We sent a 6-digit code to</p>
            <p className="font-medium">{email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-3">
              <Label className="block text-center">Verification code</Label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-semibold ${otpError ? "border-red-500" : ""}`}
                  />
                ))}
              </div>
              {otpError && <p className="text-sm text-red-500 text-center">{otpError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify code"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive it?</p>
            <Button variant="ghost" size="sm" onClick={handleResend} disabled={resendTimer > 0 || isResending}>
              {isResending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> :
               resendTimer > 0 ? <><RefreshCw className="mr-2 h-4 w-4" /> Resend in {resendTimer}s</> :
               <><RefreshCw className="mr-2 h-4 w-4" /> Resend code</>}
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => setStep("email")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "reset" && (
        <>
          <div className="space-y-1">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
            <p className="text-sm text-muted-foreground">Must be different from your previous password.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {passwordReqs.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(password) ? "text-green-600" : "text-muted-foreground"}`}>
                      {r.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {resetError && <p className="text-sm text-red-500">{resetError}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : "Reset password"}
            </Button>
          </form>
        </>
      )}

      {/* ── Done ── */}
      {step === "done" && (
        <div className="text-center space-y-6 py-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Password reset!</h1>
            <p className="text-muted-foreground text-sm">Your password has been updated successfully.</p>
          </div>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Back to sign in
          </Button>
        </div>
      )}

      {step === "email" && (
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      )}
    </div>
  )
}
