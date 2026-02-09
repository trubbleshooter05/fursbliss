import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscriptionStatus } from "@/lib/subscription";

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
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
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
