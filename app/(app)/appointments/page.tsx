import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { AppointmentForm } from "./appointment-form";
import { createAppointment, getBookingCounts, getBookedTimes } from "./actions";

export default async function AppointmentsPage() {
  const appointments = await db.appointment.findMany({
    where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    orderBy: [{ dateSchedule: "asc" }, { timeSchedule: "asc" }],
    take: 50,
  });

  const now = new Date();
  const initialBookingCounts = await getBookingCounts(now.getUTCFullYear(), now.getUTCMonth() + 1);

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Appointments</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Upcoming appointments across all patients.
        </p>
      </section>

      <AppointmentForm
        onSubmit={createAppointment}
        initialBookingCounts={initialBookingCounts}
        getBookingCounts={getBookingCounts}
        getBookedTimes={getBookedTimes}
      />

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming appointments.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Contact</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a: (typeof appointments)[number]) => (
                <tr key={a.appointmentId} className="border-b border-slate-100">
                  <td className="py-2">{a.name}</td>
                  <td className="py-2">{a.dateSchedule.toLocaleDateString("en-US", { timeZone: "UTC" })}</td>
                  <td className="py-2">
                    {a.timeSchedule.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                  </td>
                  <td className="py-2">{a.contactNumber}</td>
                  <td className="py-2">{a.status}</td>
                  <td className="py-2">
                    <Link href={`/appointments/${a.appointmentId}`} className="text-[#189AB4]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}