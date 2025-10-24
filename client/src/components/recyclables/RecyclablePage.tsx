// ✅ Composition Root: orchestrates smaller components (no business logic here)
"use client";

import React, { useState, useMemo } from "react";
import RecyclableCard from "./RecyclableCard";
import RecyclableFilters from "./RecyclableFilters";
import RecyclableRequestModal, { NewRequestForm } from "./RecyclableRequestModal";

const dummyRecyclables = [
  {
    id: "REC-1045",
    requestedDate: "2024-05-21",
    type: "Pickup",
    category: ["Plastic", "Paper"],
    weight: 5.2,
    status: "Completed" as const,
  },
  {
    id: "REC-1046",
    requestedDate: "2024-05-22",
    type: "Pickup",
    category: ["E-waste"],
    weight: 12,
    status: "Scheduled" as const,
  },
  {
    id: "REC-1047",
    requestedDate: "2024-05-23",
    type: "Drop-off",
    category: ["Glass", "Metal"],
    weight: 8.5,
    status: "Pending" as const,
  },
  {
    id: "REC-1048",
    requestedDate: "2024-05-19",
    type: "Pickup",
    category: ["Organic"],
    weight: 3.1,
    status: "Cancelled" as const,
  },
];

export default function RecyclablePage(): React.ReactNode {
  const [status, setStatus] = useState<string>("All");
  const [open, setOpen] = useState(false);

  const filteredRecyclables = useMemo(() => {
    if (status === "All") return dummyRecyclables;
    return dummyRecyclables.filter((r) => r.status === status);
  }, [status]);

  const submitNewRequest = (payload: NewRequestForm) => {
    // 🚧 Frontend-only: stub the action; integrate API later.
    // console.log keeps side effects out of UI components.
    console.log("NEW REQUEST (dummy submit):", payload);
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Recyclables</h1>
          <button 
            onClick={() => setOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm"
          >
            + New Recyclable Request
          </button>
        </header>

        <RecyclableFilters activeStatus={status} onStatusChange={setStatus} />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecyclables.map((rec) => (
            <RecyclableCard key={rec.id} {...rec} />
          ))}
        </div>
      </div>

      <RecyclableRequestModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={submitNewRequest}
      />
    </div>
  );
}
