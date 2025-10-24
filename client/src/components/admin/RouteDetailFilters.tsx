interface RouteDetailFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

// SOLID Principle: Single Responsibility - Component only manages route detail filters
// HCI Principle: User control and freedom - Easy to filter and clear filters
export default function RouteDetailFilters({
  selectedStatus,
  onStatusChange,
}: RouteDetailFiltersProps) {
  const statuses = [
    { value: '', label: 'All Tasks' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Task Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Task Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filter Button - HCI Principle: User control and freedom */}
        {selectedStatus && (
          <div className="flex items-end">
            <button
              onClick={() => onStatusChange('')}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
