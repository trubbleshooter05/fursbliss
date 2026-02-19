import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateReferralCode } from "@/lib/auth-tokens";
import { normalizeEmailPreferences } from "@/lib/email-preferences";
import { EmailPreferencesForm } from "@/components/account/email-preferences-form";
import { AnimateIn } from "@/components/ui/animate-in";

type AccountPageProps = {
  searchParams?: {
    success?: string;
    session_id?: string;
    sync?: string;
  };
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const checkoutSuccess = searchParams?.success === "true";
  const checkoutSessionId =
    typeof searchParams?.session_id === "string" ? searchParams.session_id : null;

  // Fallback sync in case Stripe webhook is delayed/missed.
  if (checkoutSuccess && checkoutSessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
        expand: ["subscription"],
      });
      const checkoutCustomerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id ?? null;
      const sessionBelongsToUser =
        Boolean(checkoutCustomerId) && checkoutCustomerId === user.stripeCustomerId;

      if (sessionBelongsToUser && checkoutSession.subscription) {
        const subscription =
          typeof checkoutSession.subscription === "string"
            ? await stripe.subscriptions.retrieve(checkoutSession.subscription)
            : checkoutSession.subscription;
        const isActive = ["active", "trialing"].includes(subscription.status);
        const plan =
          subscription.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";

        if (isActive) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "premium",
              subscriptionId: subscription.id,
              subscriptionPlan: plan,
              subscriptionEndsAt: null,
            },
          });
        }
      }
    } catch (error) {
      console.error("Account subscription sync failed", error);
    }
  }

  const isPremium = user.subscriptionStatus === "premium";
  const billingLabel =
    user.subscriptionPlan === "yearly"
      ? "Billed yearly"
      : user.subscriptionPlan === "monthly"
        ? "Billed monthly"
        : "No active billing cycle";
  const syncStatus = searchParams?.sync;
  const syncMessage =
    syncStatus === "ok"
      ? "Subscription refreshed successfully."
      : syncStatus === "no_active"
        ? "No active Stripe subscription found for this account."
        : syncStatus === "missing_customer"
          ? "No Stripe customer is linked yet for this account."
          : syncStatus === "error"
            ? "Unable to refresh subscription right now. Please try again."
            : null;
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
        {syncMessage ? (
          <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {syncMessage}
          </p>
        ) : null}
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
                {isPremium
                  ? "Prepared before launch day"
                  : "Get notified when LOY-002 launches"}
              </span>
            </div>
            {isPremium ? <p className="text-xs text-muted-foreground">{billingLabel}</p> : null}
            {isPremium ? (
              <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
                <a href="/api/stripe/portal">Manage Subscription</a>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
                  <Link href="/pricing">Get prepared before launch day</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Free users get notified. Premium users get prepared.
                </p>
                <Button
                  variant="outline"
                  className="hover:scale-[1.02] transition-all duration-300"
                  asChild
                >
                  <a href="/api/stripe/sync-subscription">I already paid - refresh status</a>
                </Button>
              </div>
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
