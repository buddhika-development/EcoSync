'use client';

import { useEffect, useState } from 'react';
import { ScheduledRoute, ScheduledRoutesResponse } from '@/types/scheduledRoute.types';
import ScheduledRoutesFilters from '@/components/admin/ScheduledRoutesFilters';
import RouteCard from '@/components/admin/RouteCard';

// SOLID Principle: Single Responsibility - Page manages scheduled routes listing
// HCI Principle: Visibility of system status - Shows loading, error, and data states clearly
export default function ScheduledRoutesPage() {
  const [routes, setRoutes] = useState<ScheduledRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters - HCI Principle: User control and freedom
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, [selectedStatus, selectedArea]);

  // SOLID Principle: Single Responsibility - Separate function for API calls
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const params = new URLSearchParams();

      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedArea) params.append('areaName', selectedArea);

      const url = `${apiBase}/api/admin/scheduled-routes${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scheduled routes: ${response.statusText}`);
      }

      const data: ScheduledRoutesResponse = await response.json();

      if (data.ok) {
        setRoutes(data.data);
        setTotal(data.total);
      } else {
        throw new Error('Failed to fetch scheduled routes');
      }
    } catch (err) {
      console.error('Error fetching scheduled routes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scheduled Routes</h1>
        <p className="text-gray-600 mt-1">Manage and track collection routes</p>
      </div>

      {/* Filters */}
      <ScheduledRoutesFilters
        selectedStatus={selectedStatus}
        selectedArea={selectedArea}
        onStatusChange={setSelectedStatus}
        onAreaChange={setSelectedArea}
      />

      {/* Error State - HCI Principle: Help users recognize and recover from errors */}
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

      {/* Routes Grid - HCI Principle: Flexibility and efficiency of use */}
      {!loading && !error && (
        <>
          {routes.length === 0 ? (
            // Empty State - HCI Principle: Visibility of system status
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-gray-500 mt-4">No scheduled routes found</p>
              {(selectedStatus || selectedArea) && (
                <button
                  onClick={() => {
                    setSelectedStatus('');
                    setSelectedArea('');
                  }}
                  className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Count - HCI Principle: Visibility of system status */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {routes.length} of {total} routes
                </p>
              </div>

              {/* Grid Layout - HCI Principle: Aesthetic and minimalist design */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <RouteCard key={route.orderId} route={route} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

