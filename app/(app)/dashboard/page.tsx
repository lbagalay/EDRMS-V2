import { getTodaysAppointments, getTodaysStats } from "./actions";
import { auth } from "@/lib/auth";
import { StatCard } from "./stat-card";
import { AppointmentsTable } from "./appointments-table";

export default async function DashboardPage() {
  const session = await auth();
  const [appointments, stats] = await Promise.all([
    getTodaysAppointments(),
    getTodaysStats(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Here's what's happening today.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Confirmed Today" value={stats.confirmed} color="green" featured />
        <StatCard label="Cancelled Today" value={stats.cancelled} color="red" />
        <StatCard label="Scheduled Today" value={stats.scheduled} color="blue" />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
        <AppointmentsTable appointments={appointments} />
      </section>
    </main>
  );
}