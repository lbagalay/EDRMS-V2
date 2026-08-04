import type { Role } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { AdapterUser as DefaultAdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      role: Role;
      firstName: string | null | undefined;
      lastName: string | null | undefined;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultAdapterUser {
    role: Role;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
  }
}
