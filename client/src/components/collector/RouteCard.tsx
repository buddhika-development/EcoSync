import { PickupRoute, PickupStatus } from '@/types/pickup';
import { Calendar, MapPin, Package } from 'lucide-react';

/**
 * Props interface following SOLID principles
 * Single Responsibility: Only defines component contract
 */
interface RouteCardProps {
    route: PickupRoute;
    onActionClick: (route: PickupRoute) => void;
}

/**
 * Utility function to get status styling
 * SOLID: Single Responsibility - handles only status styling logic
 */
function getStatusStyle(status: PickupStatus): {
    bg: string;
    text: string;
    label: string;
} {
    const statusMap = {
        SCHEDULED: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            label: 'Scheduled'
        },
        IN_PROGRESS: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            label: 'In Progress'
        },
        COMPLETED: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            label: 'Completed'
        },
        CANCELLED: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            label: 'Cancelled'
        }
    };

    return statusMap[status] || statusMap.SCHEDULED;
}

/**
 * Utility function to get action button styling
 * SOLID: Single Responsibility - handles only button styling logic
 */
function getActionButtonStyle(status: PickupStatus): {
    bg: string;
    hover: string;
    text: string;
    label: string;
} {
    const buttonMap = {
        SCHEDULED: {
            bg: 'bg-green-600',
            hover: 'hover:bg-green-700',
            text: 'text-white',
            label: 'Start Route'
        },
        IN_PROGRESS: {
            bg: 'bg-yellow-500',
            hover: 'hover:bg-yellow-600',
            text: 'text-white',
            label: 'Continue'
        },
        COMPLETED: {
            bg: 'bg-gray-100',
            hover: 'hover:bg-gray-200',
            text: 'text-gray-700',
            label: 'View Summary'
        },
        CANCELLED: {
            bg: 'bg-gray-100',
            hover: 'hover:bg-gray-200',
            text: 'text-gray-700',
            label: 'View Details'
        }
    };

    return buttonMap[status] || buttonMap.SCHEDULED;
}

/**
 * Utility function to format date
 * SOLID: Single Responsibility - handles only date formatting
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Utility function to format time
 * SOLID: Single Responsibility - handles only time formatting
 */
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * RouteCard Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Displays a single pickup route card
 * - Open/Closed: Extensible through props, closed for modification
 * - Dependency Inversion: Depends on abstractions (PickupRoute interface)
 * 
 * Design Pattern: Presentational Component
 */
export default function RouteCard({ route, onActionClick }: RouteCardProps) {
    const statusStyle = getStatusStyle(route.status);
    const actionButton = getActionButtonStyle(route.status);
    const isOverdue = route.is_overdue;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Header with Zone Name and Status Badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                        {route.area_name}
                    </h3>
                    {isOverdue && (
                        <span className="inline-block mt-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            Overdue
                        </span>
                    )}
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Route Details */}
            <div className="space-y-3 mb-6">
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{route.area_name}</span>
                </div>

                {/* Scheduled Date and Time */}
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                        {formatDate(route.scheduled_date)} at {formatTime(route.scheduled_date)}
                    </span>
                </div>

                {/* Bins Count */}
                <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                        {route.task_count} bin{route.task_count !== 1 ? 's' : ''}
                        {route.pending_task_count > 0 && (
                            <span className="text-yellow-600 ml-1">
                                ({route.pending_task_count} pending)
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => onActionClick(route)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${actionButton.bg} ${actionButton.hover} ${actionButton.text}`}
            >
                {actionButton.label}
            </button>
        </div>
    );
}
