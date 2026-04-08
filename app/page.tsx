import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Shield, Cloud, Lock, Users, FileText, Activity, ArrowRight, CheckCircle2, Zap, Eye } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">SecureShare</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#overview" className="text-sm text-muted-foreground transition-colors hover:text-primary">Overview</a>
            <a href="#challenges" className="text-sm text-muted-foreground transition-colors hover:text-primary">Challenges</a>
            <a href="#goals" className="text-sm text-muted-foreground transition-colors hover:text-primary">Goals</a>
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-primary">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Sign in
            </Link>
            <Link href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(82,130,255,0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-3.5 w-3.5" /> Secure · Fast · Reliable
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Share Files with Confidence
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              A modern cloud platform for secure file sharing with granular access controls, OTP protection, and real-time activity tracking.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-white px-6 text-sm font-medium transition-colors hover:bg-accent">
                Sign In
              </Link>
              <Link href="/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-6 text-sm font-medium transition-colors hover:bg-accent">
                <Shield className="h-4 w-4 text-primary" /> Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-y border-border bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Cloud, label: "Cloud Storage", desc: "Scalable infrastructure for all file types" },
              { icon: Lock, label: "Encrypted Sharing", desc: "Password & OTP protected access" },
              { icon: Users, label: "Access Control", desc: "Per-user permission management" },
              { icon: Activity, label: "Activity Logs", desc: "Full audit trail for every action" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-5 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="mt-3 text-muted-foreground">Understanding the context and environment</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Enterprise File Sharing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Organizations handle sensitive data daily — from financial records to proprietary research. Traditional sharing methods lack the security controls needed for modern teams.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Distributed Teams</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Remote and hybrid work models require secure collaboration tools that work across locations and devices while maintaining strict access controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section id="challenges" className="scroll-mt-20 border-t border-border bg-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Challenges</h2>
            <p className="mt-3 text-muted-foreground">Key problems this platform solves</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { n: "01", title: "Data Breach Risks", body: "Unsecured file sharing exposes organizations to breaches. Consumer cloud services lack enterprise-grade security controls." },
              { n: "02", title: "No Visibility", body: "IT teams struggle to track who accessed what and when. Without audit logs, compliance reporting becomes error-prone." },
              { n: "03", title: "Complex Permissions", body: "Managing access rights across users and files becomes unwieldy. Overly permissive access creates security vulnerabilities." },
              { n: "04", title: "Poor User Experience", body: "Security tools often sacrifice usability. Users bypass cumbersome systems, defeating security measures entirely." },
            ].map((item) => (
              <div key={item.n} className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{item.n}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section id="goals" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
            <p className="mt-3 text-muted-foreground">What we set out to achieve</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "End-to-end encryption for all file transfers and storage",
              "Granular role-based access control per user",
              "Comprehensive audit logging for every file action",
              "Secure OTP-based file sharing between users",
              "Intuitive UI that doesn't compromise on security",
              "Real-time collaboration with full access tracking",
              "Admin dashboard with complete platform oversight",
              "Password-protected files with per-file controls",
            ].map((goal) => (
              <div key={goal} className="flex items-start gap-3 rounded-lg border border-border bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border bg-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Features</h2>
            <p className="mt-3 text-muted-foreground">Everything included in the platform</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: "File Management", items: ["Drag-and-drop upload", "Preview any file type", "Bulk operations"] },
              { icon: Users, title: "Access Control", items: ["Per-user permissions", "Read / Download / Share / Delete", "Admin override"] },
              { icon: Activity, title: "Activity Monitoring", items: ["Real-time action logs", "Filter by user or action", "Admin-only view"] },
              { icon: Lock, title: "Secure Sharing", items: ["OTP-protected sharing", "Expiring share links", "Email invitations"] },
              { icon: Cloud, title: "Cloud Storage", items: ["Cloudinary integration", "Auto-scaling storage", "Instant file delivery"] },
              { icon: Eye, title: "File Preview", items: ["Images, video, audio", "PDF & DOCX viewer", "Plain text rendering"] },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{card.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight text-white">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Join thousands of teams sharing files securely. No credit card required.
            </p>
            <Link href="/signup"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-primary transition-colors hover:bg-white/90">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SecureShare</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 SecureShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
