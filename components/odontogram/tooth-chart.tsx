// components/odontogram/tooth-chart.tsx
"use client";

import type { ToothCondition } from "@prisma/client";
import { ToothHitRegion } from "./tooth-hit-region";

type ToothChartProps = {
  activeTeeth: number[];
  toothConditions: Record<number, ToothCondition>;
  lastTreatmentNames: Record<number, string | null>;
  onToothClick: (toothNumber: number) => void;
};

export function ToothChart({
  activeTeeth,
  toothConditions,
  lastTreatmentNames,
  onToothClick,
}: ToothChartProps) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/odontogram/adult-chart.svg" alt="Dental chart" className="w-full select-none" />
      {activeTeeth.map((toothNumber) => (
        <ToothHitRegion
          key={toothNumber}
          toothNumber={toothNumber}
          condition={toothConditions[toothNumber] ?? "HEALTHY"}
          lastTreatmentName={lastTreatmentNames[toothNumber] ?? null}
          onClick={() => onToothClick(toothNumber)}
        />
      ))}
    </div>
  );
}
