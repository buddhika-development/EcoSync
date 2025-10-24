import { PickupRoute, PickupStatus, RouteFilters } from '@/types/pickup';

/**
 * Utility class for filtering and sorting pickup routes
 * SOLID: Single Responsibility - Handles only route filtering/sorting logic
 * Design Pattern: Strategy Pattern (different sorting strategies)
 */
export class RouteFilterUtil {
    /**
     * Filter routes by status
     */
    static filterByStatus(
        routes: PickupRoute[],
        status: PickupStatus | 'ALL'
    ): PickupRoute[] {
        if (status === 'ALL') {
            return routes;
        }
        return routes.filter((route) => route.status === status);
    }

    /**
     * Filter routes by search query (searches in area name)
     */
    static filterBySearch(routes: PickupRoute[], query: string): PickupRoute[] {
        if (!query.trim()) {
            return routes;
        }

        const lowerQuery = query.toLowerCase().trim();
        return routes.filter((route) =>
            route.area_name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Sort routes by different criteria
     */
    static sortRoutes(
        routes: PickupRoute[],
        sortBy: 'date' | 'area' | 'bins'
    ): PickupRoute[] {
        const sorted = [...routes]; // Create copy to avoid mutation

        switch (sortBy) {
            case 'date':
                return sorted.sort(
                    (a, b) =>
                        new Date(a.scheduled_date).getTime() -
                        new Date(b.scheduled_date).getTime()
                );

            case 'area':
                return sorted.sort((a, b) =>
                    a.area_name.localeCompare(b.area_name)
                );

            case 'bins':
                return sorted.sort((a, b) => b.task_count - a.task_count);

            default:
                return sorted;
        }
    }

    /**
     * Apply all filters and sorting
     */
    static applyFilters(
        routes: PickupRoute[],
        filters: RouteFilters
    ): PickupRoute[] {
        let filtered = routes;

        // Apply status filter
        filtered = this.filterByStatus(filtered, filters.status);

        // Apply search filter
        filtered = this.filterBySearch(filtered, filters.searchQuery);

        // Apply sorting
        filtered = this.sortRoutes(filtered, filters.sortBy);

        return filtered;
    }

    /**
     * Count routes by status
     */
    static countByStatus(
        routes: PickupRoute[]
    ): Record<string, number> {
        const counts: Record<string, number> = {
            ALL: routes.length,
            SCHEDULED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };

        routes.forEach((route) => {
            counts[route.status] = (counts[route.status] || 0) + 1;
        });

        return counts;
    }

    /**
     * Check if any routes are overdue
     */
    static hasOverdueRoutes(routes: PickupRoute[]): boolean {
        return routes.some((route) => route.is_overdue);
    }
}
