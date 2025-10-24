'use client';

import { AREA_NAMES } from '@/constants/areaConstants';

interface BinsFiltersProps {
  selectedStatus: string;
  selectedArea: string;
  onStatusChange: (status: string) => void;
  onAreaChange: (area: string) => void;
}

export default function BinsFilters({
  selectedStatus,
  selectedArea,
  onStatusChange,
  onAreaChange,
}: BinsFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600">
            Bin Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="FULL">Full</option>
            <option value="EMPTY">Empty</option>
          </select>
        </div>

        {/* Area Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="area-filter" className="text-sm text-gray-600">
            Area:
          </label>
          <select
            id="area-filter"
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Areas</option>
            {AREA_NAMES.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(selectedStatus || selectedArea) && (
          <button
            onClick={() => {
              onStatusChange('');
              onAreaChange('');
            }}
            className="ml-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
