// components/odontogram/odontogram.tsx
"use client";

import { useMemo, useState } from "react";
import type { ToothCondition, ProcedureStatus } from "@prisma/client";
import type { DentitionType } from "@/lib/dentition";
import { getActiveTeeth } from "@/lib/odontogram/tooth-data";
import { ToothChart } from "./tooth-chart";
import { ToothDetailsDialog } from "./tooth-details-dialog";

type ToothRecordData = {
  toothNumber: number;
  condition: ToothCondition;
  conditionNote: string | null;
  dentistNotes: string | null;
};

type TreatmentRenderedData = {
  id: number;
  toothNumber: number | null;
  status: ProcedureStatus;
  treatment: { treatmentId: number; treatmentName: string };
};

type TreatmentOption = { treatmentId: number; treatmentName: string };

type OdontogramProps = {
  patientId: number;
  defaultDentitionType: DentitionType;
  toothRecords: ToothRecordData[];
  treatmentRendered: TreatmentRenderedData[];
  treatments: TreatmentOption[];
};

export function Odontogram({
  patientId,
  defaultDentitionType,
  toothRecords: initialToothRecords,
  treatmentRendered: initialTreatmentRendered,
  treatments,
}: OdontogramProps) {
  const [dentitionType, setDentitionType] = useState<DentitionType>(defaultDentitionType);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothRecords, setToothRecords] = useState(initialToothRecords);
  const [treatmentRendered, setTreatmentRendered] = useState(initialTreatmentRendered);

  const activeTeeth = useMemo(() => getActiveTeeth(dentitionType), [dentitionType]);

  const toothRecordsByNumber = useMemo(() => {
    const map = new Map<number, ToothRecordData>();
    for (const record of toothRecords) {
      map.set(record.toothNumber, record);
    }
    return map;
  }, [toothRecords]);

  const treatmentsByTooth = useMemo(() => {
    const map = new Map<number, TreatmentRenderedData[]>();
    for (const entry of treatmentRendered) {
      if (entry.toothNumber === null) continue;
      const existing = map.get(entry.toothNumber) ?? [];
      existing.push(entry);
      map.set(entry.toothNumber, existing);
    }
    return map;
  }, [treatmentRendered]);

  const toothConditions = useMemo(() => {
    const map: Record<number, ToothCondition> = {};
    for (const record of toothRecords) {
      map[record.toothNumber] = record.condition;
    }
    return map;
  }, [toothRecords]);

  const lastTreatmentNames = useMemo(() => {
    const map: Record<number, string | null> = {};
    for (const [toothNumber, entries] of treatmentsByTooth) {
      const completed = entries.find((e) => e.status === "COMPLETED");
      map[toothNumber] = completed?.treatment.treatmentName ?? null;
    }
    return map;
  }, [treatmentsByTooth]);

  function handleConditionSaved(
    toothNumber: number,
    condition: ToothCondition,
    conditionNote: string,
    dentistNotes: string,
  ) {
    setToothRecords((prev) => {
      const next = prev.filter((r) => r.toothNumber !== toothNumber);
      next.push({ toothNumber, condition, conditionNote: conditionNote || null, dentistNotes: dentistNotes || null });
      return next;
    });
  }

  function handleTreatmentAdded(
    toothNumber: number,
    treatment: TreatmentOption,
    status: ProcedureStatus,
  ) {
    setTreatmentRendered((prev) => [
      { id: -Date.now(), toothNumber, status, treatment },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Dentition</label>
        <select
          value={dentitionType}
          onChange={(e) => setDentitionType(e.target.value as DentitionType)}
          className="w-fit rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-2 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
        >
          <option value="PRIMARY">Primary (baby teeth)</option>
          <option value="MIXED">Mixed (shown as full chart)</option>
          <option value="PERMANENT">Permanent</option>
        </select>
      </div>

      <ToothChart
        activeTeeth={activeTeeth}
        toothConditions={toothConditions}
        lastTreatmentNames={lastTreatmentNames}
        onToothClick={setSelectedTooth}
      />

      {selectedTooth !== null && (
        <ToothDetailsDialog
          patientId={patientId}
          toothNumber={selectedTooth}
          toothRecord={toothRecordsByNumber.get(selectedTooth) ?? null}
          treatmentHistory={treatmentsByTooth.get(selectedTooth) ?? []}
          treatments={treatments}
          open={selectedTooth !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTooth(null);
          }}
          onConditionSaved={handleConditionSaved}
          onTreatmentAdded={handleTreatmentAdded}
        />
      )}
    </div>
  );
}
