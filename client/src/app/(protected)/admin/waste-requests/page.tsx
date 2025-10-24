'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WasteRequest, WasteRequestsResponse, SchedulePickupRequest, SchedulePickupResponse } from '@/types/wasteRequest.types';
import WasteRequestsFilters from '@/components/admin/WasteRequestsFilters';
import WasteRequestsTable from '@/components/admin/WasteRequestsTable';
import SchedulePickupModal from '@/components/admin/SchedulePickupModal';

// SOLID Principle: Dependency Inversion - Map component loaded dynamically to avoid SSR issues
const WasteRequestsMap = dynamic(() => import('@/components/admin/WasteRequestsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

// SOLID Principle: Single Responsibility - Page component manages waste requests state and API calls
// HCI Principle: Visibility of system status - Loading, error, and success states clearly shown
export default function WasteRequestsPage() {
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters - HCI Principle: User control and freedom
  const [selectedArea, setSelectedArea] = useState('');
  
  // Selection state for scheduling
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [selectedArea]);

  // SOLID Principle: Single Responsibility - Separate function for API calls
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      // Only fetch PENDING requests
      params.append('status', 'PENDING');
      
      if (selectedArea) params.append('areaName', selectedArea);

      const url = `${apiBase}/api/admin/full-bins${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch waste requests: ${response.statusText}`);
      }

      const data: WasteRequestsResponse = await response.json();
      
      if (data.ok) {
        setRequests(data.data);
        setTotal(data.total);
      } else {
        throw new Error('Failed to fetch waste requests');
      }
    } catch (err) {
      console.error('Error fetching waste requests:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // HCI Principle: Flexibility and efficiency of use - Quick selection toggles
  const handleRequestSelect = (binId: string) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(binId)) {
        newSet.delete(binId);
      } else {
        newSet.add(binId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedRequests(new Set(requests.map(req => req.binId)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  // SOLID Principle: Open/Closed - Schedule logic can be extended without modifying core
  const handleSchedulePickup = async (scheduledDate: string, autoAssignCollector: boolean) => {
    if (selectedRequests.size === 0) {
      alert('Please select at least one request to schedule');
      return;
    }

    // HCI Principle: Error prevention - Validate area selection for scheduling
    if (!selectedArea) {
      alert('Please filter by a specific area before scheduling pickups');
      return;
    }

    try {
      setScheduling(true);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      
      const requestBody: SchedulePickupRequest = {
        areaName: selectedArea,
        binIds: Array.from(selectedRequests),
        scheduledDate,
        autoAssignCollector,
      };

      const response = await fetch(`${apiBase}/api/admin/pickups`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: SchedulePickupResponse = await response.json();

      if (response.ok && data.ok) {
        // HCI Principle: Feedback - Success message
        alert(
          `Successfully scheduled pickup!\n` +
          `Order ID: ${data.orderId}\n` +
          `Total Tasks: ${data.totalTasks}\n` +
          `Scheduled Date: ${data.scheduledDate || scheduledDate}`
        );
        
        // Clear selections and refresh data
        setSelectedRequests(new Set());
        setIsScheduleModalOpen(false);
        fetchRequests();
      } else {
        throw new Error(data.error?.message || 'Failed to schedule pickup');
      }
    } catch (err) {
      console.error('Error scheduling pickup:', err);
      // HCI Principle: Error recovery - Clear error message
      alert(`Failed to schedule pickup: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScheduling(false);
    }
  };

  // Get unique areas from selected requests for summary
  const selectedAreas = Array.from(
    new Set(
      requests
        .filter(req => selectedRequests.has(req.binId))
        .map(req => req.areaName)
    )
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waste Requests</h1>
          <p className="text-gray-600 mt-1">Full bins awaiting collection</p>
        </div>
        
        {/* HCI Principle: Visibility of system status - Show schedule button when items selected */}
        {selectedRequests.size > 0 && (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={!selectedArea}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedArea
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={!selectedArea ? 'Please select an area filter first' : 'Schedule pickup for selected bins'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Schedule Route ({selectedRequests.size})</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <WasteRequestsFilters
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      {/* Error State - HCI Principle: Visibility of system status */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State - HCI Principle: Visibility of system status */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Map View */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Map View</h2>
            <WasteRequestsMap 
              requests={requests} 
              selectedRequests={selectedRequests}
              onRequestSelect={handleRequestSelect}
            />
          </div>

          {/* Table View */}
          <div>
            <WasteRequestsTable 
              requests={requests} 
              total={total}
              selectedRequests={selectedRequests}
              onRequestSelect={handleRequestSelect}
              onSelectAll={handleSelectAll}
            />
          </div>
        </>
      )}

      {/* Schedule Pickup Modal */}
      <SchedulePickupModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleSchedulePickup}
        selectedCount={selectedRequests.size}
        areaName={selectedArea}
        areas={selectedAreas}
      />

      {/* Loading overlay when scheduling - HCI Principle: Feedback */}
      {scheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-gray-700 font-medium">Scheduling pickup...</p>
          </div>
        </div>
      )}
    </div>
  );
}

