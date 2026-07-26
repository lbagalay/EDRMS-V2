import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const allowPublicSignup = process.env.ALLOW_PUBLIC_SIGNUP === "true";

  if (!allowPublicSignup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E8F7FB] px-4 py-8">
        <div className="w-full max-w-md rounded-[32px] border border-[#D8E8EE] bg-white p-8 shadow-[0_20px_40px_rgba(24,154,180,0.12)]">
          <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Sign up unavailable</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">Public account creation is disabled. Contact an admin to create the first account.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E8F7FB] px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-[#D8E8EE] bg-white p-8 shadow-[0_20px_40px_rgba(24,154,180,0.12)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Create account</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">Public signup is available only while ALLOW_PUBLIC_SIGNUP=true.</p>
        <SignUpForm />
      </div>
    </main>
  );
}