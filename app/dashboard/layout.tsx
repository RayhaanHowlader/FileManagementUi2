"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import {
  FolderLock, FileText, Users, Activity, Settings,
  Menu, X, Bell, ChevronDown, LogOut,
  User, LayoutDashboard
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { avatarUrl } = useAvatar()

  const userName = session?.user?.name ?? "User"
  const userEmail = session?.user?.email ?? ""
  const isAdmin = (session?.user as any)?.role === "admin"
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  const visibleNav = navigation.filter((item) => !item.adminOnly || isAdmin)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const AvatarDisplay = () => {
    if (avatarUrl) {
      return (
        <Image src={avatarUrl} alt={userName} width={32} height={32}
          className="h-8 w-8 rounded-full object-cover" unoptimized />
      )
    }
    return (
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span className="text-sm font-medium">{initials}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FolderLock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">VaultDrop</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link key={item.name} href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
                <AvatarDisplay />
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-border bg-popover shadow-lg py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <Link href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}>
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}>
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <hr className="my-1 border-border" />
                    <button onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-2 md:hidden">
            {visibleNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link key={item.name} href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Page content — no sidebar offset needed */}
      <main className="mx-auto max-w-screen-xl p-4 sm:p-6">{children}</main>
    </div>
  )
}
