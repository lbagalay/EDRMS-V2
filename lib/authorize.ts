import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Role = "ADMIN" | "STAFF" | "RECEPTIONIST";

/**
 * Verifies the caller is signed in. Throws if not.
 * Use in any server action that just needs "logged in", no role restriction.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Verifies the caller is signed in AND has one of the allowed roles.
 * Redirects to /dashboard if the role check fails (instead of throwing).
 * Use in server actions restricted to specific roles (e.g. Admin-only features).
 *
 * Example:
 *   await requireRole("ADMIN");
 *   await requireRole(["ADMIN", "STAFF"]);
 */
export async function requireRole(allowed: Role | Role[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}