"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/authorize";
import { appointmentFormSchema, type AppointmentFormValues } from "@/lib/validators/appointment";

function parseTimeOnly(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes));
}

function dateOnlyUTC(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

async function resolveName(data: AppointmentFormValues) {
  if (data.walkIn) {
    return data.name?.trim() || "Walk-in";
  }

  if (!data.patientId) return undefined;

  const patient = await prisma.patient.findUnique({
    where: { patientId: Number(data.patientId) },
    select: { firstName: true, lastName: true },
  });

  if (!patient) {
    throw new Error("Selected patient could not be found");
  }

  return `${patient.lastName}, ${patient.firstName}`;
}

export async function createAppointment(rawValues: AppointmentFormValues, confirmDoubleBooking = false) {
  await requireSession();

  const parsed = appointmentFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;
  const scheduledDate = dateOnlyUTC(data.date);
  const scheduledTime = parseTimeOnly(data.time);

  const resolvedName = await resolveName(data);

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      dateSchedule: { equals: scheduledDate },
      timeSchedule: { equals: scheduledTime },
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (existingAppointment && !confirmDoubleBooking) {
    throw new Error(
      `DOUBLE_BOOKING: ${existingAppointment.name} is already scheduled at this date and time`,
    );
  }

  await prisma.appointment.create({
    data: {
      dateSchedule: scheduledDate,
      timeSchedule: scheduledTime,
      purpose: data.purpose,
      contactNumber: data.contactNumber,
      status: (data.status ?? "SCHEDULED") as "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
      isPreviousPatient: data.walkIn ? false : (data.isPreviousPatient || false),
      patientId: data.walkIn || !data.patientId ? null : Number(data.patientId),
      name: resolvedName,
    } as never,
  });

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  redirect("/calendar");
}

export async function updateAppointment(appointmentId: number, rawValues: AppointmentFormValues) {
  await requireSession();

  const parsed = appointmentFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;
  const scheduledDate = dateOnlyUTC(data.date);
  const scheduledTime = parseTimeOnly(data.time);
  const resolvedName = await resolveName(data);

  await prisma.appointment.update({
    where: { appointmentId },
    data: {
      dateSchedule: scheduledDate,
      timeSchedule: scheduledTime,
      purpose: data.purpose,
      contactNumber: data.contactNumber,
      status: (data.status ?? "SCHEDULED") as "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
      isPreviousPatient: data.walkIn ? false : (data.isPreviousPatient || false),
      patientId: data.walkIn || !data.patientId ? null : Number(data.patientId),
      name: resolvedName,
    } as never,
  });

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
  redirect(`/appointments/${appointmentId}`);
}

export async function changeAppointmentStatus(appointmentId: number, status: string) {
  await requireSession();

  await prisma.appointment.update({
    where: { appointmentId },
    data: { status: status as never },
  });

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
}

export async function deleteAppointment(appointmentId: number) {
  await requireSession();

  await prisma.appointment.delete({
    where: { appointmentId },
  });

  revalidatePath("/calendar");
  revalidatePath("/appointments");
}

export async function getBookingCounts(year: number, month: number) {
  await requireSession();

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const appts = await prisma.appointment.findMany({
    where: {
      dateSchedule: { gte: start, lt: end },
      status: { not: "CANCELLED" },
    },
    select: { dateSchedule: true },
  });

  const counts: Record<string, number> = {};
  for (const a of appts) {
    const key = a.dateSchedule.toISOString().slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
export async function getBookedTimes(date: string, excludeAppointmentId?: number) {
  await requireSession();

  const [year, month, day] = date.split("-").map(Number);
  const dayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const appts = await prisma.appointment.findMany({
    where: {
      dateSchedule: { equals: dayDate },
      status: { not: "CANCELLED" },
      ...(excludeAppointmentId ? { appointmentId: { not: excludeAppointmentId } } : {}),
    },
    select: { timeSchedule: true },
  });

  return appts.map((a: { timeSchedule: Date }) => a.timeSchedule.toISOString().slice(11, 16));
}