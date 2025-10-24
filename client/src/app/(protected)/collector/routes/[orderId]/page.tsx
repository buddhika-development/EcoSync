'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { BinDetails } from '@/types/pickup';
import { pickupRoutesService } from '@/services/pickupRoutes.service';
import BinListItem from '@/components/collector/BinListItem';
import QRScannerModal from '@/components/collector/QRScannerModal';

/**
 * Dynamically import RouteMap to avoid SSR issues with Leaflet
 * Leaflet requires browser APIs not available during server-side rendering
 */
const RouteMap = dynamic(
    () => import('@/components/collector/RouteMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        ),
    }
);

/**
 * RouteDetailsPage Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages route details display and actions
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Depends on service abstractions
 * 
 * Design Pattern: Container/Presentational Pattern
 */
export default function RouteDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    // State Management
    const [bins, setBins] = useState<BinDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // QR Scanner State
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedBin, setSelectedBin] = useState<BinDetails | null>(null);

    /**
     * Calculate route statistics
     * SOLID: Single Responsibility - handles only statistics calculation
     */
    const routeStats = useMemo(() => {
        const total = bins.length;
        const collected = bins.filter(b => b.request_status === 'COLLECTED').length;
        // PENDING and SCHEDULED both mean "not yet collected"
        const pending = bins.filter(b =>
            b.request_status === 'PENDING' || b.request_status === 'SCHEDULED'
        ).length;
        const cancelled = bins.filter(b => b.request_status === 'CANCELLED').length;
        // Can complete only when no bins are pending (PENDING/SCHEDULED)
        // COLLECTED and CANCELLED bins are considered "done"
        const canComplete = pending === 0 && total > 0;
        const routeStatus = bins[0]?.area_name || 'Unknown Area';
        const scheduledDate = bins[0]?.scheduled_date || '';

        return { total, collected, pending, cancelled, canComplete, routeStatus, scheduledDate };
    }, [bins]);

    /**
     * Fetch route details
     */
    const fetchRouteDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await pickupRoutesService.fetchRouteDetails(orderId);
            setBins(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load route details');
            console.error('Error fetching route details:', err);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchRouteDetails();
    }, [fetchRouteDetails]);

    /**
     * Handle Complete Route
     * SOLID: Single Responsibility - handles only route completion
     */
    const handleCompleteRoute = async () => {
        if (!routeStats.canComplete) {
            alert('Cannot complete route. All bins must be collected or cancelled first.');
            return;
        }

        const confirmed = window.confirm(
            `Complete this route for ${routeStats.routeStatus}?\n\n` +
            `Total Bins: ${routeStats.total}\n` +
            `Collected: ${routeStats.collected}\n` +
            `Cancelled: ${routeStats.cancelled}\n\n` +
            `This action will mark the route as COMPLETED.`
        );

        if (!confirmed) return;

        try {
            setIsProcessing(true);
            const result = await pickupRoutesService.updatePickupStatus(orderId, 'COMPLETED');
            alert(result.message || 'Route completed successfully!');
            router.push('/collector/dashboard');
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to complete route. Please try again.'
            );
            console.error('Error completing route:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Handle Cancel Route
     * SOLID: Single Responsibility - handles only route cancellation
     */
    const handleCancelRoute = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to CANCEL this route?\n\n` +
            `Area: ${routeStats.routeStatus}\n` +
            `Total Bins: ${routeStats.total}\n\n` +
            `This will cancel the entire pickup order.`
        );

        if (!confirmed) return;

        try {
            setIsProcessing(true);
            const result = await pickupRoutesService.updatePickupStatus(orderId, 'CANCELLED');
            alert(result.message || 'Route cancelled successfully!');
            router.push('/collector/dashboard');
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to cancel route. Please try again.'
            );
            console.error('Error cancelling route:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Handle Scan button click - Open QR scanner modal
     * SOLID: Single Responsibility - handles only modal opening
     */
    const handleScanClick = (bin: BinDetails) => {
        setSelectedBin(bin);
        setIsQRModalOpen(true);
    };

    /**
     * Handle QR scan success - Refresh data
     * SOLID: Single Responsibility - handles only data refresh after scan
     */
    const handleQRScanSuccess = () => {
        // Refresh route details to get updated bin statuses
        fetchRouteDetails();
    };

    /**
     * Handle QR modal close
     */
    const handleQRModalClose = () => {
        setIsQRModalOpen(false);
        setSelectedBin(null);
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading route details...</p>
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
                        Failed to Load Route
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={fetchRouteDetails}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Routes</span>
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {routeStats.routeStatus}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Scheduled: {new Date(routeStats.scheduledDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                    In Progress
                </div>
            </div>

            {/* Map View */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Map View</h2>
                {bins && bins.length > 0 ? (
                    <>
                        <RouteMap bins={bins} onBinClick={handleScanClick} />
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Showing {routeStats.total} collection point{routeStats.total !== 1 ? 's' : ''}
                        </p>
                    </>
                ) : (
                    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600">No collection points to display</p>
                    </div>
                )}
            </div>

            {/* Collection Points List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Collection Points</h2>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-700">{routeStats.collected}</p>
                        <p className="text-sm text-green-600">Collected</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-700">{routeStats.pending}</p>
                        <p className="text-sm text-orange-600">Pending</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">{routeStats.cancelled}</p>
                        <p className="text-sm text-red-600">Cancelled</p>
                    </div>
                </div>

                {/* Bins Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bins.map((bin) => (
                        <BinListItem
                            key={bin.bin_id}
                            bin={bin}
                            onScanClick={handleScanClick}
                        />
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
                <button
                    onClick={handleCancelRoute}
                    disabled={isProcessing}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isProcessing ? 'Processing...' : 'Cancel Route'}
                </button>
                <button
                    onClick={handleCompleteRoute}
                    disabled={!routeStats.canComplete || isProcessing}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${routeStats.canComplete && !isProcessing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isProcessing ? 'Processing...' : 'Complete Route'}
                </button>
            </div>

            {/* Completion Info */}
            {!routeStats.canComplete && routeStats.pending > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You must collect or cancel all pending bins before completing the route.
                        Currently {routeStats.pending} bin{routeStats.pending !== 1 ? 's' : ''} pending.
                    </p>
                </div>
            )}

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={isQRModalOpen}
                bin={selectedBin}
                onClose={handleQRModalClose}
                onSuccess={handleQRScanSuccess}
            />
        </div>
    );
}
