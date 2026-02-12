import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/account?sync=missing_customer", process.env.NEXT_PUBLIC_APP_URL));
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 5,
      status: "all",
    });

    const activeSubscription = subscriptions.data.find((subscription) =>
      ["active", "trialing"].includes(subscription.status)
    );

    if (activeSubscription) {
      const plan =
        activeSubscription.items.data[0]?.price?.recurring?.interval === "year"
          ? "yearly"
          : "monthly";

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "premium",
          subscriptionId: activeSubscription.id,
          subscriptionPlan: plan,
          subscriptionEndsAt: null,
        },
      });

      return NextResponse.redirect(new URL("/account?sync=ok", process.env.NEXT_PUBLIC_APP_URL));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "free",
        subscriptionPlan: null,
        subscriptionEndsAt: null,
      },
    });

    return NextResponse.redirect(new URL("/account?sync=no_active", process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error("Stripe subscription sync failed", error);
    return NextResponse.redirect(new URL("/account?sync=error", process.env.NEXT_PUBLIC_APP_URL));
  }
}
