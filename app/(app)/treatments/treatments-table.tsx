"use client";

import { useState } from "react";
import {
  createTreatment,
  updateTreatment,
  deactivateTreatment,
  reactivateTreatment,
} from "./actions";

type Treatment = {
  treatmentId: number;
  treatmentName: string;
  treatmentFee: number | string;
  isActive: boolean;
};

export function TreatmentsTable({ treatments }: { treatments: Treatment[] }) {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [isSaving, setIsSaving] = useState(false);

 async function handleCreate() {
    setError(null);
    setIsSaving(true);
    const result = await createTreatment({ treatmentName: name, treatmentFee: fee });
    setIsSaving(false);
    if ("error" in result) {
      setError(typeof result.error === "string" ? result.error : "Please check the fields.");
      setName("");
      setFee("");
      return;
    }
    setName("");
    setFee("");
  }

  function startEdit(t: Treatment) {
    setEditingId(t.treatmentId);
    setEditName(t.treatmentName);
    setEditFee(String(t.treatmentFee));
  }

  async function handleUpdate(treatmentId: number) {
    setIsSaving(true);
    const result = await updateTreatment(treatmentId, {
      treatmentName: editName,
      treatmentFee: editFee,
    });
    setIsSaving(false);
    if ("error" in result) {
      setError(typeof result.error === "string" ? result.error : "Please check the fields.");
      return;
    }
    setEditingId(null);
  }

  async function handleToggle(t: Treatment) {
    if (t.isActive) {
      await deactivateTreatment(t.treatmentId);
    } else {
      await reactivateTreatment(t.treatmentId);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-lg font-semibold text-slate-900">Add treatment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700">Treatment name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Fee (₱)</label>
            <input
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D8E8EE] bg-[#F8FAFB] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isSaving || !name || !fee}
            className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Add"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)]">
        <h2 className="text-lg font-semibold text-slate-900">Treatment catalog</h2>
        {treatments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No treatments added yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {treatments.map((t) => (
              <div
                key={t.treatmentId}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  t.isActive ? "border-[#D8E8EE]" : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                {editingId === t.treatmentId ? (
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-xl border border-[#D8E8EE] px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      className="w-28 rounded-xl border border-[#D8E8EE] px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleUpdate(t.treatmentId)}
                      disabled={isSaving}
                      className="rounded-full bg-[#189AB4] px-4 py-1.5 text-xs font-medium text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-medium text-slate-900">{t.treatmentName}</span>
                      <span className="ml-2 text-slate-500">
                        ₱{Number(t.treatmentFee).toFixed(2)}
                      </span>
                      {!t.isActive ? (
                        <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="rounded-full border border-[#D8E8EE] px-4 py-1.5 text-xs font-medium text-[#189AB4] hover:bg-[#E6F5FA]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          t.isActive
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "border border-[#D8E8EE] text-[#189AB4] hover:bg-[#E6F5FA]"
                        }`}
                      >
                        {t.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}