import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listAccounts } from "./actions";
import { AccountsTable } from "./accounts-table";

export default async function ManagePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const accounts = await listAccounts();

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">
          Manage staff
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Create accounts, deactivate access, and reset passwords for staff.
        </p>
      </section>

      <AccountsTable
        initialAccounts={accounts}
        currentAccountId={Number(session.user.id)}
      />
    </main>
  );
}