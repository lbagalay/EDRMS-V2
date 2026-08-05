"use server";

import { prisma as db } from "@/lib/db";
import { requireSession } from "@/lib/authorize";

function todayRangeUTC() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  const start = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return { start, end };
}

export async function getTodaysAppointments() {
  await requireSession();

  const { start, end } = todayRangeUTC();

  const appointments = await db.appointment.findMany({
    where: {
      dateSchedule: {
        gte: start,
        lte: end,
      },
    },
    include: {
      patient: true,
    },
    orderBy: { timeSchedule: "asc" },
  });

  return appointments.map((a: (typeof appointments)[number]) => ({
    appointmentId: a.appointmentId,
    patientName: a.name,
    patientId: a.patientId,
    time: a.timeSchedule,
    contactNumber: a.contactNumber,
    status: a.status,
  }));
}

export async function getTodaysStats() {
  await requireSession();

  const { start, end } = todayRangeUTC();

  const [confirmed, cancelled, scheduled] = await Promise.all([
    db.appointment.count({
      where: {
        dateSchedule: { gte: start, lte: end },
        status: "CONFIRMED",
      },
    }),
    db.appointment.count({
      where: {
        dateSchedule: { gte: start, lte: end },
        status: "CANCELLED",
      },
    }),
    db.appointment.count({
      where: {
        dateSchedule: { gte: start, lte: end },
        status: "SCHEDULED",
      },
    }),
  ]);

  return { confirmed, cancelled, scheduled };
}