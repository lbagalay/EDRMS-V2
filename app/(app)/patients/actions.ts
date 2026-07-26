"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authorize";
import { patientFormSchema } from "@/lib/validators/patient";

export async function createPatient(formData: FormData) {
  await requireSession();

  const values = Object.fromEntries(formData.entries());
  const parsed = patientFormSchema.safeParse({
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName,
    birthdate: values.birthdate,
    sex: values.sex,
    contactNumber: values.contactNumber,
    address: values.address,
    email: values.email,
    medicalAlerts: values.medicalAlerts,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;

  await prisma.patient.create({
    data: {
      lastName: data.lastName,
      firstName: data.firstName,
      middleName: data.middleName || null,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      sex: data.sex as never,
      contactNumber: data.contactNumber || null,
      email: data.email || null,
      address: data.address || null,
      medicalAlerts: data.medicalAlerts || null,
    },
  });

  revalidatePath("/patients");
  redirect("/patients");
}

export async function archivePatient(patientId: number) {
  await requireSession();

  await prisma.patient.update({
    where: { patientId },
    data: { isDeleted: true },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
}

export async function unarchivePatient(patientId: number) {
  await requireSession();

  await prisma.patient.update({
    where: { patientId },
    data: { isDeleted: false },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
}