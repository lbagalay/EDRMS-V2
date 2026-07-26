"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ClipboardList,
  Settings,
  User,
  LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string };

const navIcons: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/patients": Users,
  "/treatments": Stethoscope,
  "/calendar": Calendar,
  "/appointments": ClipboardList,
  "/manage": Settings,
};

export function MobileNavToggle({
  navItems,
  signOutAction,
}: {
  navItems: NavItem[];
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#D8E8EE] px-4 py-3 text-sm font-medium text-slate-700"
      >
        <span className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          Menu
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="mt-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = navIcons[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-blue)]/10"
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-blue)]/10"
            >
              <User className="h-4 w-4 shrink-0" />
              Profile
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}