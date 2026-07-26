"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAppointment } from "../appointments/actions";

type Appointment = {
  appointmentId: number;
  name: string | null;
  patient: { firstName: string; lastName: string } | null;
  dateSchedule: Date;
  timeSchedule: Date;
  purpose: string;
  status: string;
  contactNumber: string | null;
};

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

const STATUS_COLORS: Record<string, { dot: string; text: string }> = {
  SCHEDULED: { dot: "#189AB4", text: "#0f6c81" },
  CONFIRMED: { dot: "#189AB4", text: "#0f6c81" },
  COMPLETED: { dot: "#6ED178", text: "#3d8a48" },
  CANCELLED: { dot: "#94a3b8", text: "#64748b" },
  NO_SHOW: { dot: "#e24b4a", text: "#a32d2d" },
};

export function CalendarGrid({ monthDate, appointments }: { monthDate: Date; appointments: Appointment[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const apptsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = dateKey(appt.dateSchedule);
      const list = map.get(key) ?? [];
      list.push(appt);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.timeSchedule.getTime() - b.timeSchedule.getTime());
    }
    return map;
  }, [appointments]);

  const matchingDayKeys = useMemo(() => {
    if (query.trim().length < 2) return new Set<string>();
    const q = query.trim().toLowerCase();
    const keys = new Set<string>();
    for (const appt of appointments) {
      const label = appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : appt.name ?? "";
      if (label.toLowerCase().includes(q) || (appt.contactNumber ?? "").toLowerCase().includes(q)) {
        keys.add(dateKey(appt.dateSchedule));
      }
    }
    return keys;
  }, [query, appointments]);

  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0)).getUTCDate();
  const leadingBlanks = firstOfMonth.getUTCDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(year, month, d, 12, 0, 0)));

  function handleDelete(appointmentId: number) {
    startTransition(async () => {
      await deleteAppointment(appointmentId);
      setConfirmingId(null);
      setOpenDay(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          background: "#F8FAFB",
          border: "1px solid #D8E8EE",
          borderRadius: 16,
          padding: "11px 16px",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient by name or number"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14 }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 6,
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 8,
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {cells.map((date, idx) => {
          if (!date) return <div key={`blank-${idx}`} style={{ aspectRatio: "1", borderRadius: 14 }} />;

          const key = dateKey(date);
          const dayAppts = apptsByDay.get(key) ?? [];
          const isMatch = matchingDayKeys.has(key);
          const isOpen = openDay === key;
          const first = dayAppts[0];
          const colors = first ? STATUS_COLORS[first.status] ?? STATUS_COLORS.SCHEDULED : null;

          return (
            <div
              key={key}
              onMouseEnter={() => {
                if (dayAppts.length) setOpenDay(key);
              }}
              onMouseLeave={() => setOpenDay((cur) => (cur === key ? null : cur))}
              onClick={() => {
                if (dayAppts.length) setOpenDay(key);
              }}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: 14,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                cursor: dayAppts.length ? "pointer" : "default",
                border: isMatch ? "1.5px solid #189AB4" : "1.5px solid transparent",
                background: isMatch ? "#F0FAFC" : "#F0F0F0",
              }}
            >
              <span style={{ fontSize: 13, color: isMatch ? "#189AB4" : "#94a3b8", fontWeight: isMatch ? 500 : 400 }}>
                {date.getUTCDate()}
              </span>

              {first && colors ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                  <span style={{ fontSize: 12, color: colors.text, fontWeight: 600 }}>{dayAppts.length}</span>
                  <span style={{ fontSize: 9, color: "#94a3b8" }}>booked</span>
                </div>
              ) : null}

              {isOpen && dayAppts.length ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    paddingTop: 8,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: 240,
                      background: "#ffffff",
                      borderRadius: 14,
                      border: "1px solid #D8E8EE",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: "12px 14px",
                      textAlign: "left",
                    }}
                  >
                    {dayAppts.map((appt, i) => {
                      const c = STATUS_COLORS[appt.status] ?? STATUS_COLORS.SCHEDULED;
                      const isConfirming = confirmingId === appt.appointmentId;
                      return (
                        <div
                          key={appt.appointmentId}
                          style={{
                            paddingBottom: 10,
                            marginBottom: 10,
                            borderBottom: i < dayAppts.length - 1 ? "1px solid #F0F0F0" : "none",
                          }}
                        >
                          <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#0f172a" }}>
                            {appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : appt.name}
                          </p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 6px" }}>
                            {formatTime(appt.timeSchedule)} — {appt.purpose}
                          </p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px" }}>
                            {appt.contactNumber}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
                            <span style={{ fontSize: 11, color: c.text, fontWeight: 500 }}>{appt.status}</span>
                          </div>

                          {isConfirming ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => handleDelete(appt.appointmentId)}
                                disabled={isPending}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: "5px 10px",
                                  borderRadius: 9999,
                                  border: "none",
                                  background: "#e24b4a",
                                  color: "#ffffff",
                                  cursor: "pointer",
                                }}
                              >
                                {isPending ? "Deleting..." : "Confirm delete"}
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: "5px 10px",
                                  borderRadius: 9999,
                                  border: "1px solid #D8E8EE",
                                  background: "#ffffff",
                                  color: "#334155",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link
                                href={`/appointments/${appt.appointmentId}`}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: "5px 10px",
                                  borderRadius: 9999,
                                  border: "1px solid #D8E8EE",
                                  color: "#189AB4",
                                  textDecoration: "none",
                                }}
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setConfirmingId(appt.appointmentId)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: "5px 10px",
                                  borderRadius: 9999,
                                  border: "1px solid #D8E8EE",
                                  background: "#ffffff",
                                  color: "#e24b4a",
                                  cursor: "pointer",
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}