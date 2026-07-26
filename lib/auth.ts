import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

function mapAccountToAdapterUser(account: {
  accountId: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}): AdapterUser {
  return {
    id: account.accountId.toString(),
    name: [account.firstName, account.lastName].filter(Boolean).join(" ") || account.username,
    email: account.email ?? account.username,
    emailVerified: null,
    image: null,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: {
    async createUser(user) {
      const createdUser = await prisma.account.create({
        data: {
          username: user.email ? `user-${user.email}` : `user-${Date.now()}`,
          email: user.email ?? null,
          password: "",
          firstName: user.name?.split(" ")[0] ?? null,
          lastName: user.name?.split(" ").slice(1).join(" ") ?? null,
        },
      });

      return mapAccountToAdapterUser(createdUser);
    },
    async getUser(id) {
      const user = await prisma.account.findUnique({
        where: { accountId: Number(id) },
      });

      if (!user) {
        return null;
      }

      return mapAccountToAdapterUser(user);
    },
    async getUserByEmail(email) {
      const user = await prisma.account.findUnique({ where: { email } });

      if (!user) {
        return null;
      }

      return mapAccountToAdapterUser(user);
    },
    async getUserByAccount() {
      return null;
    },
    async updateUser(user) {
      if (!user.id) {
        throw new Error("User id is required");
      }

      const updatedUser = await prisma.account.update({
        where: { accountId: Number(user.id) },
        data: {
          firstName: user.name?.split(" ")[0] ?? undefined,
          lastName: user.name?.split(" ").slice(1).join(" ") || undefined,
          email: user.email ?? undefined,
        },
      });

      return mapAccountToAdapterUser(updatedUser);
    },
    async deleteUser(userId) {
      await prisma.account.delete({ where: { accountId: Number(userId) } });
      return undefined;
    },
    async linkAccount(account) {
      return account as AdapterAccount;
    },
    async unlinkAccount() {
      return undefined;
    },
    async createSession(session) {
      const createdSession = await prisma.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: Number(session.userId),
          expires: session.expires,
        },
      });

      return {
        sessionToken: createdSession.sessionToken,
        userId: createdSession.userId.toString(),
        expires: createdSession.expires,
      } satisfies AdapterSession;
    },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session) {
        return null;
      }

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId.toString(),
          expires: session.expires,
        } satisfies AdapterSession,
        user: mapAccountToAdapterUser(session.user),
      };
    },
    async updateSession(session) {
      const updatedSession = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: {
          expires: session.expires,
        },
      });

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId.toString(),
        expires: updatedSession.expires,
      } satisfies AdapterSession;
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
      return undefined;
    },
  } satisfies Adapter,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const account = await prisma.account.findFirst({
          where: {
            OR: [
              { username: String(credentials.username) },
              { email: String(credentials.username) },
            ],
          },
          select: {
            accountId: true,
            username: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        });

        if (!account || !account.isActive) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          String(credentials.password),
          account.password,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: account.accountId.toString(),
          name: [account.firstName, account.lastName].filter(Boolean).join(" ") || account.username,
          email: account.email ?? account.username,
          role: account.role,
          firstName: account.firstName,
          lastName: account.lastName,
        };
      },
    }),
  ],
});