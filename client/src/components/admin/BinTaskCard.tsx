import { RouteDetailTask } from '@/types/scheduledRoute.types';

interface BinTaskCardProps {
  task: RouteDetailTask;
}

// SOLID Principle: Single Responsibility - Component displays single bin task information
// HCI Principle: Aesthetic and minimalist design - Shows only relevant information
export default function BinTaskCard({ task }: BinTaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBinStatusColor = (status: string) => {
    return status === 'FULL'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header with Bin ID */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Bin #{task.binId}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.requestStatus)}`}>
          {task.requestStatus}
        </span>
      </div>

      {/* Bin Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Bin Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getBinStatusColor(task.binStatus)}`}>
            {task.binStatus}
          </span>
        </div>

        {/* Location Information - HCI Principle: Visibility of system status */}
        <div className="border-t border-gray-100 pt-2 mt-2">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-xs font-mono text-gray-700">
                {task.latitude.toFixed(6)}, {task.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Task Status Indicator - HCI Principle: Recognition rather than recall */}
        {task.requestStatus === 'COMPLETED' && (
          <div className="flex items-center space-x-2 mt-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
