import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/",
    error: "/",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  adapter: PrismaAdapter(prisma) as any,

  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username as string,
          },
          include: {
            role: true,
          },
        });

        if (!user || !user.password) return null;

        const isMatched = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isMatched) return null;

        return {
          id: user.id,
          username: user.username ?? "",
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          role: user.role?.name ?? "USER",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.role = user.role; // ✅ Important
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.name =
          `${token.firstName ?? ""} ${token.lastName ?? ""}`.trim();
        session.user.email = token.email;
        session.user.role = token.role; // ✅ Important
      }

      return session;
    },
  },
});