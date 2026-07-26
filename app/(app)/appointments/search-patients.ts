"use server";

import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function searchPatients(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!query.trim()) {
    return [];
  }

  return db.patient.findMany({
    where: {
      isDeleted: false,
      OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }],
    },
    select: { patientId: true, firstName: true, lastName: true, contactNumber: true },
    take: 8,
  });
}