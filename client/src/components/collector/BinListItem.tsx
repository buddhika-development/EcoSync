'use client';

import { MapPin, User, Phone, CheckCircle, Circle, XCircle } from 'lucide-react';
import { BinDetails } from '@/types/pickup';

/**
 * BinListItem Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Displays single bin information only
 * - Open/Closed: Extensible through props, closed for modification
 * - Interface Segregation: Clean props interface
 * 
 * Design Pattern: Presentational Component
 */

interface BinListItemProps {
    bin: BinDetails;
    onScanClick?: (bin: BinDetails) => void;
}

/**
 * Get status badge styling
 * Design Pattern: Strategy Pattern for status styling
 * 
 * Request Status Types:
 * - PENDING: Bin is full, waiting to be scheduled
 * - SCHEDULED: Bin assigned to a route, ready for collection
 * - COLLECTED: Bin successfully collected by collector
 * - CANCELLED: Collection request was cancelled
 */
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'COLLECTED':
            return {
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                icon: CheckCircle,
                label: 'Collected',
            };
        case 'CANCELLED':
            return {
                bgColor: 'bg-red-100',
                textColor: 'text-red-700',
                icon: XCircle,
                label: 'Cancelled',
            };
        case 'SCHEDULED':
            return {
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
                icon: Circle,
                label: 'Scheduled',
            };
        case 'PENDING':
        default:
            return {
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-700',
                icon: Circle,
                label: 'Pending',
            };
    }
};

export default function BinListItem({ bin, onScanClick }: BinListItemProps) {
    const statusStyle = getStatusStyle(bin.request_status);
    const StatusIcon = statusStyle.icon;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Bin ID and Status */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">
                        {bin.bin_id.substring(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Bin ID
                    </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusStyle.bgColor}`}>
                    <StatusIcon className={`w-4 h-4 ${statusStyle.textColor}`} />
                    <span className={`text-sm font-medium ${statusStyle.textColor}`}>
                        {statusStyle.label}
                    </span>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                    <p className="text-gray-700">
                        {bin.latitude.toFixed(6)}, {bin.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500">GPS Coordinates</p>
                </div>
            </div>

            {/* Owner Information */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-gray-700 font-medium">
                            {bin.user_first_name} {bin.user_last_name}
                        </p>
                        <p className="text-xs text-gray-500">Bin Owner</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-gray-700">{bin.user_contact_number}</p>
                        <p className="text-xs text-gray-500">Contact Number</p>
                    </div>
                </div>
            </div>

            {/* Scan Button */}
            <button
                onClick={() => onScanClick?.(bin)}
                disabled={bin.request_status !== 'PENDING' && bin.request_status !== 'SCHEDULED'}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${bin.request_status === 'PENDING' || bin.request_status === 'SCHEDULED'
                    ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {bin.request_status === 'PENDING' || bin.request_status === 'SCHEDULED' ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Scan QR Code
                    </>
                ) : (
                    'Already Processed'
                )}
            </button>
        </div>
    );
}
