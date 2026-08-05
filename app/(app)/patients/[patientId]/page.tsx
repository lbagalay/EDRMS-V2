import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createVisit, listTreatmentOptions } from "./actions";
import { computeVisitBalance } from "@/lib/balance";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { patientId } = await params;
  const id = Number(patientId);

  // Fetched as separate top-level queries (rather than one findUnique with
  // nested includes) so they run concurrently: Prisma issues one DB
  // round-trip per relation level for MySQL, and those were previously
  // serialized one after another inside a single query.
  const [patient, appointments, visits, treatments] = await Promise.all([
    prisma.patient.findUnique({ where: { patientId: id } }),
    prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: [{ dateSchedule: "desc" }, { timeSchedule: "desc" }],
    }),
    prisma.visit.findMany({
      where: { patientId: id, isDeleted: false },
      orderBy: { dateVisit: "desc" },
      include: { treatmentRendered: { include: { treatment: true } } },
    }),
    listTreatmentOptions(),
  ]);

  if (!patient) {
    return <div className="text-sm text-slate-600">Patient not found.</div>;
  }
  const totalOutstanding = visits.reduce(
    (sum: number, v: (typeof visits)[number]) => sum + computeVisitBalance(v),
    0,
  );

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">{patient.firstName} {patient.lastName}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">View and update the patient’s core details.</p>
          </div>
          <Link
            href={`/patients/${patient.patientId}/odontogram`}
            className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765]"
          >
            Odontogram
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-xl font-semibold text-[#189AB4]">Demographics</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Birthdate</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.birthdate ? patient.birthdate.toLocaleDateString() : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Sex</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.sex ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Contact number</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.contactNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.email ?? "—"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-slate-500">Address</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.address ?? "—"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-slate-500">Medical alerts</dt>
            <dd className="mt-1 text-sm text-slate-900">{patient.medicalAlerts ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl bg-[#F0F0F0] px-4 py-3 text-sm text-slate-700">
          <span className="font-medium">Total outstanding balance:</span> ₱{totalOutstanding.toFixed(2)}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-xl font-semibold text-[#189AB4]">Visits</h2>
        {visits.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">No visits recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {visits.map((v: (typeof visits)[number]) => {
              const balance = computeVisitBalance(v);
              return (
                <Link
                  key={v.visitId}
                  href={`/patients/${patient.patientId}/visits/${v.visitId}`}
                  className="block rounded-2xl border border-[#D8E8EE] px-4 py-3 text-sm transition hover:border-[#189AB4]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{v.visitPurpose}</span>
                    <span className="text-slate-500">{v.dateVisit.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-slate-600">
                    {v.treatmentRendered.map((tr: (typeof v.treatmentRendered)[number]) => (
                      <span key={tr.id} className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-xs">
                        {tr.treatment.treatmentName}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">Balance: ₱{balance.toFixed(2)}</div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-[#E2E8F0] pt-6">
          <h3 className="text-sm font-semibold text-slate-900">Add visit</h3>
          <form action={createVisit.bind(null, patient.patientId)} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Visit purpose</label>
                <input name="visitPurpose" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input type="date" name="dateVisit" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Treatments rendered</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {treatments.map((t: (typeof treatments)[number]) => (
                  <label key={t.treatmentId} className="flex items-center gap-2 rounded-2xl border border-[#D8E8EE] px-4 py-2 text-sm">
                    <input type="checkbox" name="treatmentIds" value={t.treatmentId} className="h-4 w-4 rounded border-slate-300" />
                    {t.treatmentName} — ₱{Number(t.treatmentFee).toFixed(2)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Prescription</label>
              <textarea name="prescription" rows={2} className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <textarea name="notes" rows={2} className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Additional fees</label>
                <input type="number" step="0.01" name="additionalFees" defaultValue="0" className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount paid</label>
                <input type="number" step="0.01" name="amountPaid" defaultValue="0" className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Discount</label>
                <input type="number" step="0.01" name="discount" defaultValue="0" className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
            </div>

            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765]">
              Save visit
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-xl font-semibold text-[#189AB4]">Appointments</h2>
        {appointments.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">No appointments on record.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {appointments.map((a: (typeof appointments)[number]) => (
              <div key={a.appointmentId} className="flex items-center justify-between rounded-2xl border border-[#D8E8EE] px-4 py-3 text-sm">
                <span>
                  {a.dateSchedule.toLocaleDateString()} · {a.timeSchedule.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {a.purpose}
                </span>
                <Link href={`/appointments/${a.appointmentId}`} className="text-[#189AB4] hover:text-[#0f6c81]">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
