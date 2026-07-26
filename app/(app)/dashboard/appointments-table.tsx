"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { ArrowUpDown } from "lucide-react";

type Appointment = {
  appointmentId: number;
  patientName: string;
  patientId: number | null;
  time: Date;
  contactNumber: string;
  status: string;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-gray-200 text-gray-800",
  CONFIRMED: "bg-[#6ED178] text-white",
  CANCELLED: "bg-red-500 text-white",
  COMPLETED: "bg-[#189AB4] text-white",
  NO_SHOW: "bg-yellow-500 text-white",
};

const PAGE_SIZES = [5, 10, 20, 30];

export function AppointmentsTable({ appointments }: { appointments: Appointment[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-medium"
          >
            Patient
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => row.original.patientName,
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-medium"
          >
            Time
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) =>
          new Date(row.original.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }),
        sortingFn: (a, b) => new Date(a.original.time).getTime() - new Date(b.original.time).getTime(),
      },
      {
        accessorKey: "contactNumber",
        header: "Contact",
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-medium"
          >
            Status
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <Badge className={statusColors[row.original.status] ?? ""}>{row.original.status}</Badge>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) =>
          row.original.patientId ? (
            <Link href={`/patients/${row.original.patientId}`} className="text-[#189AB4] underline">
              View
            </Link>
          ) : (
            <span className="text-muted-foreground text-sm">Walk-in</span>
          ),
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: appointments,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const a = row.original;
      return (
        a.patientName.toLowerCase().includes(search) ||
        a.contactNumber.toLowerCase().includes(search) ||
        a.status.toLowerCase().includes(search)
      );
    },
  });

  if (appointments.length === 0) {
    return <p className="text-muted-foreground">No appointments scheduled for today.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search today's appointments"
          className="w-full max-w-xs rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-2 text-sm outline-none transition focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
        />
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-xl border border-[#D8E8EE] bg-white px-3 py-1.5 outline-none focus:border-[#189AB4]"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                No matching appointments.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-full border border-[#D8E8EE] px-4 py-1.5 font-medium transition hover:border-[#189AB4] hover:text-[#189AB4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-full border border-[#D8E8EE] px-4 py-1.5 font-medium transition hover:border-[#189AB4] hover:text-[#189AB4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}