import { PickupStatus } from '@/types/pickup';

/**
 * Props interface for StatusFilter component
 */
interface StatusFilterProps {
    activeStatus: PickupStatus | 'ALL';
    onStatusChange: (status: PickupStatus | 'ALL') => void;
    counts?: Record<string, number>;
}

/**
 * Status filter configuration
 * SOLID: Open/Closed Principle - Easy to extend with new statuses
 */
const STATUS_FILTERS: Array<{ value: PickupStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In-Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
];

/**
 * StatusFilter Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles status filtering UI
 * - Open/Closed: Easy to extend with new filter types
 * 
 * Design Pattern: Controlled Component
 */
export default function StatusFilter({
    activeStatus,
    onStatusChange,
    counts
}: StatusFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
                const isActive = activeStatus === filter.value;
                const count = counts?.[filter.value] ?? 0;

                return (
                    <button
                        key={filter.value}
                        onClick={() => onStatusChange(filter.value)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                        `}
                    >
                        {filter.label}
                        {counts && count > 0 && (
                            <span
                                className={`ml-1.5 ${isActive ? 'text-green-100' : 'text-gray-500'
                                    }`}
                            >
                                ({count})
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
