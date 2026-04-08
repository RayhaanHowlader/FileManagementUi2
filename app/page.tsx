import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Shield, Cloud, Lock, Users, FileText, Activity, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">SecureShare</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#scenario" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Scenario
            </a>
            <a href="#problem" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Problem
            </a>
            <a href="#objectives" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Objectives
            </a>
            <a href="#deliverables" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Deliverables
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Secure Cloud Data Sharing System
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              Share files securely with advanced encryption, granular access controls, and comprehensive activity tracking. Built for teams that prioritize security.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cloud className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Cloud Storage</h3>
                <p className="mt-1 text-sm text-muted-foreground">Secure cloud infrastructure for all your files</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">End-to-End Encryption</h3>
                <p className="mt-1 text-sm text-muted-foreground">Military-grade encryption for data protection</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Access Control</h3>
                <p className="mt-1 text-sm text-muted-foreground">Granular permissions and role management</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Activity Tracking</h3>
                <p className="mt-1 text-sm text-muted-foreground">Complete audit trail for all actions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Section */}
      <section id="scenario" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Scenario</h2>
            <p className="mt-4 text-muted-foreground">Understanding the context and environment</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                <FileText className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Enterprise Environment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Organizations handle sensitive data daily, from financial records to proprietary research. Traditional file sharing methods lack the security controls needed for modern compliance requirements.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <Users className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Distributed Teams</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Remote and hybrid work models require secure collaboration tools that work across locations, devices, and time zones while maintaining strict access controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="scroll-mt-20 border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Problem Statement</h2>
            <p className="mt-4 text-muted-foreground">Challenges we aim to solve</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-destructive/20 bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">1</span>
                Data Breach Risks
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Unsecured file sharing exposes organizations to data breaches, costing an average of $4.45 million per incident. Traditional email and consumer cloud services lack enterprise-grade security.
              </p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">2</span>
                Lack of Visibility
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                IT administrators struggle to track who accessed what data and when. Without comprehensive audit logs, compliance reporting becomes manual and error-prone.
              </p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">3</span>
                Complex Permission Management
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Managing access rights across multiple users, teams, and files becomes unwieldy. Overly permissive access or stale permissions create security vulnerabilities.
              </p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold">4</span>
                User Experience Friction
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Security tools often sacrifice usability for protection. Users circumvent cumbersome systems, defeating security measures and increasing risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Objectives</h2>
            <p className="mt-4 text-muted-foreground">Our goals and success criteria</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              "Implement end-to-end encryption for all file transfers and storage",
              "Provide granular role-based access control (RBAC) system",
              "Create comprehensive audit logging for compliance requirements",
              "Enable secure file sharing with OTP verification",
              "Build intuitive user interface that doesn't compromise security",
              "Support real-time collaboration with access tracking",
              "Ensure 99.9% uptime with redundant cloud infrastructure",
              "Achieve SOC 2 Type II and GDPR compliance certification"
            ].map((objective, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-chart-2" />
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section id="deliverables" className="scroll-mt-20 border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Deliverables</h2>
            <p className="mt-4 text-muted-foreground">What we will deliver</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">File Management System</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete file upload, download, and organization system with folder hierarchy, tagging, and search capabilities.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Drag-and-drop upload
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  File versioning
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Bulk operations
                </li>
              </ul>
            </div>
            <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Access Control Panel</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprehensive user and role management with fine-grained permission controls and team organization.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Role-based permissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Team management
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Permission inheritance
                </li>
              </ul>
            </div>
            <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Activity Monitoring</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Real-time activity tracking with detailed logs, filters, and exportable reports for compliance audits.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Real-time logs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Advanced filtering
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Export reports
                </li>
              </ul>
            </div>
            <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Secure Sharing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share files securely with OTP verification, expiring links, and customizable access permissions.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  OTP verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Expiring links
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Download limits
                </li>
              </ul>
            </div>
            <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Cloud Infrastructure</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Scalable, redundant cloud storage with automatic backups and disaster recovery capabilities.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Auto-scaling
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Daily backups
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Multi-region
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
              Ready to secure your data?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Start sharing files securely with your team today. No credit card required for the free tier.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
            >
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SecureShare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 SecureShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
