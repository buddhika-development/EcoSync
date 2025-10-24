// ✅ Interface Segregation: filters are self-contained logic for the toolbar
import React from "react";

interface RecyclableFiltersProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const statuses = [
  { value: "All", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const RecyclableFilters: React.FC<RecyclableFiltersProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {statuses.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onStatusChange(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeStatus === value
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default RecyclableFilters;
