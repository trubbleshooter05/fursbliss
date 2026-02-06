import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-slate-100">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 lg:flex-row lg:justify-between">
        <div className="mb-12 max-w-lg space-y-4 lg:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Get started
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Create your FursBliss account in minutes.
          </h1>
          <p className="text-muted-foreground">
            Start tracking daily health, schedule logs, and unlock AI supplement
            recommendations today.
          </p>
        </div>
        <Card className="w-full max-w-md border border-slate-200/60 bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignupForm />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
