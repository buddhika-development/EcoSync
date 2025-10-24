'use client';

import { WasteRequest } from '@/types/wasteRequest.types';

interface WasteRequestsTableProps {
  requests: WasteRequest[];
  total: number;
  selectedRequests: Set<string>;
  onRequestSelect: (binId: string) => void;
  onSelectAll: (selectAll: boolean) => void;
}

// SOLID Principle: Single Responsibility - This component only handles displaying waste requests in table format
// HCI Principle: Flexibility and efficiency of use - Checkboxes allow quick selection
export default function WasteRequestsTable({ 
  requests, 
  total, 
  selectedRequests,
  onRequestSelect,
  onSelectAll 
}: WasteRequestsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allSelected = requests.length > 0 && requests.every(req => selectedRequests.has(req.binId));
  const someSelected = requests.some(req => selectedRequests.has(req.binId)) && !allSelected;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Count - HCI Principle: Visibility of system status */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Waste Requests
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Showing {requests.length} of {total} pending requests)
            </span>
          </h3>
          {selectedRequests.size > 0 && (
            <p className="text-sm text-green-600 mt-1">
              {selectedRequests.size} request{selectedRequests.size !== 1 ? 's' : ''} selected for scheduling
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* HCI Principle: User control - Select all functionality */}
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  aria-label="Select all requests"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bin ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bin Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No pending waste requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                const isSelected = selectedRequests.has(request.binId);
                
                return (
                  <tr 
                    key={request.fullBinId} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-green-50' : ''
                    }`}
                    onClick={() => onRequestSelect(request.binId)}
                  >
                    {/* HCI Principle: Feedback - Visual indication of selection */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onRequestSelect(request.binId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        aria-label={`Select request ${request.fullBinId}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.fullBinId.slice(0, 13)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.binId.slice(0, 13)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {request.requestStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.binStatus === 'FULL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.binStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.areaName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(request.updatedAt)}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
