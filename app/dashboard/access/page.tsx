"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Users, Search, MoreHorizontal, ShieldCheck,
  Trash2, ChevronDown, Loader2, RefreshCw, CheckCircle2, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

type Permission = { read: boolean; download: boolean; delete: boolean; share: boolean }

type UserRow = {
  _id: string
  fullName: string
  email: string
  avatarUrl?: string
  isVerified: boolean
  permissions?: Permission
  createdAt: string
}

const defaultPerms = (): Permission => ({ read: true, download: true, delete: false, share: true })

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled}
      className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-40")}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
        on ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  )
}

export default function AccessControlPage() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => { if (d.role === "admin") setIsAdmin(true) })
      .catch(() => {})
  }, [])

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users")
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("all")
  const [roleFilterOpen, setRoleFilterOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) return
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matches = u.fullName?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    if (roleFilter === "verified") return matches && u.isVerified
    if (roleFilter === "unverified") return matches && !u.isVerified
    return matches
  })

  const updatePermission = async (userId: string, key: keyof Permission, value: boolean) => {
    const user = users.find((u) => u._id === userId)
    if (!user) return
    const newPerms = { ...(user.permissions ?? defaultPerms()), [key]: value }
    setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, permissions: newPerms } : u))
    setSaving(userId)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPerms }),
      })
    } finally {
      setSaving(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setShowActionsMenu(null)
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
    setUsers((prev) => prev.filter((u) => u._id !== userId))
  }

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <div className="space-y-0">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Access Control</h1>
              <p className="text-sm text-muted-foreground">Manage users and their file permissions</p>
            </div>
          </div>
          <button onClick={fetchUsers}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent self-start sm:self-auto">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Border-style tabs */}
        <div className="mt-5 flex border-b border-border">
          {(["users", "roles"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 px-4 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {tab === "users" ? <Users className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search + filter bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="search" placeholder="Search users..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="relative">
                <button onClick={() => setRoleFilterOpen(!roleFilterOpen)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                  {roleFilter === "all" ? "All" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {roleFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setRoleFilterOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-2 w-36 rounded-md border border-border bg-popover py-1 shadow-lg">
                      {["all", "verified", "unverified"].map((f) => (
                        <button key={f} onClick={() => { setRoleFilter(f); setRoleFilterOpen(false) }}
                          className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent capitalize">
                          {f === "all" ? "All Users" : f}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground shrink-0">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">User</th>
                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground md:table-cell">Status</th>
                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground lg:table-cell">Permissions</th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground w-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const perms = user.permissions ?? defaultPerms()
                    return (
                      <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.avatarUrl} alt={user.fullName} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
                                {getInitials(user.fullName)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{user.fullName || "—"}</p>
                                {saving === user._id && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 md:table-cell">
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            user.isVerified
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-amber-200 bg-amber-50 text-amber-700")}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="hidden px-5 py-4 lg:table-cell">
                          <div className="flex items-center gap-3 flex-wrap">
                            {(["read", "download", "delete", "share"] as const).map((perm) => (
                              <div key={perm} className="flex items-center gap-1.5">
                                <Toggle on={perms[perm]} onChange={() => updatePermission(user._id, perm, !perms[perm])} disabled={!isAdmin} />
                                <span className="text-xs text-muted-foreground capitalize">{perm}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative flex justify-end">
                            <button onClick={() => setShowActionsMenu(showActionsMenu === user._id ? null : user._id)}
                              className="rounded-md p-2 text-muted-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {showActionsMenu === user._id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(null)} />
                                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
                                  {isAdmin ? (
                                    <button onClick={() => deleteUser(user._id)}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent">
                                      <Trash2 className="h-4 w-4" /> Remove User
                                    </button>
                                  ) : (
                                    <p className="px-4 py-2 text-xs text-muted-foreground">Admin only</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center text-sm text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                role: "Admin",
                desc: "Full platform access. Can manage users, view all files, and change permissions.",
                perms: [
                  { name: "View files", granted: true },
                  { name: "Upload files", granted: true },
                  { name: "Delete any file", granted: true },
                  { name: "Share files", granted: true },
                  { name: "Manage users", granted: true },
                  { name: "Change permissions", granted: true },
                ],
              },
              {
                role: "User",
                desc: "Standard access. Can upload and manage own files with configurable permissions.",
                perms: [
                  { name: "View files", granted: true },
                  { name: "Upload files", granted: true },
                  { name: "Delete any file", granted: false },
                  { name: "Share files", granted: true },
                  { name: "Manage users", granted: false },
                  { name: "Change permissions", granted: false },
                ],
              },
            ].map(({ role, desc, perms }) => (
              <div key={role} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{role}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {perms.map((p) => (
                    <li key={p.name} className="flex items-center justify-between px-5 py-2.5">
                      <span className="text-sm">{p.name}</span>
                      {p.granted
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
