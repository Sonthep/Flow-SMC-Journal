import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_GOOGLE_SECRET",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "MOCK_GITHUB_ID",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "MOCK_GITHUB_SECRET",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub;
      }
      return session;
    },
  },
  debug: true,
};
