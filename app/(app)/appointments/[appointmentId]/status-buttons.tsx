"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

const STATUSES: { name: Status; text: string }[] = [
  { name: "SCHEDULED", text: "#0f6c81" },
  { name: "CONFIRMED", text: "#0f6c81" },
  { name: "CANCELLED", text: "#64748b" },
  { name: "COMPLETED", text: "#3d8a48" },
  { name: "NO_SHOW", text: "#a32d2d" },
];

export function StatusButtons({
  appointmentId,
  currentStatus,
  changeStatus,
}: {
  appointmentId: number;
  currentStatus: Status;
  changeStatus: (appointmentId: number, status: string) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const current = STATUSES.find((s) => s.name === currentStatus) ?? STATUSES[0];

  function handleSelect(status: Status) {
    setOpen(false);
    startTransition(async () => {
      await changeStatus(appointmentId, status);
      router.refresh();
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 9999,
          border: "1px solid #D8E8EE",
          background: "#ffffff",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: current.text }}>
          {isPending ? "Updating..." : current.name}
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>▾</span>
      </button>

      {open ? (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 150,
            background: "#ffffff",
            border: "1px solid #D8E8EE",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 10,
            padding: 4,
          }}
        >
          {STATUSES.map((s) => (
            <div
              key={s.name}
              onClick={() => handleSelect(s.name)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: s.text,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}