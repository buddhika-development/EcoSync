'use client';

import { useState } from 'react';

interface SchedulePickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, autoAssign: boolean) => void;
  selectedCount: number;
  areaName: string;
  areas: string[];
}

// SOLID Principle: Single Responsibility - Only handles schedule pickup modal UI and logic
// HCI Principle: Error prevention - Validates date before allowing submission
// HCI Principle: Visibility of system status - Shows summary before confirmation
export default function SchedulePickupModal({
  isOpen,
  onClose,
  onSchedule,
  selectedCount,
  areaName,
  areas,
}: SchedulePickupModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [autoAssignCollector, setAutoAssignCollector] = useState(true);

  if (!isOpen) return null;

  // HCI Principle: Error prevention - Ensure date is not in the past
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = () => {
    if (!scheduledDate) {
      alert('Please select a schedule date');
      return;
    }
    onSchedule(scheduledDate, autoAssignCollector);
  };

  // HCI Principle: User control and freedom - Easy to cancel
  const handleClose = () => {
    setScheduledDate('');
    setAutoAssignCollector(true);
    onClose();
  };

  return (
    <>
      {/* Backdrop - HCI Principle: Aesthetic and minimalist design */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Schedule Route</h2>
              <p className="text-sm text-gray-600 mt-1">Create a new collection route for selected bins</p>
            </div>
            {/* HCI Principle: User control - Clear close button */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Schedule Date - HCI Principle: Match between system and real world */}
            <div>
              <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="schedule-date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Auto-assign Collectors - HCI Principle: Flexibility and efficiency of use */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="auto-assign" className="text-sm font-medium text-gray-700">
                  Auto-assign collectors
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically assign available collectors
                </p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="auto-assign"
                  checked={autoAssignCollector}
                  onChange={(e) => setAutoAssignCollector(e.target.checked)}
                  className="sr-only peer"
                />
                <label
                  htmlFor="auto-assign"
                  className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${
                    autoAssignCollector ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoAssignCollector ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>

            {/* Summary - HCI Principle: Visibility of system status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total bins:</span>
                  <span className="font-semibold text-gray-900">{selectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Areas:</span>
                  <span className="font-semibold text-gray-900">{areas.length}</span>
                </div>
                {areas.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area names:</span>
                    <span className="font-semibold text-gray-900 text-right">{areas.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - HCI Principle: Consistency and standards */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!scheduledDate}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                scheduledDate
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
