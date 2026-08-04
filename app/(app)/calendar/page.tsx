import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppointmentForm } from "../appointments/appointment-form";
import { createAppointment } from "../appointments/actions";
import { CalendarGrid } from "./calendar-grid";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
}

function startOfMonthUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0));
}

function formatDateForInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function CalendarPage({ searchParams }: { searchParams?: Promise<{ date?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const today = todayUTC();

  let selectedMonth = resolvedSearchParams?.date
    ? startOfMonthUTC(new Date(`${resolvedSearchParams.date}T12:00:00.000Z`))
    : startOfMonthUTC(today);

  if (selectedMonth < startOfMonthUTC(today)) {
    selectedMonth = startOfMonthUTC(today);
  }

  const monthEnd = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 1, 12, 0, 0));
  const prevMonth = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() - 1, 1, 12, 0, 0));
  const nextMonth = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 1, 12, 0, 0));
  const canGoPrev = prevMonth >= startOfMonthUTC(today);

  const [monthAppointments, upcoming] = await Promise.all([
    prisma.appointment.findMany({
      where: { dateSchedule: { gte: selectedMonth, lt: monthEnd } },
      orderBy: [{ dateSchedule: "asc" }, { timeSchedule: "asc" }],
      include: { patient: true },
    }),
    prisma.appointment.findMany({
      where: {
        dateSchedule: { gte: today },
        status: { notIn: ["CANCELLED", "COMPLETED"] },
      },
      orderBy: [{ dateSchedule: "asc" }, { timeSchedule: "asc" }],
      include: { patient: true },
      take: 8,
    }),
  ]);

  const headerLabel = selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Calendar</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Plan appointments by month and manage booking details.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-[32px] bg-white p-7 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xl font-medium text-slate-900">{headerLabel}</p>
            <div className="flex items-center gap-2">
              {canGoPrev ? (
                <Link
                  href={{ pathname: "/calendar", query: { date: formatDateForInput(prevMonth) } }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8E8EE] text-slate-700 hover:border-[#189AB4] hover:text-[#189AB4]"
                >
                  ‹
                </Link>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8E8EE] text-slate-300">‹</span>
              )}
              <Link
                href={{ pathname: "/calendar", query: { date: formatDateForInput(nextMonth) } }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8E8EE] text-slate-700 hover:border-[#189AB4] hover:text-[#189AB4]"
              >
                ›
              </Link>
            </div>
          </div>
          <CalendarGrid monthDate={selectedMonth} appointments={monthAppointments} />
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
          <h2 className="mb-4 text-sm font-medium text-slate-900">Upcoming</h2>
          <div className="flex flex-col">
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            ) : (
              upcoming.map((appt: (typeof upcoming)[number], idx: number) => (
                <Link
                  key={appt.appointmentId}
                  href={`/appointments/${appt.appointmentId}`}
                  className={`flex items-center justify-between py-3.5 px-1 ${idx < upcoming.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}
                >
                  <div>
                    <p className="text-[15px] font-medium text-slate-900">
                      {appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : appt.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-400">{appt.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-medium text-[#189AB4]">
                      {appt.dateSchedule.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {appt.timeSchedule.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-xl font-semibold text-[#189AB4]">Create appointment</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Book a patient or create a walk-in entry.</p>
        <div className="mt-5">
          <AppointmentForm onSubmit={createAppointment} />
        </div>
      </section>
    </main>
  );
}