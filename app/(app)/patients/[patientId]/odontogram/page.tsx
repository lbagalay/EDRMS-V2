import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDentitionType } from "@/lib/dentition";
import { listTreatmentOptions } from "../actions";
import { Odontogram } from "@/components/odontogram/odontogram";

export default async function OdontogramPage({
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

  // Separate top-level queries, run concurrently, instead of one findUnique
  // with nested includes (which issues its DB round-trips one after another).
  const [patient, toothRecords, treatmentRendered, treatments] = await Promise.all([
    prisma.patient.findUnique({ where: { patientId: id } }),
    prisma.toothRecord.findMany({ where: { patientId: id } }),
    prisma.treatmentRendered.findMany({
      where: { patientId: id, toothNumber: { not: null } },
      include: { treatment: true },
      orderBy: { id: "desc" },
    }),
    listTreatmentOptions(),
  ]);

  if (!patient) {
    return <div className="text-sm text-slate-600">Patient not found.</div>;
  }
  const defaultDentitionType = getDentitionType(patient.birthdate);

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">
              {patient.firstName} {patient.lastName} — Odontogram
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tap a tooth to view or update its record.
            </p>
          </div>
          <Link
            href={`/patients/${patient.patientId}`}
            className="inline-flex items-center justify-center rounded-full border border-[#D8E8EE] px-4 py-2 text-sm font-medium text-[#189AB4] transition hover:bg-[#E6F5FA]"
          >
            Back to patient
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <Odontogram
          patientId={patient.patientId}
          defaultDentitionType={defaultDentitionType}
          toothRecords={toothRecords}
          treatmentRendered={treatmentRendered.map((t: (typeof treatmentRendered)[number]) => ({
            id: t.id,
            toothNumber: t.toothNumber,
            status: t.status,
            treatment: { treatmentId: t.treatment.treatmentId, treatmentName: t.treatment.treatmentName },
          }))}
          treatments={treatments.map((t: (typeof treatments)[number]) => ({
            treatmentId: t.treatmentId,
            treatmentName: t.treatmentName,
          }))}
        />
      </section>
    </main>
  );
}
