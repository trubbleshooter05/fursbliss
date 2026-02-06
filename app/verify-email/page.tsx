import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";

type VerifyEmailPageProps = {
  searchParams?: { token?: string };
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams?.token;
  let success = false;

  if (token) {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (record && record.expiresAt > new Date()) {
      await prisma.user.update({
        where: { email: record.email },
        data: { emailVerified: new Date() },
      });
      await prisma.verificationToken.delete({ where: { token } });
      success = true;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16">
        <Card className="w-full max-w-xl border border-slate-200/60 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">
              {success ? "Email verified" : "Verification failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {success ? (
              <p>Your email is confirmed. You can now sign in.</p>
            ) : (
              <p>That verification link is invalid or expired.</p>
            )}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
