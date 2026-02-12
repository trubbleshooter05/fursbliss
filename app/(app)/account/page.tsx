import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateReferralCode } from "@/lib/auth-tokens";
import { normalizeEmailPreferences } from "@/lib/email-preferences";
import { EmailPreferencesForm } from "@/components/account/email-preferences-form";
import { AnimateIn } from "@/components/ui/animate-in";

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
      <AnimateIn className="space-y-2">
        <h1 className="font-display text-4xl tracking-[-0.02em] text-foreground">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and subscription details.
        </p>
      </AnimateIn>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AnimateIn>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Profile</CardTitle>
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
            <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
              <Link href="/forgot-password">Change password</Link>
            </Button>
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">Referral code</p>
              <p className="stat-number mt-1 text-base font-semibold text-primary">
                {referralCode}
              </p>
              <p className="mt-2 text-xs">
                Invite a friend for one free premium month each.
              </p>
              <p className="mt-2 text-xs">
                Share link: {`${process.env.NEXT_PUBLIC_APP_URL}/invite/${referralCode}`}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 hover:scale-[1.02] transition-all duration-300"
                asChild
              >
                <Link href="/referrals">Open referral dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </AnimateIn>

        <AnimateIn delay={0.1}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Subscription</CardTitle>
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
              <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
                <a href="/api/stripe/portal">Manage Subscription</a>
              </Button>
            ) : (
              <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
                <Link href="/pricing">Upgrade to Premium</Link>
              </Button>
            )}
            <div className="space-y-2">
              <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
                <a href="/api/exports/logs">Export logs CSV</a>
              </Button>
              <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
                <Link href="/pets">Download pet report (PDF) from My Pets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </AnimateIn>
      </div>

      <AnimateIn delay={0.2}>
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Email preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailPreferencesForm initialPreferences={emailPreferences} />
        </CardContent>
      </Card>
      </AnimateIn>
    </div>
  );
}
