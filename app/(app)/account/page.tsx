import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateReferralCode } from "@/lib/auth-tokens";
import { normalizeEmailPreferences } from "@/lib/email-preferences";
import { EmailPreferencesForm } from "@/components/account/email-preferences-form";

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const isPremium = user.subscriptionStatus === "premium";
  const emailPreferences = normalizeEmailPreferences(user.emailPreferences);
  const referralCode =
    user.referralCode ??
    (
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: generateReferralCode() },
      })
    ).referralCode;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and subscription details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-medium text-slate-900">
                {user.name ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium text-slate-900">{user.email}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/forgot-password">Change password</Link>
            </Button>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">Referral code</p>
              <p className="mt-1 text-base font-semibold text-emerald-600">
                {referralCode}
              </p>
              <p className="mt-2 text-xs">
                Invite a friend for one free premium month each.
              </p>
              <p className="mt-2 text-xs">
                Share link: {`${process.env.NEXT_PUBLIC_APP_URL}/invite/${referralCode}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Premium" : "Free"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isPremium ? "Unlimited access" : "Basic tracking"}
              </span>
            </div>
            {isPremium ? (
              <Button asChild>
                <a href="/api/stripe/portal">Manage Subscription</a>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/pricing">Upgrade to Premium</Link>
              </Button>
            )}
            <div className="space-y-2">
              <Button variant="outline" asChild>
                <a href="/api/exports/logs">Export logs CSV</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pets">Download pet report (PDF) from My Pets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailPreferencesForm initialPreferences={emailPreferences} />
        </CardContent>
      </Card>
    </div>
  );
}
