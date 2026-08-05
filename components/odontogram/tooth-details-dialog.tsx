// components/odontogram/tooth-details-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import type { ToothCondition, ProcedureStatus } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getToothName } from "@/lib/odontogram/tooth-data";
import {
  upsertToothCondition,
  addToothTreatment,
} from "@/app/(app)/patients/[patientId]/odontogram/actions";

const CONDITION_OPTIONS: { value: ToothCondition; label: string }[] = [
  { value: "HEALTHY", label: "Healthy" },
  { value: "CARIES", label: "Caries" },
  { value: "FILLED", label: "Filled" },
  { value: "MISSING", label: "Missing" },
  { value: "CROWNED", label: "Crowned" },
  { value: "ROOT_CANAL", label: "Root canal" },
  { value: "EXTRACTED", label: "Extracted" },
  { value: "OTHER", label: "Other" },
];

type ToothRecordData = {
  toothNumber: number;
  condition: ToothCondition;
  conditionNote: string | null;
  dentistNotes: string | null;
};

type TreatmentHistoryEntry = {
  id: number;
  status: ProcedureStatus;
  treatment: { treatmentId: number; treatmentName: string };
};

type TreatmentOption = { treatmentId: number; treatmentName: string };

type ToothDetailsDialogProps = {
  patientId: number;
  toothNumber: number;
  toothRecord: ToothRecordData | null;
  treatmentHistory: TreatmentHistoryEntry[];
  treatments: TreatmentOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConditionSaved: (
    toothNumber: number,
    condition: ToothCondition,
    conditionNote: string,
    dentistNotes: string,
  ) => void;
  onTreatmentAdded: (
    toothNumber: number,
    treatment: TreatmentOption,
    status: ProcedureStatus,
  ) => void;
};

export function ToothDetailsDialog({
  patientId,
  toothNumber,
  toothRecord,
  treatmentHistory,
  treatments,
  open,
  onOpenChange,
  onConditionSaved,
  onTreatmentAdded,
}: ToothDetailsDialogProps) {
  const [condition, setCondition] = useState<ToothCondition>(toothRecord?.condition ?? "HEALTHY");
  const [conditionNote, setConditionNote] = useState(toothRecord?.conditionNote ?? "");
  const [dentistNotes, setDentistNotes] = useState(toothRecord?.dentistNotes ?? "");
  const [treatmentId, setTreatmentId] = useState(String(treatments[0]?.treatmentId ?? ""));
  const [status, setStatus] = useState<ProcedureStatus>("PLANNED");
  const [error, setError] = useState<string | null>(null);
  const [isSavingCondition, startSavingCondition] = useTransition();
  const [isSavingTreatment, startSavingTreatment] = useTransition();

  const completed = treatmentHistory.filter((t) => t.status === "COMPLETED");
  const planned = treatmentHistory.filter((t) => t.status === "PLANNED");

  function handleSaveCondition() {
    setError(null);
    const formData = new FormData();
    formData.set("toothNumber", String(toothNumber));
    formData.set("condition", condition);
    formData.set("conditionNote", conditionNote);
    formData.set("dentistNotes", dentistNotes);

    startSavingCondition(async () => {
      try {
        await upsertToothCondition(patientId, formData);
        onConditionSaved(toothNumber, condition, conditionNote, dentistNotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save condition");
      }
    });
  }

  function handleAddTreatment() {
    setError(null);
    const treatment = treatments.find((t) => String(t.treatmentId) === treatmentId);
    if (!treatment) {
      setError("Select a treatment");
      return;
    }
    const formData = new FormData();
    formData.set("toothNumber", String(toothNumber));
    formData.set("treatmentId", treatmentId);
    formData.set("status", status);

    startSavingTreatment(async () => {
      try {
        await addToothTreatment(patientId, formData);
        onTreatmentAdded(toothNumber, treatment, status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add treatment");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Tooth {toothNumber} · {getToothName(toothNumber)}
          </DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ToothCondition)}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Condition detail</label>
            <textarea
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Dentist notes</label>
            <textarea
              value={dentistNotes}
              onChange={(e) => setDentistNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveCondition}
            disabled={isSavingCondition}
            className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765] disabled:opacity-50"
          >
            {isSavingCondition ? "Saving..." : "Save condition"}
          </button>

          <div className="border-t border-[#E2E8F0] pt-4">
            <h3 className="text-sm font-semibold text-slate-900">Treatment history</h3>
            {completed.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">No completed treatments recorded.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {completed.map((t) => (
                  <li key={t.id}>{t.treatment.treatmentName}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Planned procedures</h3>
            {planned.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">No procedures planned.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {planned.map((t) => (
                  <li key={t.id}>{t.treatment.treatmentName}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[#E2E8F0] pt-4">
            <h3 className="text-sm font-semibold text-slate-900">Add / edit treatment</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select
                value={treatmentId}
                onChange={(e) => setTreatmentId(e.target.value)}
                className="w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              >
                {treatments.map((t) => (
                  <option key={t.treatmentId} value={t.treatmentId}>
                    {t.treatmentName}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcedureStatus)}
                className="w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
              >
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddTreatment}
              disabled={isSavingTreatment || treatments.length === 0}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765] disabled:opacity-50"
            >
              {isSavingTreatment ? "Saving..." : "Add treatment"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
