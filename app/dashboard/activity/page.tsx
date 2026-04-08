"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Activity, Search, Filter, ChevronDown, Eye, Download, Upload, Trash2, Share2, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type LogEntry = {
  _id: string
  action: "preview" | "download" | "upload" | "delete" | "share"
  userName: string
  userEmail: string
  fileName: string
  fileType: string
  createdAt: string
}

const actionIcon: Record<string, React.ReactNode> = {
  preview:  <Eye className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  upload:   <Upload className="h-4 w-4" />,
  delete:   <Trash2 className="h-4 w-4" />,
  share:    <Share2 className="h-4 w-4" />,
}

const actionColor: Record<string, string> = {
  preview:  "bg-muted text-muted-foreground",
  download: "bg-chart-1/10 text-chart-1",
  upload:   "bg-chart-2/10 text-chart-2",
  delete:   "bg-destructive/10 text-destructive",
  share:    "bg-chart-4/10 text-chart-4",
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
  return name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
}

export default function ActivityPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => {
        if (d.role !== "admin") { router.replace("/dashboard"); return }
        setIsAdmin(true)
        fetch("/api/files/log")
          .then((r) => r.json())
          .then((data) => setLogs(data.logs ?? []))
          .finally(() => setLoading(false))
      })
  }, [router])

  if (!isAdmin && !loading) return null

  const filtered = logs.filter((l) => {
    const q = searchQuery.toLowerCase()
    const matchSearch = l.userName.toLowerCase().includes(q) ||
      l.userEmail.toLowerCase().includes(q) ||
      l.fileName.toLowerCase().includes(q)
    const matchAction = actionFilter === "all" || l.action === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">Real-time file access and action history</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          {logs.length} total events
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["preview", "download", "upload", "share"] as const).map((a) => (
          <div key={a} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">{a}s</span>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", actionColor[a])}>
                {actionIcon[a]}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{logs.filter((l) => l.action === a).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" placeholder="Search user, file..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="relative">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
            <Filter className="h-4 w-4" />
            {actionFilter === "all" ? "All Actions" : actionFilter.charAt(0).toUpperCase() + actionFilter.slice(1)}
            <ChevronDown className="h-3 w-3" />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-md border border-border bg-popover py-1 shadow-lg">
                {["all", "preview", "download", "upload", "delete", "share"].map((a) => (
                  <button key={a} onClick={() => { setActionFilter(a); setFilterOpen(false) }}
                    className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent capitalize">
                    {a === "all" ? "All Actions" : a}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">File</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      No activity logs yet
                    </td>
                  </tr>
                )}
                {filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {getInitials(log.userName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{log.userName}</p>
                          <p className="truncate text-xs text-muted-foreground">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", actionColor[log.action])}>
                          {actionIcon[log.action]}
                        </span>
                        <span className="text-sm capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-sm truncate max-w-[200px]">{log.fileName}</p>
                      <p className="text-xs text-muted-foreground">{log.fileType}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
