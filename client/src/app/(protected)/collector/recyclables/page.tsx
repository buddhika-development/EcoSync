'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2, AlertCircle, Package } from 'lucide-react';
import RecyclableRequestCard from '@/components/collector/RecyclableRequestCard';
import { fetchAllRecyclableRequests } from '@/services/recyclableRequests.service';
import type { RecyclableRequest, RecyclableStatus, RecyclableCategory } from '@/types/recyclable';
import { RECYCLABLE_STATUS_LABELS, RECYCLABLE_CATEGORY_LABELS } from '@/types/recyclable';

export default function CollectorRecyclables() {
    const [requests, setRequests] = useState<RecyclableRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RecyclableStatus | 'ALL'>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<RecyclableCategory | 'ALL'>('ALL');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAllRecyclableRequests();
            if (response.ok) {
                setRequests(response.data);
            } else {
                setError(response.message || 'Failed to fetch recyclable requests');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching requests');
        } finally {
            setLoading(false);
        }
    };

    // Filter and search logic
    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                searchQuery === '' ||
                request.users?.user_first_name?.toLowerCase().includes(searchLower) ||
                request.users?.user_last_name?.toLowerCase().includes(searchLower) ||
                request.users?.user_email_address?.toLowerCase().includes(searchLower) ||
                request.users?.user_contact_number?.includes(searchQuery) ||
                request.id.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;

            // Category filter
            const matchesCategory = categoryFilter === 'ALL' || request.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [requests, searchQuery, statusFilter, categoryFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Recyclable Collection Requests</h1>
                <p className="text-gray-600">Manage pickup requests from residents</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                id="search"
                                type="text"
                                placeholder="Search by name, email, phone, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as RecyclableStatus | 'ALL')}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                {Object.entries(RECYCLABLE_STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Waste Type
                        </label>
                        <div className="relative">
                            <select
                                id="category-filter"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value as RecyclableCategory | 'ALL')}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                            >
                                <option value="ALL">All Categories</option>
                                {Object.entries(RECYCLABLE_CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredRequests.length}</span> of{' '}
                        <span className="font-semibold text-gray-900">{requests.length}</span> requests
                    </p>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-600">Loading recyclable requests...</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Error Loading Requests</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadRequests}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">No Requests Found</p>
                    <p className="text-gray-600 text-center">
                        {requests.length === 0
                            ? 'There are no recyclable collection requests at the moment.'
                            : 'No requests match your search or filter criteria.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((request) => (
                        <RecyclableRequestCard key={request.id} request={request} />
                    ))}
                </div>
            )}
        </div>
    );
}
