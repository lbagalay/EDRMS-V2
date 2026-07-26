import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { changeAppointmentStatus, updateAppointment, getBookedTimes } from "../actions";
import { AppointmentForm } from "../appointment-form";
import { StatusButtons } from "./status-buttons";
import type { AppointmentFormValues } from "@/lib/validators/appointment";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { appointmentId } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId: Number(appointmentId) },
    include: { patient: true },
  });

  if (!appointment) {
    return <div className="text-sm text-slate-600">Appointment not found.</div>;
  }

  const initialPatientLabel = appointment.patient
    ? `${appointment.patient.lastName}, ${appointment.patient.firstName}`
    : "";

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Appointment details</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Review the booking details and update status.</p>
          </div>
          <Link href="/calendar" className="inline-flex items-center justify-center rounded-full border border-[#D8E8EE] px-4 py-2 text-sm font-medium text-[#189AB4] transition hover:bg-[#E6F5FA]">
            Back to calendar
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 text-slate-700">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-[#189AB4]">{appointment.status}</span>
              <span>{appointment.dateSchedule.toLocaleDateString()} • {appointment.timeSchedule.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-medium text-slate-900">Patient:</span> {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : appointment.name}</p>
                <p><span className="font-medium text-slate-900">Contact:</span> {appointment.contactNumber}</p>
                <p><span className="font-medium text-slate-900">Purpose:</span> {appointment.purpose}</p>
                <p><span className="font-medium text-slate-900">Previous patient:</span> {appointment.isPreviousPatient ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
          <StatusButtons
            appointmentId={appointment.appointmentId}
            currentStatus={appointment.status as "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"}
            changeStatus={changeAppointmentStatus}
          />
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[#189AB4]">Edit appointment</h2>
        <div className="mt-5">
          <AppointmentForm
            initialValues={{
              date: appointment.dateSchedule.toISOString().slice(0, 10),
              time: appointment.timeSchedule.toISOString().slice(11, 16),
              patientId: appointment.patientId?.toString() ?? "",
              walkIn: !appointment.patientId,
              name: appointment.name ?? "",
              contactNumber: appointment.contactNumber,
              purpose: appointment.purpose,
              status: appointment.status as AppointmentFormValues["status"],
              isPreviousPatient: appointment.isPreviousPatient,
            }}
            initialPatientLabel={initialPatientLabel}
            submitLabel="Update"
            onSubmit={updateAppointment.bind(null, appointment.appointmentId)}
            getBookedTimes={getBookedTimes}
            excludeAppointmentId={appointment.appointmentId}
          />
        </div>
      </section>
    </main>
  );
}