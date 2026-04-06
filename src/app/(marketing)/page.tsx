import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-[var(--brand-primary)]">OKR Tracker</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Align your team around
          <br />
          <span className="text-[var(--brand-primary)]">what matters most</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          OKR Tracker helps your organization set, track, and achieve Objectives and Key Results
          — from startups to enterprises, all in one place.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Start for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { title: 'Multi-org', desc: 'Manage multiple organizations from a single account.' },
              { title: 'Whitelabel', desc: 'Customize branding with your colors and logo.' },
              { title: 'Real-time', desc: 'Track progress live with check-ins and activity feeds.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-background p-6 shadow-sm">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} OKR Tracker. All rights reserved.
      </footer>
    </main>
  )
}
