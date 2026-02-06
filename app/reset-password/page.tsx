import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";

type ResetPasswordPageProps = {
  searchParams?: { token?: string };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token;

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 lg:flex-row lg:justify-between">
        <div className="mb-12 max-w-lg space-y-4 lg:mb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Set new password
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Choose a fresh password.
          </h1>
          <p className="text-muted-foreground">
            Make sure it&apos;s at least 6 characters long.
          </p>
        </div>
        <Card className="w-full max-w-md border border-slate-200/60 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">
              Update password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
