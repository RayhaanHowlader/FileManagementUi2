"use client"

import { useState } from "react"
import {
  X,
  Mail,
  Link2,
  Copy,
  Check,
  Shield,
  Clock,
  Eye,
  Download,
  ChevronDown,
  Send,
  RefreshCw,
  FileText,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

type FileItem = {
  id: string
  name: string
  type: string
  size: string
  url?: string
}

type Permission = "view" | "download"

interface ShareFileModalProps {
  file: FileItem
  onClose: () => void
}

export default function ShareFileModal({ file, onClose }: ShareFileModalProps) {
  const [activeTab, setActiveTab] = useState<"email" | "link" | "otp">("email")
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<Permission>("view")
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [expiryOpen, setExpiryOpen] = useState(false)
  const [expiry, setExpiry] = useState("7 days")
  const [message, setMessage] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState("")
  const [generatedShareLink, setGeneratedShareLink] = useState("")
  const [linkGenerating, setLinkGenerating] = useState(false)
  const [linkError, setLinkError] = useState("")

  // OTP specific state
  const [otpEmail, setOtpEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState("5 minutes")
  const [isGenerating, setIsGenerating] = useState(false)

  const permissionOptions = [
    { value: "view", label: "Can view", icon: Eye, description: "View only access" },
    { value: "download", label: "Can download", icon: Download, description: "View and download files" },
  ]

  const expiryOptions = ["1 hour", "24 hours", "7 days", "30 days"]
  const otpExpiryOptions = ["5 minutes", "10 minutes"]

  const handleGenerateLink = async () => {
    setLinkGenerating(true)
    setLinkError("")
    try {
      const res = await fetch("/api/files/share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          fileUrl: (file as any).url ?? "",
          fileType: file.type,
          permission,
          expiry,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error ?? "Failed to generate link"); return }
      setGeneratedShareLink(data.shareLink)
    } catch {
      setLinkError("Something went wrong")
    } finally {
      setLinkGenerating(false)
    }
  }

  const handleSendInvitation = async () => {
    if (!email) return
    setSending(true)
    setSendError("")
    try {
      const res = await fetch("/api/files/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          fileUrl: (file as any).url ?? "",
          fileType: file.type,
          recipientEmail: email,
          permission,
          expiry,
          message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSendError(data.error ?? "Failed to send")
      } else {
        setSent(true)
        setGeneratedShareLink(data.shareLink ?? "")
      }
    } catch {
      setSendError("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = () => {
    if (!generatedShareLink) return
    navigator.clipboard.writeText(generatedShareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const generateOtp = async () => {
    if (!otpEmail) return
    setIsGenerating(true)
    setSendError("")
    try {
      const res = await fetch("/api/files/share-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          fileUrl: (file as any).url ?? "",
          fileType: file.type,
          recipientEmail: otpEmail,
          permission,
          expiry: otpExpiry,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSendError(data.error ?? "Failed to send OTP"); return }
      setOtpSent(true)
    } catch {
      setSendError("Something went wrong. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Share File</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: "email", label: "Email", icon: Mail },
            { id: "link", label: "Link", icon: Link2 },
            { id: "otp", label: "OTP Share", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Email Tab */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Permission</label>
                  <div className="relative mt-1.5">
                    <button
                      onClick={() => setPermissionOpen(!permissionOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        {permissionOptions.find((p) => p.value === permission)?.icon && (
                          <span className="text-muted-foreground">
                            {(() => {
                              const Icon = permissionOptions.find((p) => p.value === permission)?.icon
                              return Icon ? <Icon className="h-4 w-4" /> : null
                            })()}
                          </span>
                        )}
                        {permissionOptions.find((p) => p.value === permission)?.label}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {permissionOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setPermissionOpen(false)} />
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                          {permissionOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setPermission(option.value as Permission)
                                setPermissionOpen(false)
                              }}
                              className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent"
                            >
                              <option.icon className="h-4 w-4 text-muted-foreground" />
                              <div className="text-left">
                                <p className="font-medium">{option.label}</p>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <div className="relative mt-1.5">
                    <button
                      onClick={() => setExpiryOpen(!expiryOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {expiry}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {expiryOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setExpiryOpen(false)} />
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                          {expiryOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setExpiry(option)
                                setExpiryOpen(false)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a personal message..."
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {sendError && (
                <p className="text-sm text-destructive">{sendError}</p>
              )}

              {sent ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                    <Check className="h-4 w-4" /> Email sent to {email}
                  </div>
                  <p className="text-xs text-green-600">
                    They can access the file via the link in their inbox.
                  </p>
                  <button
                    onClick={() => { setSent(false); setEmail(""); setMessage("") }}
                    className="text-xs text-green-700 underline"
                  >
                    Share with someone else
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSendInvitation}
                  disabled={!email || sending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send via Gmail</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-4">
              {/* Permission + Expiry first so user sets them before generating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Permission</label>
                  <div className="relative mt-1.5">
                    <button
                      onClick={() => setPermissionOpen(!permissionOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{permissionOptions.find((p) => p.value === permission)?.label}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {permissionOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setPermissionOpen(false)} />
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                          {permissionOptions.map((option) => (
                            <button key={option.value}
                              onClick={() => { setPermission(option.value as Permission); setPermissionOpen(false) }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <div className="relative mt-1.5">
                    <button
                      onClick={() => setExpiryOpen(!expiryOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{expiry}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {expiryOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setExpiryOpen(false)} />
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                          {expiryOptions.map((option) => (
                            <button key={option}
                              onClick={() => { setExpiry(option); setExpiryOpen(false) }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                              {option}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate button */}
              {!generatedShareLink && (
                <button
                  onClick={handleGenerateLink}
                  disabled={linkGenerating}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {linkGenerating ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Link2 className="h-4 w-4" /> Generate Share Link</>
                  )}
                </button>
              )}

              {linkError && <p className="text-sm text-destructive">{linkError}</p>}

              {/* Generated link */}
              {generatedShareLink && (
                <>
                  <div>
                    <label className="text-sm font-medium">Share link</label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedShareLink}
                        className="h-10 flex-1 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
                          linkCopied
                            ? "border-green-500 bg-green-50 text-green-600"
                            : "border-input bg-background hover:bg-accent"
                        )}
                      >
                        {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    {linkCopied && <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>}
                  </div>

                  <button
                    onClick={() => { setGeneratedShareLink(""); setLinkCopied(false) }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Generate a new link
                  </button>
                </>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Link Protection</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Anyone with this link can access the file with the specified permissions until it expires.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTP Tab */}
          {activeTab === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">OTP-Protected Sharing</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Share files securely with a one-time password. The recipient must enter the OTP to access the file.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Recipient email</label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="recipient@company.com"
                      className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Permission</label>
                      <div className="relative mt-1.5">
                        <button
                          onClick={() => setPermissionOpen(!permissionOpen)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                        >
                          <span>{permissionOptions.find((p) => p.value === permission)?.label}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {permissionOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setPermissionOpen(false)} />
                            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                              {permissionOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setPermission(option.value as Permission)
                                    setPermissionOpen(false)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">OTP Expires</label>
                      <div className="relative mt-1.5">
                        <button
                          onClick={() => setExpiryOpen(!expiryOpen)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                        >
                          <span>{otpExpiry}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {expiryOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setExpiryOpen(false)} />
                            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
                              {otpExpiryOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => { setOtpExpiry(option); setExpiryOpen(false) }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateOtp}
                    disabled={!otpEmail || isGenerating}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating OTP...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Generate OTP & Send
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
                    <Mail className="h-8 w-8 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">OTP Sent Successfully</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A 6-digit code has been sent to <span className="font-medium">{otpEmail}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">The code expires in 15 minutes.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-left">
                    <p className="text-sm text-muted-foreground">
                      The recipient should go to <strong>Files → Receive File</strong> and enter the OTP to access the file.
                    </p>
                  </div>
                  {sendError && <p className="text-sm text-destructive">{sendError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setOtpSent(false); setOtpEmail(""); setSendError("") }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
                    >
                      <RefreshCw className="h-4 w-4" /> Send Another
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab !== "otp" && (
          <div className="border-t border-border px-6 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                End-to-end encrypted
              </span>
              <span>All shares are logged for audit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
