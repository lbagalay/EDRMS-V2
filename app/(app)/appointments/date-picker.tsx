"use client";

import { useState, useRef, useEffect } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "Select date";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function DatePicker({
  name,
  value,
  onChange,
  initialBookingCounts,
  getBookingCounts,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  initialBookingCounts?: Record<string, number>;
  getBookingCounts?: (year: number, month: number) => Promise<Record<string, number>>;
}) {
  const [open, setOpen] = useState(false);
  const initial = value
    ? new Date(Number(value.split("-")[0]), Number(value.split("-")[1]) - 1, 1)
    : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [counts, setCounts] = useState<Record<string, number>>(initialBookingCounts ?? {});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!getBookingCounts) return;
    getBookingCounts(viewYear, viewMonth + 1).then(setCounts);
  }, [viewYear, viewMonth, getBookingCounts]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const selected = value ? value.split("-").map(Number) : null;
  const isSelected = (d: number) =>
    selected && selected[0] === viewYear && selected[1] === viewMonth + 1 && selected[2] === d;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function pickDay(d: number) {
    onChange(`${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`);
    setOpen(false);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>{formatDisplay(value)}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 20,
            width: 280,
            background: "#ffffff",
            border: "1px solid #D8E8EE",
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #D8E8EE", background: "#fff", cursor: "pointer" }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMonth}
                style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #D8E8EE", background: "#fff", cursor: "pointer" }}
              >
                ›
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", fontSize: 11, color: "#94a3b8", textAlign: "center", marginBottom: 6 }}>
            {DAY_NAMES.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 4 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={`b-${i}`} />;
              const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
              const count = counts[key];
              return (
                <div key={d} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => pickDay(d)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "none",
                      background: isSelected(d) ? "#189AB4" : "transparent",
                      color: isSelected(d) ? "#ffffff" : "#334155",
                      fontSize: 13,
                      fontWeight: isSelected(d) ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                  {count && !isSelected(d) ? (
                    count > 1 ? (
                      <span
                        style={{
                          position: "absolute",
                          top: -2,
                          right: 2,
                          fontSize: 9,
                          fontWeight: 600,
                          lineHeight: 1,
                          background: "#E6F5FA",
                          color: "#189AB4",
                          borderRadius: 9999,
                          padding: "1px 4px",
                        }}
                      >
                        {count}
                      </span>
                    ) : (
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 6,
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#189AB4",
                        }}
                      />
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}