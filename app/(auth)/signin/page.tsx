"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") ?? "/dashboard");
  }, []);

  // Show a reassuring message if the request takes a beat longer than expected
  useEffect(() => {
    if (!isLoading) {
      setShowSlowMessage(false);
      return;
    }

    const timer = setTimeout(() => setShowSlowMessage(true), 700);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid username or password.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E8F7FB] px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-[#D8E8EE] bg-white p-8 shadow-[0_20px_40px_rgba(24,154,180,0.12)]">
        <Image
          src="/brand/dentalClinicLogo.png"
          alt="Clam-Pasco Dental Clinic"
          width={96}
          height={96}
          className="mx-auto mb-4"
        />

        <h1 className="text-3xl font-semibold tracking-tight text-[#189AB4]">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter your credentials to access the system.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username or email</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20 disabled:opacity-60"
            />
          </div>

          {error ? <div className="rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">{error}</div> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Log in"
            )}
          </button>

          {showSlowMessage ? (
            <p className="text-center text-xs text-slate-400">
              Connecting to the database — this can take a moment on first load.
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}