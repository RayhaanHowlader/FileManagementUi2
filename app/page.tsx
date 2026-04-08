import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { FolderLock, Cloud, Lock, Users, FileText, Activity, ArrowRight, CheckCircle2, Database, KeyRound, SlidersHorizontal, ScrollText, Share2, Gauge, BadgeCheck, AlertTriangle, Eye, Settings2, MousePointerClick } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation — unchanged */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FolderLock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight font-sans">VaultDrop</span>
          </div>
          <nav />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — split layout, left-aligned */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: text */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                v2.0 — Now with OTP file sharing
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                Secure<br />File<br />Sharing.
              </h1>
              <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
                Enterprise-grade file management with granular access controls, OTP verification, and full audit trails. Built for teams that can't afford a breach.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Start for Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  Sign In
                </Link>
                <Link href="/admin" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  <FolderLock className="h-4 w-4" /> Admin Login
                </Link>
              </div>
            </div>

            {/* Right: stats table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Platform Overview
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { icon: Database,     key: "Storage Backend", val: "Cloudinary CDN" },
                    { icon: KeyRound,     key: "Auth Method",     val: "JWT + OTP Verification" },
                    { icon: Lock,         key: "Encryption",      val: "bcrypt + HTTPS/TLS" },
                    { icon: SlidersHorizontal, key: "Access Model", val: "Role-Based (RBAC)" },
                    { icon: ScrollText,   key: "Audit Logs",      val: "Full activity trail" },
                    { icon: Share2,       key: "File Sharing",    val: "OTP-protected links" },
                    { icon: Gauge,        key: "Uptime Target",   val: "99.9% SLA" },
                    { icon: BadgeCheck,   key: "Compliance",      val: "GDPR-ready" },
                  ].map(({ icon: Icon, key, val }, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-muted-foreground w-1/2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {key}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Features — horizontal table row layout */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Core Capabilities</div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left font-semibold">Feature</th>
                  <th className="px-6 py-3 text-left font-semibold">Description</th>
                  <th className="px-6 py-3 text-left font-semibold hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { icon: Cloud, name: "Cloud Storage", desc: "Secure Cloudinary-backed infrastructure for all file types", status: "Live" },
                  { icon: Lock, name: "End-to-End Encryption", desc: "bcrypt hashing + TLS in transit for every file and credential", status: "Live" },
                  { icon: Users, name: "Access Control", desc: "Granular RBAC with per-user read/write/delete/share permissions", status: "Live" },
                  { icon: Activity, name: "Activity Tracking", desc: "Immutable audit log of every upload, share, and access event", status: "Live" },
                ].map(({ icon: Icon, name, desc, status }, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{desc}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />{status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Scenario — side-by-side with large numbers */}
      <section id="scenario" className="scroll-mt-20 border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">01 / Scenario</div>
              <h2 className="text-3xl font-bold tracking-tight">Why this exists</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Organizations handle sensitive data daily. Traditional sharing methods — email attachments, consumer cloud drives — weren't built for compliance or auditability.
              </p>
            </div>
            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background mb-4">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="text-5xl font-bold tracking-tight">4.45<span className="text-2xl">M</span></div>
                <div className="mt-1 text-xs text-muted-foreground uppercase tracking-widest">Avg. breach cost (USD)</div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Enterprise environments handle financial records, IP, and PII daily. One misconfigured share can cost millions.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-5xl font-bold tracking-tight">83<span className="text-2xl">%</span></div>
                <div className="mt-1 text-xs text-muted-foreground uppercase tracking-widest">Breaches involve humans</div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Distributed teams sharing files across locations need tools that enforce security without adding friction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem — numbered table */}
      <section id="problem" className="scroll-mt-20 border-b border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">02 / Problem Statement</div>
            <h2 className="text-3xl font-bold tracking-tight">Challenges we solve</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left font-semibold w-12">#</th>
                  <th className="px-6 py-3 text-left font-semibold">Problem</th>
                  <th className="px-6 py-3 text-left font-semibold hidden sm:table-cell">Impact</th>
                  <th className="px-6 py-3 text-left font-semibold hidden lg:table-cell">Our Solution</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    icon: AlertTriangle, n: "01", problem: "Data Breach Risks",
                    impact: "Avg. $4.45M per incident",
                    solution: "Encrypted storage + OTP-gated sharing"
                  },
                  {
                    icon: Eye, n: "02", problem: "Lack of Visibility",
                    impact: "Failed compliance audits",
                    solution: "Immutable activity logs with filters"
                  },
                  {
                    icon: Settings2, n: "03", problem: "Complex Permissions",
                    impact: "Overprivileged access",
                    solution: "Granular RBAC per user per file"
                  },
                  {
                    icon: MousePointerClick, n: "04", problem: "UX Friction",
                    impact: "Users bypass security tools",
                    solution: "Clean UI that doesn't sacrifice security"
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{row.n}</td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <row.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {row.problem}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{row.impact}</td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{row.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Objectives — two-column checklist */}
      <section id="objectives" className="scroll-mt-20 border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">03 / Objectives</div>
              <h2 className="text-3xl font-bold tracking-tight">Goals &amp; success criteria</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Eight measurable objectives define what success looks like for this platform.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      "Implement end-to-end encryption for all file transfers and storage",
                      "Provide granular role-based access control (RBAC) system",
                      "Create comprehensive audit logging for compliance requirements",
                      "Enable secure file sharing with OTP verification",
                      "Build intuitive UI that doesn't compromise security",
                      "Support real-time collaboration with access tracking",
                      "Ensure 99.9% uptime with redundant cloud infrastructure",
                      "Achieve SOC 2 Type II and GDPR compliance certification",
                    ].map((obj, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 w-10 text-muted-foreground text-xs font-mono">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                            <span>{obj}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables — table with sub-items */}
      <section id="deliverables" className="scroll-mt-20 border-b border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">04 / Deliverables</div>
            <h2 className="text-3xl font-bold tracking-tight">What we deliver</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left font-semibold">Module</th>
                  <th className="px-6 py-3 text-left font-semibold hidden sm:table-cell">Description</th>
                  <th className="px-6 py-3 text-left font-semibold">Includes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    icon: FileText, name: "File Management",
                    desc: "Upload, organize, and manage all file types",
                    items: ["Drag-and-drop upload", "File versioning", "Bulk operations"],
                  },
                  {
                    icon: Users, name: "Access Control Panel",
                    desc: "User and role management with fine-grained permissions",
                    items: ["Role-based permissions", "Team management", "Permission inheritance"],
                  },
                  {
                    icon: Activity, name: "Activity Monitoring",
                    desc: "Real-time logs with filters and exportable reports",
                    items: ["Real-time logs", "Advanced filtering", "Export reports"],
                  },
                  {
                    icon: Lock, name: "Secure Sharing",
                    desc: "OTP-verified links with expiry and download limits",
                    items: ["OTP verification", "Expiring links", "Download limits"],
                  },
                  {
                    icon: Cloud, name: "Cloud Infrastructure",
                    desc: "Scalable Cloudinary storage with auto-backups",
                    items: ["Auto-scaling", "Daily backups", "Multi-region"],
                  },
                ].map(({ icon: Icon, name, desc, items }, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium whitespace-nowrap">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell max-w-xs">{desc}</td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1">
                        {items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-1 w-1 rounded-full bg-foreground shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">Ready to secure your data?</h2>
              <p className="mt-3 text-primary-foreground/70 text-sm leading-relaxed">
                Start sharing files securely with your team today. No credit card required for the free tier.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-background/90">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FolderLock className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold font-sans">VaultDrop</span>
            </div>
            <p className="text-sm text-muted-foreground">2024 VaultDrop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
