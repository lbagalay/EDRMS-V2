import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const account = await prisma.account.findUnique({
    where: { accountId: Number(session.user.id) },
    select: {
      accountId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthdate: true,
      email: true,
      username: true,
      role: true,
    },
  });

  if (!account) {
    return null;
  }

  const defaultValues = {
    firstName: account.firstName ?? "",
    middleName: account.middleName ?? "",
    lastName: account.lastName ?? "",
    birthdate: account.birthdate ? account.birthdate.toISOString().slice(0, 10) : "",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Update your personal details without exposing any password data.</p>
      </div>

      <form action={updateProfile} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">First name</span>
            <input
              name="firstName"
              defaultValue={defaultValues.firstName}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Middle name</span>
            <input
              name="middleName"
              defaultValue={defaultValues.middleName}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Last name</span>
            <input
              name="lastName"
              defaultValue={defaultValues.lastName}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Birthdate</span>
            <input
              name="birthdate"
              type="date"
              defaultValue={defaultValues.birthdate}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p><strong>Username:</strong> {account.username}</p>
          <p><strong>Email:</strong> {account.email ?? "—"}</p>
          <p><strong>Role:</strong> {account.role}</p>
        </div>

        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save profile
        </button>
      </form>
    </div>
  );
}
