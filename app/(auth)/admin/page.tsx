"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Eye, EyeOff, Shield, Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/dashboard")
    }
  }, [session, status, router])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"credentials" | "2fa">("credentials")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Admin email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validate2FA = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.twoFactorCode) {
      newErrors.twoFactorCode = "Verification code is required"
    } else if (formData.twoFactorCode.length !== 6) {
      newErrors.twoFactorCode = "Code must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCredentials()) return
    setIsLoading(true)

    try {
      // First verify this is actually an admin in the DB
      const check = await fetch("/api/auth/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      if (!check.ok) {
        setErrors({ password: "Invalid admin credentials" })
        return
      }

      // Now sign in via NextAuth
      const { signIn } = await import("next-auth/react")
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ password: "Invalid admin credentials" })
        return
      }

      router.push("/dashboard")
    } catch {
      setErrors({ password: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate2FA()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push("/dashboard")
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits and max 6 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    setFormData({ ...formData, twoFactorCode: cleaned })
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
            <Shield className="h-6 w-6 text-background" />
          </div>
          <span className="text-xl font-semibold">SecureShare</span>
        </Link>
      </div>

      {/* Admin badge */}
      <div className="flex justify-center lg:justify-start">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Administrator Access</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "credentials" ? "Admin Sign In" : "Two-Factor Authentication"}
        </h1>
        <p className="text-muted-foreground">
          {step === "credentials"
            ? "Enter your administrator credentials to continue"
            : "Enter the 6-digit code from your authenticator app"}
        </p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-600">Restricted Access</p>
          <p className="text-muted-foreground">
            This area is restricted to authorized administrators only. All login
            attempts are logged and monitored.
          </p>
        </div>
      </div>

      {/* Credentials Form */}
      {step === "credentials" && (
        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@secureshare.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Continue to verification"
            )}
          </Button>
        </form>
      )}

      {/* 2FA Form */}
      {step === "2fa" && (
        <form onSubmit={handle2FASubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="2fa">Verification Code</Label>
              <Input
                id="2fa"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={formData.twoFactorCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`text-center text-2xl tracking-[0.5em] font-mono ${
                  errors.twoFactorCode ? "border-red-500" : ""
                }`}
                maxLength={6}
              />
              {errors.twoFactorCode && (
                <p className="text-sm text-red-500">{errors.twoFactorCode}</p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Open your authenticator app to view your verification code
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and sign in"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("credentials")
                setFormData({ ...formData, twoFactorCode: "" })
                setErrors({})
              }}
            >
              Back to credentials
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lost access to your authenticator?
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Other options
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center text-sm">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in as a regular user
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
