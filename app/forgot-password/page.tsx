import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 lg:flex-row lg:justify-between">
        <div className="mb-12 max-w-lg space-y-4 lg:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Password reset
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Let&apos;s get you back in.
          </h1>
          <p className="text-muted-foreground">
            We&apos;ll email you a secure link to reset your password.
          </p>
        </div>
        <Card className="w-full max-w-md border border-slate-200/60 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">
              Reset password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ForgotPasswordForm />
            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
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
