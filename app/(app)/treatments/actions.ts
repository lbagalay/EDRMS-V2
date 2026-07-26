"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireRole } from "@/lib/authorize";

type ActionResult<T extends Record<string, unknown> = {}> =
  | ({ success: true } & T)
  | { error: string | Record<string, string[]> };

const treatmentSchema = z.object({
  treatmentName: z.string().min(1, "Treatment name is required").trim(),
  treatmentFee: z.coerce.number().min(0, "Fee must be 0 or greater"),
});

export async function listTreatments() {
  await requireRole("ADMIN");

  return db.treatment.findMany({
    orderBy: { treatmentName: "asc" },
    select: {
      treatmentId: true,
      treatmentName: true,
      treatmentFee: true,
      isActive: true,
    },
  });
}

export async function createTreatment(rawValues: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");

  const parsed = treatmentSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.treatment.create({
    data: {
      treatmentName: parsed.data.treatmentName,
      treatmentFee: parsed.data.treatmentFee,
      isActive: true,
    },
  });

  revalidatePath("/treatments");
  return { success: true };
}

export async function updateTreatment(
  treatmentId: number,
  rawValues: unknown,
): Promise<ActionResult> {
  await requireRole("ADMIN");

  const parsed = treatmentSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.treatment.update({
    where: { treatmentId },
    data: {
      treatmentName: parsed.data.treatmentName,
      treatmentFee: parsed.data.treatmentFee,
    },
  });

  revalidatePath("/treatments");
  return { success: true };
}

export async function deactivateTreatment(treatmentId: number): Promise<ActionResult> {
  await requireRole("ADMIN");

  await db.treatment.update({
    where: { treatmentId },
    data: { isActive: false },
  });

  revalidatePath("/treatments");
  return { success: true };
}

export async function reactivateTreatment(treatmentId: number): Promise<ActionResult> {
  await requireRole("ADMIN");

  await db.treatment.update({
    where: { treatmentId },
    data: { isActive: true },
  });

  revalidatePath("/treatments");
  return { success: true };
}