'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RouteDetail } from '@/types/scheduledRoute.types';
import dynamic from 'next/dynamic';
import BinTaskCard from '@/components/admin/BinTaskCard';

// Dynamically import map component to avoid SSR issues
const RouteDetailMap = dynamic(() => import('@/components/admin/RouteDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

// SOLID Principle: Single Responsibility - Page manages route detail display
// HCI Principle: Visibility of system status - Shows loading, error, and data states
export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchRouteDetail();
    }
  }, [orderId]);

  const fetchRouteDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const url = `${apiBase}/api/admin/pickups/${orderId}`;

      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch route details: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.ok) {
        setRouteDetail(data.data);
      } else {
        throw new Error('Failed to fetch route details');
      }
    } catch (err) {
      console.error('Error fetching route details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // All tasks without filtering - showing complete route information
  const tasks = routeDetail?.tasks || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !routeDetail) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800">{error || 'Route not found'}</p>
          </div>
          <button
            onClick={() => router.push('/admin/scheduled-routes')}
            className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            ← Back to Scheduled Routes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Back Button - HCI Principle: Consistency and standards */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/scheduled-routes')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Scheduled Routes</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Route Details</h1>
            <p className="text-gray-600 mt-1">Route ID: {routeDetail.orderId}</p>
          </div>
        </div>
      </div>

      {/* Route Information Card - HCI Principle: Visibility of system status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Area</p>
            <p className="text-lg font-semibold text-gray-900">{routeDetail.areaName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned Collector</p>
            <p className="text-lg font-semibold text-gray-900">{routeDetail.collectorName || 'Auto-assign'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scheduled Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(routeDetail.scheduledDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Bins</p>
            <p className="text-lg font-semibold text-gray-900">{routeDetail.totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Route Map</h2>
        <RouteDetailMap tasks={routeDetail.tasks} />
      </div>

      {/* Tasks Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Assigned Bins ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500">No bins assigned to this route</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <BinTaskCard key={task.binId} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
