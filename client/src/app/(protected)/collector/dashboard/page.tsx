'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { PickupRoute, PickupStatus, RouteFilters } from '@/types/pickup';
import { pickupRoutesService } from '@/services/pickupRoutes.service';
import { RouteFilterUtil } from '@/utils/routeFilter.util';
import RouteCard from '@/components/collector/RouteCard';
import StatusFilter from '@/components/collector/StatusFilter';

/**
 * CollectorDashboard Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages pickup routes display and interactions
 * - Open/Closed: Extensible through composition, closed for modification
 * - Dependency Inversion: Depends on service abstraction, not concrete implementation
 * 
 * Design Patterns:
 * - Container/Presentational: This is the container component
 * - Observer: React hooks for state management
 */
export default function CollectorDashboard() {
    // State Management
    const [routes, setRoutes] = useState<PickupRoute[]>([]);
    const [filteredRoutes, setFilteredRoutes] = useState<PickupRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<RouteFilters>({
        status: 'ALL',
        searchQuery: '',
        sortBy: 'date',
    });

    const router = useRouter();

    /**
     * Fetch pickup routes from API
     * SOLID: Single Responsibility - handles only data fetching
     */
    const fetchRoutes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await pickupRoutesService.fetchPickupRoutes();
            setRoutes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load pickup routes');
            console.error('Error fetching routes:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Apply filters whenever routes or filter criteria change
     * SOLID: Single Responsibility - handles only filtering logic
     */
    useEffect(() => {
        const filtered = RouteFilterUtil.applyFilters(routes, filters);
        setFilteredRoutes(filtered);
    }, [routes, filters]);

    /**
     * Initial data fetch
     */
    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
    };

    /**
     * Handle status filter change
     */
    const handleStatusChange = (status: PickupStatus | 'ALL') => {
        setFilters((prev) => ({ ...prev, status }));
    };

    /**
     * Handle sort change
     */
    const handleSortChange = (sortBy: 'date' | 'area' | 'bins') => {
        setFilters((prev) => ({ ...prev, sortBy }));
    };

    /**
     * Handle route card action click
     */
    const handleRouteAction = async (route: PickupRoute) => {
        // If route is scheduled, show confirmation and update status
        if (route.status === 'SCHEDULED') {
            const confirmed = window.confirm(
                `Are you sure you want to start the route for ${route.area_name}?\n\n` +
                `This will change the status to IN PROGRESS.`
            );

            if (!confirmed) {
                return;
            }

            try {
                // Update status to IN_PROGRESS
                const result = await pickupRoutesService.updatePickupStatus(
                    route.order_id,
                    'IN_PROGRESS'
                );

                // Show success message
                alert(result.message || 'Route started successfully!');

                // Refresh the routes to show updated status
                await fetchRoutes();

                // Navigate to route details page
                router.push(`/collector/routes/${route.order_id}`);
            } catch (error) {
                // Show error message
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Failed to start route. Please try again.'
                );
                console.error('Error starting route:', error);
            }
        } else {
            // For other statuses, just navigate to details page
            router.push(`/collector/routes/${route.order_id}`);
        }
    };

    // Calculate status counts
    const statusCounts = RouteFilterUtil.countByStatus(routes);

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your routes...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to Load Routes
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchRoutes}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Pickup Routes</h1>
                <p className="text-gray-600 mt-1">Manage and track your collection routes</p>
            </div>

            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1  relative">
                    <input
                        type="text"
                        placeholder="Search route or area..."
                        value={filters.searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative sm:w-48">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleSortChange(e.target.value as 'date' | 'area' | 'bins')}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="area">Sort by Area</option>
                        <option value="bins">Sort by Bins</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Status Filter */}
            <StatusFilter
                activeStatus={filters.status}
                onStatusChange={handleStatusChange}
                counts={statusCounts}
            />

            {/* Routes Grid */}
            {filteredRoutes.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No routes found
                    </h3>
                    <p className="text-gray-600">
                        {filters.searchQuery || filters.status !== 'ALL'
                            ? 'Try adjusting your filters'
                            : 'No pickup routes assigned yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.map((route) => (
                        <RouteCard
                            key={route.order_id}
                            route={route}
                            onActionClick={handleRouteAction}
                        />
                    ))}
                </div>
            )}

            {/* Results Summary */}
            {filteredRoutes.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                    Showing {filteredRoutes.length} of {routes.length} route
                    {routes.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
