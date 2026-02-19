import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscriptionStatus } from "@/lib/subscription";
import { generateReferralCode } from "@/lib/auth-tokens";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";
import { enrollUserInWelcomeSequence } from "@/lib/email/sequence";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: getEffectiveSubscriptionStatus({
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionEndsAt: user.subscriptionEndsAt,
          }),
          role: user.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account?.provider === "google" && token.email) {
        const oauthUser = await upsertGoogleUser({
          email: token.email,
          name: user?.name ?? token.name,
          image: user?.image ?? (typeof token.picture === "string" ? token.picture : null),
        });
        token.id = oauthUser.id;
        token.sub = oauthUser.id;
        token.subscriptionStatus = getEffectiveSubscriptionStatus({
          subscriptionStatus: oauthUser.subscriptionStatus,
          subscriptionPlan: oauthUser.subscriptionPlan,
          subscriptionEndsAt: oauthUser.subscriptionEndsAt,
        });
        token.role = oauthUser.role ?? "user";
        return token;
      }

      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.subscriptionStatus = user.subscriptionStatus ?? "free";
        token.role = user.role ?? "user";
        return token;
      }

      const userId = (token.sub as string | undefined) ?? (token.id as string | undefined);
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true, role: true },
        });
        token.subscriptionStatus = getEffectiveSubscriptionStatus({
          subscriptionStatus: dbUser?.subscriptionStatus,
          subscriptionPlan: dbUser?.subscriptionPlan,
          subscriptionEndsAt: dbUser?.subscriptionEndsAt,
        });
        token.role = dbUser?.role ?? "user";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.error = token.error as string | undefined;
        session.user.id = (token.sub as string | undefined) ?? (token.id as string);
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

async function upsertGoogleUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const normalizedEmail = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    console.info("[Meta CAPI] Google OAuth existing user; skipping CompleteRegistration CAPI", {
      email: input.email.toLowerCase(),
    });
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: input.name ?? existing.name,
        image: input.image ?? existing.image,
        emailVerified: existing.emailVerified ?? new Date(),
      },
      select: {
        id: true,
        role: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionEndsAt: true,
      },
    });
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
  const createdUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: input.name ?? null,
      image: input.image ?? null,
      emailVerified: new Date(),
      password: placeholderPassword,
      referralCode: generateReferralCode(),
      subscriptionStatus: "free",
      role: "user",
    },
    select: {
      id: true,
      role: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true,
    },
  });

  console.info("[Meta CAPI] Google OAuth new user created; sending CompleteRegistration", {
    email: normalizedEmail,
  });
  const requestHeaders = new Headers(headers());
  const callbackRequest = new Request(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"}/api/auth/callback/google`,
    {
      headers: requestHeaders,
    }
  );
  await sendMetaConversionEvent({
    eventName: "CompleteRegistration",
    email: input.email,
    request: callbackRequest,
  });

  await prisma.quizSubmission.updateMany({
    where: { email: normalizedEmail, userId: null },
    data: { userId: createdUser.id },
  });
  const hasLinkedQuiz =
    (await prisma.quizSubmission.count({
      where: { userId: createdUser.id },
    })) > 0;
  if (hasLinkedQuiz) {
    await enrollUserInWelcomeSequence(createdUser.id);
  }

  return createdUser;
}
