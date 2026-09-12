import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ClipboardList,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { MobileNavToggle } from "./mobile-nav-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/treatments", label: "Treatments" },
  { href: "/calendar", label: "Calendar" },
  { href: "/appointments", label: "Appointments" },
  { href: "/manage", label: "Manage" },
];

const navIcons: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/patients": Users,
  "/treatments": Stethoscope,
  "/calendar": Calendar,
  "/appointments": ClipboardList,
  "/manage": Settings,
};

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/signin" });
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="glass-panel w-full p-4 sm:p-6 lg:w-64 lg:min-h-screen lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/clinicLogo.png"
            alt="Demo Dental Clinic"
            width={32}
            height={32}
            className="shrink-0 rounded-lg object-contain"
          />
          <h2 className="text-sm font-semibold leading-tight text-[var(--brand-blue)]">
            Demo
            <br />
            Dental Clinic
          </h2>
        </div>

        {/* Mobile: collapsible menu */}
        <MobileNavToggle navItems={navItems} signOutAction={handleSignOut} />

        {/* Desktop: always-visible nav */}
        <nav className="mt-8 hidden lg:flex lg:flex-col lg:gap-1">
          {navItems.map((item) => {
            const Icon = navIcons[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-blue)]/10"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 hidden border-t border-slate-200 pt-6 lg:mt-auto lg:block">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-blue)]/10"
          >
            <User className="h-4 w-4 shrink-0" />
            Profile
          </Link>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}