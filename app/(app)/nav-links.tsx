"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/treatments", label: "Treatments" },
  { href: "/calendar", label: "Calendar" },
  { href: "/appointments", label: "Appointments" },
  { href: "/manage", label: "Manage" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-1.5 lg:mt-8 lg:flex-col lg:gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"
                : "text-slate-700 hover:bg-[var(--brand-blue)]/10"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}