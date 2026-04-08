"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  FileText, Activity, Shield, Clock,
  Download, Users, Loader2, Image as ImageIcon,
  FileArchive, File, Video, Upload, ArrowUpRight
} from "lucide-react"

type RecentFile = {
  _id: string
  name: string
  type: string
  size: number
  url: string
  ownerName: string
  downloadable: boolean
  createdAt: string
}

type ActivityItem = {
  id: string
  user: string
  action: string
  target: string
  time: string
}

type Stats = {
  totalFiles: number
  totalBytes: number
  sharesThisWeek: number
  totalShares: number
  totalUsers: number
  recentFiles: RecentFile[]
  recentActivity: ActivityItem[]
  isAdmin: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
}

function getFileIcon(type: string, name: string) {
  const n = name.toLowerCase()
  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/.test(n))
    return <ImageIcon className="h-5 w-5 text-blue-500" />
  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/.test(n))
    return <Video className="h-5 w-5 text-purple-500" />
  if (type === "application/pdf" || n.endsWith(".pdf"))
    return <FileText className="h-5 w-5 text-red-500" />
  if (type.includes("zip") || type.includes("archive"))
    return <FileArchive className="h-5 w-5 text-amber-500" />
  return <File className="h-5 w-5 text-muted-foreground" />
}

async function downloadFile(url: string, name: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl; a.download = name
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(blobUrl)
  } catch { window.open(url, "_blank") }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbRole, setDbRole] = useState<string | null>(null)
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const isAdmin = dbRole === "admin" || (session?.user as any)?.role === "admin" || stats?.isAdmin === true

  useEffect(() => {
    fetch("/api/user/role").then((r) => r.json()).then((d) => setDbRole(d.role)).catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then((data) => setStats(data)).finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { href: "/dashboard/files", icon: Upload, label: "Upload Files", sub: "Add files to storage", color: "bg-blue-500" },
    { href: "/dashboard/access", icon: Users, label: "Manage Users", sub: "Control access", color: "bg-indigo-500" },
    { href: "/dashboard/files", icon: Shield, label: "Share Securely", sub: "OTP protection", color: "bg-violet-500" },
    { href: "/dashboard/activity", icon: Activity, label: "View Logs", sub: "Monitor activity", color: "bg-sky-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isAdmin
              ? `Welcome back, ${firstName}. Platform overview below.`
              : `Welcome back, ${firstName}. Here's your file activity.`}
          </p>
        </div>
        {/* Quick action buttons in header */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/files"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            <Upload className="h-4 w-4" /> Upload
          </Link>
          <Link href="/dashboard/files"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium hover:bg-accent transition-colors">
            <Shield className="h-4 w-4 text-primary" /> Share
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat cards — gradient style */}
          <div className={`grid gap-4 ${isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-400 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">{isAdmin ? "Total Files" : "My Files"}</p>
                <FileText className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-3 text-3xl font-bold">{stats?.totalFiles ?? 0}</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Storage Used</p>
                <Shield className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-3 text-3xl font-bold">{formatBytes(stats?.totalBytes ?? 0)}</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Shares This Week</p>
                <Activity className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-3 text-3xl font-bold">{stats?.sharesThisWeek ?? 0}</p>
            </div>

            {isAdmin && (
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 p-5 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">Registered Users</p>
                  <Users className="h-5 w-5 text-white/70" />
                </div>
                <p className="mt-3 text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
              </div>
            )}
          </div>

          {/* Admin extra row */}
          {isAdmin && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-5 flex items-center gap-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalShares ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Total Shares (all time)</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-5 flex items-center gap-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
                  <Activity className="h-6 w-6 text-sky-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.sharesThisWeek ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Shares This Week</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions — horizontal pill row */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium hover:bg-accent transition-colors shadow-sm">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.color}`}>
                  <a.icon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-sm leading-none">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.sub}</p>
                </div>
                <span className="sm:hidden text-sm">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm">Recent Activity</h2>
                </div>
                <Link href="/dashboard/activity"
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {!stats?.recentActivity.length && (
                  <p className="px-5 py-10 text-center text-sm text-muted-foreground">No activity yet</p>
                )}
                {stats?.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(item.user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium truncate">{item.target}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{timeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm">Recent Files</h2>
                </div>
                <Link href="/dashboard/files"
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {!stats?.recentFiles.length && (
                  <p className="px-5 py-10 text-center text-sm text-muted-foreground">No files yet</p>
                )}
                {stats?.recentFiles.map((file) => (
                  <div key={file._id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getFileIcon(file.type, file.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {timeAgo(file.createdAt)}</p>
                      </div>
                    </div>
                    {file.downloadable && (
                      <button onClick={() => downloadFile(file.url, file.name)}
                        className="ml-3 shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
