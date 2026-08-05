"use client";

import type { ToothCondition } from "@prisma/client";
import { getToothPosition } from "@/lib/odontogram/tooth-positions";
import { getToothName } from "@/lib/odontogram/tooth-data";

const CONDITION_LABELS: Record<ToothCondition, string> = {
  HEALTHY: "Healthy",
  CARIES: "Caries",
  FILLED: "Filled",
  MISSING: "Missing",
  CROWNED: "Crowned",
  ROOT_CANAL: "Root canal",
  EXTRACTED: "Extracted",
  OTHER: "Other",
};

const CONDITION_COLORS: Record<ToothCondition, string> = {
  HEALTHY: "bg-transparent",
  CARIES: "bg-red-400/40",
  FILLED: "bg-blue-400/40",
  MISSING: "bg-slate-400/40",
  CROWNED: "bg-amber-400/40",
  ROOT_CANAL: "bg-purple-400/40",
  EXTRACTED: "bg-slate-700/40",
  OTHER: "bg-yellow-300/40",
};

type ToothHitRegionProps = {
  toothNumber: number;
  condition: ToothCondition;
  lastTreatmentName: string | null;
  onClick: () => void;
};

export function ToothHitRegion({
  toothNumber,
  condition,
  lastTreatmentName,
  onClick,
}: ToothHitRegionProps) {
  const position = getToothPosition(toothNumber);
  const name = getToothName(toothNumber);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
      }}
    >
      <span
        className={`block h-full w-full rounded-full transition ${CONDITION_COLORS[condition]} group-hover:ring-2 group-hover:ring-[#189AB4] group-focus-visible:ring-2 group-focus-visible:ring-[#189AB4]`}
      />
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-max max-w-[12rem] -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block font-semibold">
          {toothNumber} · {name}
        </span>
        <span className="block text-slate-300">{CONDITION_LABELS[condition]}</span>
        <span className="block text-slate-300">
          Last treatment: {lastTreatmentName ?? "None"}
        </span>
      </span>
    </button>
  );
}
