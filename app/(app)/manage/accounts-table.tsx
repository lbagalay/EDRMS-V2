"use client";

import { useMemo, useState, useTransition } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createAccount,
  deactivateAccount,
  reactivateAccount,
  resetPassword,
  updateAccountRole,
} from "./actions";

type Role = "ADMIN" | "STAFF" | "RECEPTIONIST";

type Account = {
  accountId: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

type FormState = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-[#189AB4] text-white",
  STAFF: "bg-[#6ED178] text-white",
  RECEPTIONIST: "bg-gray-200 text-gray-800",
};

const emptyForm: FormState = { username: "", email: "", firstName: "", lastName: "", role: "STAFF" };

export function AccountsTable({
  initialAccounts,
  currentAccountId,
}: {
  initialAccounts: Account[];
  currentAccountId: number;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<{ label: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<Role>("STAFF");

  function handleUpdateRole(a: Account) {
    startTransition(async () => {
      const result = await updateAccountRole(a.accountId, { role: editRole });

      if ("error" in result) {
        setFormError(typeof result.error === "string" ? result.error : "Something went wrong");
        return;
      }

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.accountId === a.accountId ? { ...acc, role: editRole } : acc,
        ),
      );
      setEditingRoleId(null);
    });
  }

  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const a = row.original;
          const name = [a.firstName, a.lastName].filter(Boolean).join(" ") || a.username;
          return <span className="font-medium text-slate-900">{name}</span>;
        },
      },
      { accessorKey: "username", header: "Username" },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email ?? <span className="text-slate-400">—</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const a = row.original;
          const isSelf = a.accountId === currentAccountId;

          if (editingRoleId === a.accountId) {
            return (
              <div className="flex items-center gap-2">
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="rounded-xl border border-slate-200 px-2 py-1 text-xs"
                >
                  <option value="STAFF">Staff</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleUpdateRole(a)}
                  className="rounded-full bg-[#189AB4] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRoleId(null)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Badge className={ROLE_COLORS[a.role] ?? ""}>{a.role}</Badge>
              {!isSelf ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoleId(a.accountId);
                    setEditRole(a.role);
                  }}
                  className="text-xs font-medium text-[#189AB4] hover:underline"
                >
                  Edit
                </button>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <span className="text-xs font-medium text-[#3d8a48]">Active</span>
          ) : (
            <span className="text-xs font-medium text-slate-400">Deactivated</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const a = row.original;
          const isSelf = a.accountId === currentAccountId;

          return (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleResetPassword(a)}
                className="rounded-full border border-[#D8E8EE] px-3 py-1 text-xs font-medium text-[#189AB4] transition hover:border-[#189AB4] disabled:opacity-50"
              >
                Reset password
              </button>
              {a.isActive ? (
                <button
                  type="button"
                  disabled={isPending || isSelf}
                  title={isSelf ? "You can't deactivate your own account" : undefined}
                  onClick={() => handleToggleActive(a)}
                  className="rounded-full border border-[#D8E8EE] px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleActive(a)}
                  className="rounded-full border border-[#D8E8EE] px-3 py-1 text-xs font-medium text-[#3d8a48] transition hover:border-[#6ED178] disabled:opacity-50"
                >
                  Reactivate
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [isPending, currentAccountId, editingRoleId, editRole],
  );

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleToggleActive(a: Account) {
    startTransition(async () => {
      const result = a.isActive
        ? await deactivateAccount(a.accountId)
        : await reactivateAccount(a.accountId);

      if ("error" in result) {
        setFormError(typeof result.error === "string" ? result.error : "Something went wrong");
        return;
      }

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.accountId === a.accountId ? { ...acc, isActive: !acc.isActive } : acc,
        ),
      );
    });
  }

  function handleResetPassword(a: Account) {
    startTransition(async () => {
      const result = await resetPassword(a.accountId);
      if ("success" in result) {
        const name = [a.firstName, a.lastName].filter(Boolean).join(" ") || a.username;
        setRevealedPassword({ label: name, password: result.tempPassword });
      }
    });
  }

  function handleCreate() {
    setFormError(null);
    startTransition(async () => {
      const result = await createAccount(form);

      if ("error" in result) {
        setFormError(
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", "),
        );
        return;
      }

      const newAccount: Account = {
        accountId: result.accountId,
        username: form.username,
        email: form.email || null,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        isActive: true,
        createdAt: new Date(),
      };

      setAccounts((prev) => [...prev, newAccount]);
      setShowCreateForm(false);
      setForm(emptyForm);
      setRevealedPassword({
        label: `${form.firstName} ${form.lastName}`,
        password: result.tempPassword,
      });
    });
  }

  function copyPassword() {
    if (!revealedPassword) return;
    navigator.clipboard.writeText(revealedPassword.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)] space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Staff accounts</h2>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#56b765]"
        >
          {showCreateForm ? "Cancel" : "+ New account"}
        </button>
      </div>

      {showCreateForm ? (
        <div className="rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            >
              <option value="STAFF">Staff</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {formError ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
          ) : null}

          <button
            type="button"
            disabled={isPending || !form.username || !form.firstName || !form.lastName}
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-full bg-[#189AB4] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#147c92] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create account"}
          </button>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={revealedPassword !== null} onOpenChange={(open) => !open && setRevealedPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Share this password with <strong>{revealedPassword?.label}</strong> so they can sign in.
              It won't be shown again — copy it now.
            </p>
            <div className="flex items-center gap-2 rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3">
              <code className="flex-1 text-sm font-mono text-slate-900">{revealedPassword?.password}</code>
              <button
                type="button"
                onClick={copyPassword}
                className="rounded-full bg-[#189AB4] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#147c92]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setRevealedPassword(null)}
              className="rounded-full border border-[#D8E8EE] px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-[#189AB4]"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}