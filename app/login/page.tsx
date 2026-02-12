import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AnimateIn } from "@/components/ui/animate-in";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <AnimateIn className="relative overflow-hidden rounded-3xl border border-border">
          <Image
            src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=1400&q=80"
            alt="Dog owner with senior dog"
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2B2B]/88 to-[#0D6E6E]/68" />
          <div className="relative space-y-4 p-6 text-white sm:p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Welcome back
          </p>
          <h1 className="font-display text-3xl tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Sign in to continue tracking your pet&apos;s health.
          </h1>
          <p className="text-white/80">
            Access your dashboard, log daily health, and unlock AI insights with
            FursBliss.
          </p>
          </div>
        </AnimateIn>
        <AnimateIn delay={0.1}>
        <Card className="w-full max-w-md justify-self-center rounded-3xl border-border bg-card shadow-xl">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-foreground">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />
            <Link
              href="/forgot-password"
              className="text-center text-sm font-semibold text-primary hover:text-primary/80"
            >
              Forgot your password?
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              New to FursBliss?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:text-primary/80"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
        </AnimateIn>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
