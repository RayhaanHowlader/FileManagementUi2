"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { User, Shield, Key, Save, Loader2, Check, Camera, X, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAvatar } from "@/components/avatar-context"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const { avatarUrl, setAvatarUrl, refetch } = useAvatar()
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const fullName = session?.user?.name ?? ""
  const nameParts = fullName.split(" ")
  const initials = nameParts.map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
  })

  // Populate from session + fetch jobTitle
  useEffect(() => {
    if (!session?.user) return
    const parts = (session.user.name ?? "").split(" ")
    setProfile((p) => ({
      ...p,
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
      email: session.user?.email ?? "",
    }))

    // Fetch full profile for jobTitle (skip for admin)
    if ((session.user as any).role !== "admin") {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            const p = (data.user.fullName ?? "").split(" ")
            setProfile({
              firstName: p[0] ?? "",
              lastName: p.slice(1).join(" "),
              email: data.user.email ?? "",
              jobTitle: data.user.jobTitle ?? "",
            })
            if (data.user.avatarUrl) setAvatarUrl(data.user.avatarUrl)
          }
        })
        .catch(() => {})
    }
  }, [session])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Max 2MB.")
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append("avatar", avatarFile)
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setAvatarUrl(data.avatarUrl)
        setAvatarPreview("")
        setAvatarFile(null)
        refetch() // sync navbar
      } else {
        alert(data.error ?? "Upload failed")
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async () => {
    setPwError("")
    if (passwordForm.next !== passwordForm.confirm) {
      setPwError("New passwords do not match")
      return
    }
    if (passwordForm.next.length < 8) {
      setPwError("New password must be at least 8 characters")
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.next }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error ?? "Failed to update password"); return }
      setPwSuccess(true)
      setPasswordForm({ current: "", next: "", confirm: "" })
      setTimeout(() => { setPwSuccess(false); setShowPasswordForm(false) }, 2000)
    } finally {
      setPwSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${profile.firstName} ${profile.lastName}`.trim(),
          jobTitle: profile.jobTitle,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="rounded-xl border border-border bg-card">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                <div className="border-b border-border p-6">
                  <h2 className="text-lg font-semibold">Profile Settings</h2>
                  <p className="text-sm text-muted-foreground">Update your personal information</p>
                </div>
                <div className="space-y-6 p-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      {avatarPreview || avatarUrl ? (
                        <Image
                          src={avatarPreview || avatarUrl}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                          {initials || "?"}
                        </div>
                      )}
                      {/* overlay on hover */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="h-6 w-6 text-white" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Change Avatar
                        </button>
                        {avatarPreview && (
                          <>
                            <button
                              type="button"
                              onClick={handleAvatarUpload}
                              disabled={uploadingAvatar}
                              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                            >
                              {uploadingAvatar ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                              ) : (
                                <><Check className="h-3.5 w-3.5" /> Save Photo</>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAvatarPreview(""); setAvatarFile(null) }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                      {avatarPreview && (
                        <p className="text-xs text-amber-600">Preview — click &quot;Save Photo&quot; to upload</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="mt-1.5 h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <input
                      type="text"
                      value={profile.jobTitle}
                      placeholder="e.g. Senior Developer"
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                      className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Role badge */}
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <div className="mt-1.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                        (session?.user as any)?.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-primary/10 text-primary"
                      )}>
                        {(session?.user as any)?.role === "admin" ? "Administrator" : "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <>
                <div className="border-b border-border p-6">
                  <h2 className="text-lg font-semibold">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your security preferences</p>
                </div>
                <div className="space-y-4 p-6">

                  {/* Password row */}
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Key className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">Update your account password</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowPasswordForm(!showPasswordForm); setPwError(""); setPwSuccess(false); setPasswordForm({ current: "", next: "", confirm: "" }) }}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        {showPasswordForm ? "Cancel" : "Change"}
                      </button>
                    </div>

                    {/* Inline password form */}
                    {showPasswordForm && (
                      <div className="mt-4 space-y-3 border-t border-border pt-4">
                        {/* Current password */}
                        <div>
                          <label className="text-sm font-medium">Current Password</label>
                          <div className="relative mt-1.5">
                            <input
                              type={showPw.current ? "text" : "password"}
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                              placeholder="Enter current password"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPw.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New password */}
                        <div>
                          <label className="text-sm font-medium">New Password</label>
                          <div className="relative mt-1.5">
                            <input
                              type={showPw.next ? "text" : "password"}
                              value={passwordForm.next}
                              onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                              placeholder="Min. 8 characters"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button type="button" onClick={() => setShowPw({ ...showPw, next: !showPw.next })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPw.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                          <label className="text-sm font-medium">Confirm New Password</label>
                          <div className="relative mt-1.5">
                            <input
                              type={showPw.confirm ? "text" : "password"}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                              placeholder="Repeat new password"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {pwError && <p className="text-sm text-destructive">{pwError}</p>}

                        {pwSuccess && (
                          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                            <Check className="h-4 w-4" /> Password updated successfully
                          </div>
                        )}

                        <button
                          onClick={handlePasswordChange}
                          disabled={pwSaving || !passwordForm.current || !passwordForm.next || !passwordForm.confirm}
                          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {pwSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
                        </button>
                      </div>
                    )}
                  </div>


                </div>
              </>
            )}

            {/* Appearance Tab removed */}

            {/* Footer */}
            <div className="border-t border-border p-6">
              <div className="flex items-center justify-end gap-3">
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || activeTab !== "profile"}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50",
                    saved ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><Check className="h-4 w-4" /> Saved!</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
