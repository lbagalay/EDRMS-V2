import { listTreatments } from "./actions";
import { TreatmentsTable } from "./treatments-table";

export default async function TreatmentsPage() {
  const treatments = await listTreatments();

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Treatments</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Manage the treatment catalog used when recording patient visits.
        </p>
      </section>

      <TreatmentsTable treatments={treatments.map((t: (typeof treatments)[number]) => ({ ...t, treatmentFee: Number(t.treatmentFee) }))} />
    </main>
  );
}