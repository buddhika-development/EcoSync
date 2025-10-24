// ✅ Interface Segregation: filters are self-contained logic for the toolbar
import React from "react";

interface RecyclableFiltersProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const statuses = ["All", "Pending", "Scheduled", "Completed", "Cancelled"];

const RecyclableFilters: React.FC<RecyclableFiltersProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeStatus === status
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default RecyclableFilters;
