import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { archivePatient, unarchivePatient } from "./actions";
import { computeVisitBalance } from "@/lib/balance";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string; archived?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const page = Number(resolvedSearchParams?.page ?? "1");
  const showArchived = resolvedSearchParams?.archived === "true";
  const pageSize = 10;

  const whereClause = {
    isDeleted: showArchived,
    OR: [
      { firstName: { contains: query } },
      { lastName: { contains: query } },
      { contactNumber: { contains: query } },
      { email: { contains: query } },
    ],
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where: whereClause,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        patientId: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        email: true,
        visits: {
          where: { isDeleted: false },
          orderBy: { dateVisit: "desc" },
          select: {
            dateVisit: true,
            additionalFees: true,
            amountPaid: true,
            discount: true,
            treatmentRendered: {
              select: {
                feeAtTime: true,
                treatment: { select: { treatmentFee: true } },
              },
            },
          },
        },
      },
    }),
    prisma.patient.count({ where: whereClause }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Patients</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Browse active patients and archive records when needed.</p>
          </div>
          <Link href="/patients/new" className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#56b765]">
            Add patient
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={{ pathname: "/patients", query: { q: query } }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${!showArchived ? "bg-[#189AB4] text-white" : "border border-[#D8E8EE] text-slate-700 hover:border-[#189AB4] hover:text-[#189AB4]"}`}
          >
            Active
          </Link>
          <Link
            href={{ pathname: "/patients", query: { q: query, archived: "true" } }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${showArchived ? "bg-[#189AB4] text-white" : "border border-[#D8E8EE] text-slate-700 hover:border-[#189AB4] hover:text-[#189AB4]"}`}
          >
            Archived
          </Link>
        </div>

        <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
          {showArchived ? <input type="hidden" name="archived" value="true" /> : null}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search patients"
            className="w-full min-w-0 rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
          />
          <button type="submit" className="rounded-full bg-[#189AB4] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#12758a]">
            Search
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
            <thead className="bg-[#F0F0F0]">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-700">Contact</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-700">Last visit</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-700">Outstanding balance</th>
                <th className="px-4 py-4 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {showArchived ? "No archived patients." : "No patients found."}
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const outstandingBalance = patient.visits.reduce((sum, v) => sum + computeVisitBalance(v), 0);
                  return (
                    <tr key={patient.patientId} className="hover:bg-[#F8FBFD]">
                      <td className="px-4 py-4">
                        <Link href={`/patients/${patient.patientId}`} className="font-medium text-slate-900 hover:text-[#189AB4]">
                          {patient.firstName} {patient.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{patient.contactNumber ?? patient.email ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-700">{patient.visits[0]?.dateVisit ? patient.visits[0].dateVisit.toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-4 text-slate-700">₱{outstandingBalance.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        {showArchived ? (
                          <form action={unarchivePatient.bind(null, patient.patientId)}>
                            <button type="submit" className="text-sm font-medium text-[#6ED178] transition hover:text-[#4fa859]">
                              Unarchive
                            </button>
                          </form>
                        ) : (
                          <form action={archivePatient.bind(null, patient.patientId)}>
                            <button type="submit" className="text-sm font-medium text-[#189AB4] transition hover:text-[#0f6c81]">
                              Archive
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)] text-slate-600">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Page {page} of {totalPages}</p>
          <div className="flex flex-wrap gap-2">
            {page > 1 ? (
              <Link href={{ pathname: "/patients", query: { q: query, page: page - 1, ...(showArchived ? { archived: "true" } : {}) } }} className="rounded-full border border-[#D8E8EE] px-4 py-2 text-sm transition hover:border-[#189AB4] hover:text-[#189AB4]">
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={{ pathname: "/patients", query: { q: query, page: page + 1, ...(showArchived ? { archived: "true" } : {}) } }} className="rounded-full border border-[#D8E8EE] px-4 py-2 text-sm transition hover:border-[#189AB4] hover:text-[#189AB4]">
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}