import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-slate-100">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 lg:flex-row lg:justify-between">
        <div className="mb-12 max-w-lg space-y-4 lg:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Sign in to continue tracking your pet&apos;s health.
          </h1>
          <p className="text-muted-foreground">
            Access your dashboard, log daily health, and unlock AI insights with
            FursBliss.
          </p>
        </div>
        <Card className="w-full max-w-md border border-slate-200/60 bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />
            <Link
              href="/forgot-password"
              className="text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Forgot your password?
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              New to FursBliss?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
