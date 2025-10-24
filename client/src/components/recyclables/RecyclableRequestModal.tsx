// src/components/recyclables/RecyclableRequestModal.tsx
// ✅ SRP: Modal owns only UI & local form state. No fetching here.
// ✅ OCP: Easy to extend categories/types/areas without touching the component internals.
// ✅ DIP: Interacts via props (onClose/onSubmit) instead of concrete services.

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";

export type RequestStatus = "Pending" | "Scheduled" | "Completed" | "Cancelled";
export type RequestType = "Pickup" | "Drop-off";

const CATEGORIES = ["paper-waste", "metal-waste", "plastic-waste", "e-waste"] as const;
type Category = (typeof CATEGORIES)[number];

export interface NewRequestForm {
  categories: Category[];
  type: RequestType;
  area: string;
  weightKg?: number;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewRequestForm) => void;
}

export default function RecyclableRequestModal({ open, onClose, onSubmit }: Props) {
  const { areas, loading: areasLoading, error: areasError } = useAreas();
  const [form, setForm] = useState<NewRequestForm>({
    categories: [],
    type: "Pickup",
    area: "",
    weightKg: undefined,
    notes: "",
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const isValid = useMemo(
    () => form.categories.length > 0 && form.type && form.area && (form.weightKg ?? 0) > 0,
    [form]
  );

  // ♻️ Reset form each time the modal opens
  useEffect(() => {
    if (open) {
      setForm({ categories: [], type: "Pickup", area: "", weightKg: undefined, notes: "" });
    }
  }, [open]);

  // ⎋ Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // 🧩 Small pure helpers (keeps component lean; avoids code smells)
  const toggleCategory = (c: Category) =>
    setForm((f) =>
      f.categories.includes(c)
        ? { ...f, categories: f.categories.filter((x) => x !== c) }
        : { ...f, categories: [...f.categories, c] }
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
    onClose();
  };

  return (
    // Overlay (click outside to close)
    <div
      ref={overlayRef}
      onMouseDown={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      aria-modal="true"
      role="dialog"
    >
      {/* Dialog */}
      <div className="w-full max-w-3xl rounded-2xl bg-emerald-50 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Recyclable Request</h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the details below to schedule a new recyclable collection.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-6 space-y-6">
          {/* Category */}
          <section>
            <p className="text-sm font-semibold text-gray-800">Category</p>
            <p className="text-xs text-gray-500 mb-3">Select one category for recyclable collection.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={form.categories.includes(c)}
                    onChange={() => setForm(f => ({ ...f, categories: [c] }))}
                  />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Type */}
          <section>
            <p className="text-sm font-semibold text-gray-800">Type</p>
            <div className="mt-3 flex items-center gap-8">
              {(["Pickup", "Drop-off"] as RequestType[]).map((t) => (
                <label key={t} className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={form.type === t}
                    onChange={() => setForm((f) => ({ ...f, type: t }))}
                  />
                  <span className="text-sm text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Area + Weight */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Area</p>
              <div className="relative">
                {areasLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  </div>
                ) : areasError ? (
                  <div className="text-sm text-red-600 py-2">
                    Failed to load areas. Please try again.
                  </div>
                ) : (
                  <select
                    value={form.area}
                    onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={areasLoading}
                  >
                    <option value="">Select an area</option>
                    {areas.map((area) => (
                      <option key={area.area_id} value={area.area_id}>
                        {area.area_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Approx. Weight (kg)</p>
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="e.g., 3.5"
                value={form.weightKg ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    weightKg: e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </section>

          {/* Notes */}
          <section>
            <p className="text-sm font-semibold text-gray-800 mb-2">Notes (Optional)</p>
            <textarea
              rows={4}
              placeholder="Any special instructions for the collection team?"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
