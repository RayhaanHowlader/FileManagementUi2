"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Users, Search, MoreHorizontal, Shield,
  Trash2, ChevronDown, Loader2, RefreshCw
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
      if (!res.ok) {
        console.error("Failed to fetch users:", res.status, await res.text())
        return
      }
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      console.error("fetchUsers error:", err)
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground">Manage users and their file permissions</p>
        </div>
        <button onClick={fetchUsers} className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 w-fit">
        {(["users", "roles"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {tab === "users" ? <Users className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="text-sm text-muted-foreground">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</p>
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
                      <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">Status</th>
                      <th className="hidden px-4 py-3 text-center text-sm font-medium text-muted-foreground lg:table-cell">Read</th>
                      <th className="hidden px-4 py-3 text-center text-sm font-medium text-muted-foreground lg:table-cell">Download</th>
                      <th className="hidden px-4 py-3 text-center text-sm font-medium text-muted-foreground lg:table-cell">Delete</th>
                      <th className="hidden px-4 py-3 text-center text-sm font-medium text-muted-foreground lg:table-cell">Share</th>
                      <th className="w-12 px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => {
                      const perms = user.permissions ?? defaultPerms()
                      return (
                        <tr key={user._id} className="transition-colors hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                  {getInitials(user.fullName)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-medium">{user.fullName || "—"}</p>
                                  {saving === user._id && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                </div>
                                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                              user.isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                              {user.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          {(["read", "download", "delete", "share"] as const).map((perm) => (
                            <td key={perm} className="hidden px-4 py-3 text-center lg:table-cell">
                              <Toggle
                                on={perms[perm]}
                                onChange={() => updatePermission(user._id, perm, !perms[perm])}
                                disabled={!isAdmin}
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3">
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
                        <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "roles" && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Permissions Matrix</h2>
            <p className="text-sm text-muted-foreground">Default capabilities per role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Permission</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "View files", admin: true, user: true },
                  { name: "Upload files", admin: true, user: true },
                  { name: "Delete own files", admin: true, user: true },
                  { name: "Delete any file", admin: true, user: false },
                  { name: "Share files", admin: true, user: true },
                  { name: "Manage users", admin: true, user: false },
                  { name: "View all files", admin: true, user: false },
                  { name: "Change permissions", admin: true, user: false },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-muted/50">
                    <td className="px-6 py-3 text-sm font-medium">{row.name}</td>
                    {[row.admin, row.user].map((val, i) => (
                      <td key={i} className="px-6 py-3 text-center">
                        <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                          val ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                          {val ? "✓" : "—"}
                        </span>
                      </td>
                    ))}
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
