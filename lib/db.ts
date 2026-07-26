import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaClient: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set before using Prisma.");
    }

    const dbUrl = new URL(process.env.DATABASE_URL);

    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: dbUrl.port ? Number(dbUrl.port) : 3306,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ""),
    });

    prismaClient = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    });
  }

  return prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
  apply(_target, _thisArg, args) {
    return Reflect.apply(getPrismaClient() as never, _thisArg, args);
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}