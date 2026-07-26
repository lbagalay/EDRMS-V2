"use client";

import { useState, useRef, useEffect } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDisplay(time: string) {
  if (!time) return "Select time";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${pad(m)} ${period}`;
}

function buildSlots() {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${pad(h)}:${pad(m)}`);
    }
  }
  return slots;
}

const SLOTS = buildSlots();

export function TimePicker({
  name,
  value,
  onChange,
  selectedDate,
  getBookedTimes,
  excludeAppointmentId,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  selectedDate?: string;
  getBookedTimes?: (date: string, excludeAppointmentId?: number) => Promise<string[]>;
  excludeAppointmentId?: number;
}) {
  const [open, setOpen] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!getBookedTimes || !selectedDate) {
      setBooked([]);
      return;
    }
    getBookedTimes(selectedDate, excludeAppointmentId).then(setBooked);
  }, [selectedDate, getBookedTimes, excludeAppointmentId]);

  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
      if (active) active.scrollIntoView({ block: "center" });
    }
  }, [open]);

  function pick(slot: string) {
    if (booked.includes(slot)) return;
    onChange(slot);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!selectedDate}
        className="mt-2 w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {selectedDate ? formatDisplay(value) : "Pick a date first"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      </button>

      {open ? (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 20,
            maxHeight: 220,
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #D8E8EE",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            padding: 6,
          }}
        >
          {SLOTS.map((slot) => {
            const isBooked = booked.includes(slot);
            const isActive = slot === value;
            return (
              <div
                key={slot}
                data-active={isActive}
                onClick={() => pick(slot)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isBooked ? "#cbd5e1" : isActive ? "#189AB4" : "#334155",
                  background: isActive ? "#E6F5FA" : "transparent",
                  cursor: isBooked ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isBooked && !isActive) e.currentTarget.style.background = "#F8FAFB";
                }}
                onMouseLeave={(e) => {
                  if (!isBooked && !isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{formatDisplay(slot)}</span>
                {isBooked ? <span style={{ fontSize: 10, fontWeight: 500, color: "#cbd5e1" }}>Booked</span> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}