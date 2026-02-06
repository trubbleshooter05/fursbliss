import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      subscriptionStatus: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    subscriptionStatus?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionStatus?: string;
    role?: string;
  }
}
