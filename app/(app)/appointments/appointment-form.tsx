"use client";

import { useState } from "react";
import { searchPatients } from "./search-patients";
import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";
import type { AppointmentFormValues } from "@/lib/validators/appointment";

type PatientResult = {
  patientId: number;
  firstName: string;
  lastName: string;
  contactNumber: string | null;
};

type AppointmentFormProps = {
  initialValues?: Partial<AppointmentFormValues>;
  initialPatientLabel?: string;
  submitLabel?: string;
  onSubmit: (values: AppointmentFormValues, confirmDoubleBooking?: boolean) => Promise<void>;
  initialBookingCounts?: Record<string, number>;
  getBookingCounts?: (year: number, month: number) => Promise<Record<string, number>>;
  getBookedTimes?: (date: string, excludeAppointmentId?: number) => Promise<string[]>;
  excludeAppointmentId?: number;
};

function toValues(formData: FormData, walkIn: boolean, patientId: string, status: string): AppointmentFormValues {
  return {
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    patientId,
    walkIn,
    name: String(formData.get("name") ?? ""),
    contactNumber: String(formData.get("contactNumber") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    status: status as AppointmentFormValues["status"],
    isPreviousPatient: formData.get("isPreviousPatient") === "on",
  };
}

export function AppointmentForm({
  initialValues,
  initialPatientLabel,
  submitLabel = "Book appointment",
  onSubmit,
  initialBookingCounts,
  getBookingCounts,
  getBookedTimes,
  excludeAppointmentId,
}: AppointmentFormProps) {
  const [walkIn, setWalkIn] = useState(Boolean(initialValues?.walkIn));
  const [query, setQuery] = useState(initialPatientLabel ?? "");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const [patientId, setPatientId] = useState(initialValues?.patientId ?? "");
  const [status, setStatus] = useState<string>(initialValues?.status ?? "SCHEDULED");
  const [date, setDate] = useState(initialValues?.date ?? "");
  const [time, setTime] = useState(initialValues?.time ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDoubleBooking, setConfirmDoubleBooking] = useState(false);
  const [pendingValues, setPendingValues] = useState<AppointmentFormValues | null>(null);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelectedPatient(null);
    setPatientId("");
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const found = await searchPatients(value);
    setResults(found);
  };

  const submit = async (formData: FormData) => {
    setIsSaving(true);
    setError(null);

    const values = toValues(formData, walkIn, patientId, status);

    try {
      await onSubmit(values);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.startsWith("DOUBLE_BOOKING:")) {
        setPendingValues(values);
        setConfirmDoubleBooking(true);
      } else {
        setError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAnyway = async () => {
    if (!pendingValues) return;
    setIsSaving(true);
    try {
      await onSubmit(pendingValues, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
      setConfirmDoubleBooking(false);
      setPendingValues(null);
    }
  };

  return (
    <form action={submit} className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(24,154,180,0.08)] space-y-5">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="walkIn"
          checked={walkIn}
          onChange={(e) => setWalkIn(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="walkIn" className="text-sm font-medium text-slate-700">
          Walk-in / not yet registered
        </label>
      </div>

      {walkIn ? (
        <div key="walkin-field">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            name="name"
            required
            defaultValue={initialValues?.name ?? ""}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
          />
        </div>
      ) : (
        <div key="patient-field">
          <label className="block text-sm font-medium text-slate-700">Patient</label>
          <input
            value={selectedPatient ? `${selectedPatient.lastName}, ${selectedPatient.firstName}` : query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
          />
          {results.length > 0 && !selectedPatient ? (
            <ul className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              {results.map((p) => (
                <li key={p.patientId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p);
                      setPatientId(String(p.patientId));
                      setResults([]);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#F0F0F0]"
                  >
                    {p.lastName}, {p.firstName}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <DatePicker
            name="date"
            value={date}
            onChange={(v) => {
              setDate(v);
              setTime("");
            }}
            initialBookingCounts={initialBookingCounts}
            getBookingCounts={getBookingCounts}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Time</label>
          <TimePicker
            name="time"
            value={time}
            onChange={setTime}
            selectedDate={date}
            getBookedTimes={getBookedTimes}
            excludeAppointmentId={excludeAppointmentId}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Contact number</label>
        <input
          name="contactNumber"
          placeholder="09XXXXXXXXX"
          required
          defaultValue={initialValues?.contactNumber ?? ""}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Purpose</label>
        <textarea
          name="purpose"
          required
          rows={2}
          defaultValue={initialValues?.purpose ?? ""}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
        />
      </div>

      {!walkIn ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPreviousPatient"
            name="isPreviousPatient"
            defaultChecked={initialValues?.isPreviousPatient ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="isPreviousPatient" className="text-sm font-medium text-slate-700">
            Previous patient
          </label>
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F0F0F0] px-4 py-3 text-sm outline-none focus:border-[#189AB4] focus:ring-2 focus:ring-[#189AB4]/20"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
          <option value="NO_SHOW">No-show</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {confirmDoubleBooking ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="mb-2">That slot is already booked. Book anyway?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmAnyway}
              className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white"
            >
              Book anyway
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDoubleBooking(false);
                setPendingValues(null);
              }}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-full bg-[#6ED178] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56b765] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}