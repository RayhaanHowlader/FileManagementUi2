"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  FileText, Activity, Shield, Clock,
  Download, Users, Loader2, Image as ImageIcon,
  FileArchive, File, Video
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
    return <ImageIcon className="h-5 w-5 text-chart-2" />
  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/.test(n))
    return <Video className="h-5 w-5 text-chart-1" />
  if (type === "application/pdf" || n.endsWith(".pdf"))
    return <FileText className="h-5 w-5 text-destructive" />
  if (type.includes("zip") || type.includes("archive"))
    return <FileArchive className="h-5 w-5 text-chart-4" />
  return <File className="h-5 w-5 text-muted-foreground" />
}

async function downloadFile(url: string, name: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, "_blank")
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbRole, setDbRole] = useState<string | null>(null)
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const isAdmin = dbRole === "admin" || (session?.user as any)?.role === "admin" || stats?.isAdmin === true

  useEffect(() => {
    // Fetch role directly from DB — bypasses stale JWT
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => setDbRole(d.role))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? `Welcome back, ${firstName}. Here's an overview of all platform activity.`
            : `Welcome back, ${firstName}. Here's what's happening with your files.`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className={`grid gap-4 ${isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats?.totalFiles ?? 0}</p>
                <p className="text-sm text-muted-foreground">{isAdmin ? "Total Files (all users)" : "My Files"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <Shield className="h-5 w-5 text-chart-3" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{formatBytes(stats?.totalBytes ?? 0)}</p>
                <p className="text-sm text-muted-foreground">{isAdmin ? "Total Storage Used" : "Storage Used"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Activity className="h-5 w-5 text-chart-4" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats?.sharesThisWeek ?? 0}</p>
                <p className="text-sm text-muted-foreground">Shares This Week</p>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Registered Users</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin-only extra stats row */}
          {isAdmin && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalShares ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Total Shares (all time)</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                  <Activity className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.sharesThisWeek ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Shares This Week</p>
                </div>
              </div>
            </div>
          )}

          {/* Content grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold">Recent Activity</h2>
                <Link href="/dashboard/activity" className="text-sm text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-border">
                {stats?.recentActivity.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-muted-foreground">No activity yet</p>
                )}
                {stats?.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(item.user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium truncate">{item.target}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold">Recent Files</h2>
                <Link href="/dashboard/files" className="text-sm text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-border">
                {stats?.recentFiles.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-muted-foreground">No files yet</p>
                )}
                {stats?.recentFiles.map((file) => (
                  <div key={file._id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getFileIcon(file.type, file.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.size)} · {timeAgo(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    {file.downloadable && (
                      <button
                        onClick={() => downloadFile(file.url, file.name)}
                        className="ml-3 shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/dashboard/files", icon: FileText, color: "bg-chart-1/10 text-chart-1", label: "Upload Files", sub: "Add new files to storage" },
                { href: "/dashboard/access", icon: Users, color: "bg-chart-2/10 text-chart-2", label: "Manage Users", sub: "Control user access" },
                { href: "/dashboard/files", icon: Shield, color: "bg-chart-3/10 text-chart-3", label: "Share Securely", sub: "Share with OTP protection" },
                { href: "/dashboard/activity", icon: Activity, color: "bg-chart-4/10 text-chart-4", label: "View Logs", sub: "Monitor all activity" },
              ].map((action) => (
                <Link key={action.label} href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color.split(" ")[0]}`}>
                    <action.icon className={`h-5 w-5 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
