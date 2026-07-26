import { auth } from "@/lib/auth";
import { createPatient } from "../actions";

export default async function NewPatientPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">New patient</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Create a new patient record with core demographics and contact details.</p>
        </div>

        <form action={createPatient} className="mt-6 space-y-4 rounded-[32px] border border-[#D8E8EE] bg-[#F0F0F0] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Last name</span>
            <input name="lastName" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">First name</span>
            <input name="firstName" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Middle name</span>
            <input name="middleName" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Birthdate</span>
            <input name="birthdate" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Sex</span>
            <select name="sex" className="w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Contact number</span>
            <input name="contactNumber" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Address</span>
            <input name="address" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Email</span>
            <input name="email" type="email" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Medical alerts / notes</span>
            <textarea name="medicalAlerts" rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>

        <button type="submit" className="rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765]">
          Save patient
        </button>
      </form>
    </section>
  </main>
  );
}
