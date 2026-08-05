"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authorize";
import { toothConditionFormSchema, toothTreatmentFormSchema } from "@/lib/validators/tooth";

export async function upsertToothCondition(patientId: number, formData: FormData) {
  await requireSession();

  const parsed = toothConditionFormSchema.safeParse({
    toothNumber: formData.get("toothNumber"),
    condition: formData.get("condition"),
    conditionNote: formData.get("conditionNote") ?? "",
    dentistNotes: formData.get("dentistNotes") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;

  await prisma.toothRecord.upsert({
    where: { patientId_toothNumber: { patientId, toothNumber: data.toothNumber } },
    create: {
      patientId,
      toothNumber: data.toothNumber,
      condition: data.condition,
      conditionNote: data.conditionNote || null,
      dentistNotes: data.dentistNotes || null,
    },
    update: {
      condition: data.condition,
      conditionNote: data.conditionNote || null,
      dentistNotes: data.dentistNotes || null,
    },
  });

  revalidatePath(`/patients/${patientId}/odontogram`);
}

export async function addToothTreatment(patientId: number, formData: FormData) {
  await requireSession();

  const parsed = toothTreatmentFormSchema.safeParse({
    toothNumber: formData.get("toothNumber"),
    treatmentId: formData.get("treatmentId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;

  const treatment = await prisma.treatment.findUnique({
    where: { treatmentId: Number(data.treatmentId) },
    select: { treatmentId: true, treatmentFee: true },
  });

  if (!treatment) {
    throw new Error("Selected treatment could not be found");
  }

  await prisma.treatmentRendered.create({
    data: {
      patientId,
      toothNumber: data.toothNumber,
      treatmentId: treatment.treatmentId,
      feeAtTime: treatment.treatmentFee,
      status: data.status,
    },
  });

  revalidatePath(`/patients/${patientId}/odontogram`);
}
