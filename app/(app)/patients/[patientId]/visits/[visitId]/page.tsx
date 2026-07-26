import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addVitalSigns } from "../../actions";
import { computeVisitBalance } from "@/lib/balance";

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ patientId: string; visitId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { patientId, visitId } = await params;

  const visit = await prisma.visit.findUnique({
    where: { visitId: Number(visitId) },
    include: {
      patient: true,
      treatmentRendered: { include: { treatment: true } },
      vitalSigns: { where: { isDeleted: false }, orderBy: { timeTaken: "asc" } },
    },
  });

  if (!visit) {
    return <div className="text-sm text-slate-600">Visit not found.</div>;
  }

  const balance = computeVisitBalance(visit);

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">{visit.visitPurpose}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {visit.dateVisit.toLocaleDateString()} · {visit.patient.firstName} {visit.patient.lastName}
            </p>
          </div>
          <Link href={`/patients/${patientId}`} className="inline-flex items-center justify-center rounded-full border border-[#D8E8EE] px-4 py-2 text-sm font-medium text-[#189AB4] transition hover:bg-[#E6F5FA]">
            Back to patient
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">Treatments:</span> {visit.treatmentRendered.map((tr) => tr.treatment.treatmentName).join(", ") || "—"}</p>
            <p><span className="font-medium text-slate-900">Prescription:</span> {visit.prescription || "—"}</p>
            <p><span className="font-medium text-slate-900">Notes:</span> {visit.notes || "—"}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">Additional fees:</span> ₱{Number(visit.additionalFees).toFixed(2)}</p>
            <p><span className="font-medium text-slate-900">Amount paid:</span> ₱{Number(visit.amountPaid).toFixed(2)}</p>
            <p><span className="font-medium text-slate-900">Discount:</span> ₱{Number(visit.discount).toFixed(2)}</p>
            <p className="text-base font-semibold text-[#189AB4]">Balance: ₱{balance.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Vital signs</h2>
        {visit.vitalSigns.length === 0 ? (
          <p className="text-sm text-slate-500">No vital signs recorded for this visit yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Temp (°C)</th>
                <th className="pb-2 font-medium">Pulse</th>
                <th className="pb-2 font-medium">BP</th>
              </tr>
            </thead>
            <tbody>
              {visit.vitalSigns.map((vs) => (
                <tr key={vs.vitalSignId} className="border-b border-slate-100">
                  <td className="py-2">{vs.timeTaken.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="py-2">{Number(vs.temperature).toFixed(1)}</td>
                  <td className="py-2">{vs.pulseRate}</td>
                  <td className="py-2">{vs.systolicBp}/{vs.diastolicBp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={addVitalSigns.bind(null, visit.visitId, Number(patientId))} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Time taken</label>
              <input type="time" name="timeTaken" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Temperature (°C)</label>
              <input type="number" step="0.1" name="temperature" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Pulse rate</label>
              <input type="number" name="pulseRate" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Systolic</label>
                <input type="number" name="systolicBp" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Diastolic</label>
                <input type="number" name="diastolicBp" required className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20" />
              </div>
            </div>
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765]">
            Add vital signs
          </button>
        </form>
      </section>
    </main>
  );
}