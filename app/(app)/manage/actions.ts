"use server";

import "server-only";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireRole } from "@/lib/authorize";

type ActionResult<T extends Record<string, unknown> = {}> =
  | ({ success: true } & T)
  | { error: string | Record<string, string[]> };
  
function generateTempPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;

  const pick = (set: string) => set[crypto.randomInt(set.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const rest = Array.from({ length: 8 }, () => pick(all));

  return [...required, ...rest].sort(() => crypto.randomInt(3) - 1).join("");
}

const createAccountSchema = z.object({
  username: z.string().min(3).trim(),
  email: z.string().email().optional().or(z.literal("")),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "STAFF", "RECEPTIONIST"]),
});

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "RECEPTIONIST"]),
});

export async function listAccounts() {
  await requireRole("ADMIN");

  return db.account.findMany({
    select: {
      accountId: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createAccount(
  rawValues: unknown,
): Promise<ActionResult<{ accountId: number; tempPassword: string }>> {
  await requireRole("ADMIN");

  const parsed = createAccountSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  try {
    const account = await db.account.create({
      data: {
        username: data.username,
        email: data.email || null,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
      },
    });

    revalidatePath("/manage");
    return { success: true, accountId: account.accountId, tempPassword };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: { username: ["Username or email already taken"] } };
    }
    throw err;
  }
}

export async function deactivateAccount(accountId: number): Promise<ActionResult> {
  const session = await requireRole("ADMIN");
  const currentUserId = Number(session.user!.id);

  if (currentUserId === accountId) {
    return { error: "You can't deactivate your own account" };
  }

  await db.account.update({
    where: { accountId },
    data: { isActive: false },
  });

  revalidatePath("/manage");
  return { success: true };
}

export async function updateAccountRole(
  accountId: number,
  rawValues: unknown,
): Promise<ActionResult> {
  const session = await requireRole("ADMIN");
  const currentUserId = Number(session.user!.id);

  if (currentUserId === accountId) {
    return { error: "You can't change your own role" };
  }

  const parsed = updateRoleSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.account.update({
    where: { accountId },
    data: { role: parsed.data.role },
  });

  revalidatePath("/manage");
  return { success: true };
}

export async function reactivateAccount(accountId: number): Promise<ActionResult> {
  await requireRole("ADMIN");

  await db.account.update({
    where: { accountId },
    data: { isActive: true },
  });

  revalidatePath("/manage");
  return { success: true };
}

export async function resetPassword(
  accountId: number,
): Promise<ActionResult<{ tempPassword: string }>> {
  await requireRole("ADMIN");

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await db.account.update({
    where: { accountId },
    data: { password: hashedPassword },
  });

  revalidatePath("/manage");
  return { success: true, tempPassword };
}