"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import {
  Shield, FileText, Users, Activity, Settings,
  Menu, X, Bell, Search, ChevronDown, LogOut,
  User, HelpCircle, LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarProvider, useAvatar } from "@/components/avatar-context"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { name: "Files", href: "/dashboard/files", icon: FileText, adminOnly: false },
  { name: "Access Control", href: "/dashboard/access", icon: Users, adminOnly: false },
  { name: "Activity Logs", href: "/dashboard/activity", icon: Activity, adminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, adminOnly: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AvatarProvider>
      <DashboardShell>{children}</DashboardShell>
    </AvatarProvider>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { avatarUrl } = useAvatar()

  const userName = session?.user?.name ?? "User"
  const userEmail = session?.user?.email ?? ""
  const isAdmin = (session?.user as any)?.role === "admin"
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const visibleNav = navigation.filter((item) => !item.adminOnly || isAdmin)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const AvatarDisplay = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const dim = size === "lg" ? "h-9 w-9" : "h-8 w-8"
    const textSize = size === "lg" ? "text-sm" : "text-sm"
    if (avatarUrl) {
      return (
        <Image
          src={avatarUrl}
          alt={userName}
          width={size === "lg" ? 36 : 32}
          height={size === "lg" ? 36 : 32}
          className={cn(dim, "rounded-full object-cover")}
          unoptimized
        />
      )
    }
    return (
      <div className={cn(dim, "flex items-center justify-center rounded-full bg-primary text-primary-foreground")}>
        <span className={cn(textSize, "font-medium")}>{initials}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">SecureShare</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {visibleNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
            <div className="shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={userName} width={36} height={36}
                  className="h-9 w-9 rounded-full object-cover" unoptimized />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-medium">{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search files, users..."
                  className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="relative ml-2">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <AvatarDisplay size="sm" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-popover py-1 shadow-lg">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
