"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authorize";
import { visitFormSchema } from "@/lib/validators/visit";
import { vitalSignsFormSchema } from "@/lib/validators/vital-signs";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function listTreatmentOptions() {
  await requireSession();
  return prisma.treatment.findMany({
    where: { isActive: true },
    orderBy: { treatmentName: "asc" },
    select: { treatmentId: true, treatmentName: true, treatmentFee: true },
  });
}

export async function createVisit(patientId: number, formData: FormData) {
  await requireSession();

  const treatmentIds = formData.getAll("treatmentIds").map(String);
  const parsed = visitFormSchema.safeParse({
    visitPurpose: formData.get("visitPurpose"),
    dateVisit: formData.get("dateVisit"),
    treatmentIds,
    prescription: formData.get("prescription") ?? "",
    notes: formData.get("notes") ?? "",
    additionalFees: formData.get("additionalFees") || 0,
    amountPaid: formData.get("amountPaid") || 0,
    discount: formData.get("discount") || 0,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;

  const treatments = await prisma.treatment.findMany({
    where: { treatmentId: { in: data.treatmentIds.map(Number) } },
    select: { treatmentId: true, treatmentFee: true },
  });

  if (treatments.length !== data.treatmentIds.length) {
    throw new Error("One or more selected treatments could not be found");
  }

  await prisma.$transaction(async (tx: TransactionClient) => {
    const visit = await tx.visit.create({
      data: {
        patientId,
        visitPurpose: data.visitPurpose,
        dateVisit: new Date(data.dateVisit),
        additionalFees: data.additionalFees,
        amountPaid: data.amountPaid,
        discount: data.discount,
        prescription: data.prescription || null,
        notes: data.notes || null,
      },
    });

    await tx.treatmentRendered.createMany({
      data: treatments.map((t: (typeof treatments)[number]) => ({
        patientId,
        visitId: visit.visitId,
        treatmentId: t.treatmentId,
        feeAtTime: t.treatmentFee,
      })),
    });
  });

  revalidatePath(`/patients/${patientId}`);
}

export async function addVitalSigns(visitId: number, patientId: number, formData: FormData) {
  await requireSession();

  const parsed = vitalSignsFormSchema.safeParse({
    temperature: formData.get("temperature"),
    pulseRate: formData.get("pulseRate"),
    systolicBp: formData.get("systolicBp"),
    diastolicBp: formData.get("diastolicBp"),
    timeTaken: formData.get("timeTaken"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;
  const [hours, minutes] = data.timeTaken.split(":").map(Number);

  await prisma.vitalSigns.create({
    data: {
      visitId,
      temperature: data.temperature,
      pulseRate: data.pulseRate,
      systolicBp: data.systolicBp,
      diastolicBp: data.diastolicBp,
      timeTaken: new Date(1970, 0, 1, hours, minutes),
    },
  });

  revalidatePath(`/patients/${patientId}/visits/${visitId}`);
}