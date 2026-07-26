"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma as db } from "@/lib/db";

const signupSchema = z.object({
  username: z.string().min(3).trim(),
  password: z.string().min(8)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function signUp(formData: unknown) {
  if (process.env.ALLOW_PUBLIC_SIGNUP !== "true") {
    return { error: "Public signup is disabled" };
  }

  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.account.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) {
    return { error: "Username already taken" };
  }

  const accountCount = await db.account.count();
  const role = accountCount === 0 ? "ADMIN" : "STAFF";

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await db.account.create({
    data: {
      username: parsed.data.username,
      password: hashedPassword,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      role,
      isActive: true,
    },
  });

  return { success: true };
}