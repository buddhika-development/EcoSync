'use client';

import { useRouter } from 'next/navigation';
import { ScheduledRoute } from '@/types/scheduledRoute.types';

interface RouteCardProps {
  route: ScheduledRoute;
}

// SOLID Principle: Single Responsibility - Only displays a single route card
// HCI Principle: Recognition rather than recall - Visual cards make routes easy to scan
export default function RouteCard({ route }: RouteCardProps) {
  const router = useRouter();

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color - HCI Principle: Consistency and standards
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // HCI Principle: Visibility of system status - Display derived status
  const displayStatus = route.orderStatus.replace('_', ' ');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Route ID</h3>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {route.orderId.slice(0, 13)}...
            </p>
          </div>
          {/* More actions menu placeholder */}
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="More options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        {/* Area - HCI Principle: Match between system and real world */}
        <div className="flex items-center space-x-2 mt-4">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-700">{route.areaName}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Bins</p>
            <p className="text-2xl font-bold text-gray-900">{route.tasks.length}</p>
          </div>
          {/* Status Badge - HCI Principle: Feedback */}
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(route.orderStatus)}`}>
            {displayStatus}
          </span>
        </div>

        {/* Schedule Date & Time */}
        <div className="text-sm text-gray-600">
          <p>{formatDate(route.scheduledDate || route.createdAt)}</p>
          <p className="mt-1">{formatTime(route.createdAt)}</p>
        </div>
      </div>

      {/* Map Thumbnail Placeholder - HCI Principle: Aesthetic and minimalist design */}
      <div className="bg-gray-100 h-32 flex items-center justify-center border-t border-gray-200">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-xs text-gray-500 mt-1">Map thumbnail</p>
        </div>
      </div>

      {/* Card Footer - HCI Principle: User control - Clear call to action */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => router.push(`/admin/scheduled-routes/${route.orderId}`)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <span>Open</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
