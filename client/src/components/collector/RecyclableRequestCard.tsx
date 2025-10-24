'use client';

import { Phone, Mail, Calendar, Scale } from 'lucide-react';
import Link from 'next/link';
import type { RecyclableRequest } from '@/types/recyclable';
import {
    RECYCLABLE_STATUS_LABELS,
    RECYCLABLE_STATUS_COLORS,
    RECYCLABLE_CATEGORY_LABELS,
    RECYCLABLE_CATEGORY_ICONS,
    RECYCLABLE_TYPE_LABELS,
} from '@/types/recyclable';

interface RecyclableRequestCardProps {
    request: RecyclableRequest;
}

export default function RecyclableRequestCard({ request }: RecyclableRequestCardProps) {
    const statusColors = RECYCLABLE_STATUS_COLORS[request.status];
    const categoryIcon = RECYCLABLE_CATEGORY_ICONS[request.category];
    const categoryLabel = RECYCLABLE_CATEGORY_LABELS[request.category];
    const typeLabel = RECYCLABLE_TYPE_LABELS[request.type];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
            {/* Header with Status Badge */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{categoryIcon}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{categoryLabel}</h3>
                        </div>
                        <p className="text-sm text-gray-600">Request ID: {request.recyclable_collect_request_id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                        >
                            {RECYCLABLE_STATUS_LABELS[request.status]}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {typeLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
                {/* User Information */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Resident Information</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-700 font-semibold text-sm">
                                    {request.users.user_first_name.charAt(0)}
                                    {request.users.user_last_name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {request.users.user_first_name} {request.users.user_last_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${request.users.user_contact_number}`} className="hover:text-green-600 transition-colors">
                                {request.users.user_contact_number}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${request.users.user_email_address}`} className="hover:text-green-600 transition-colors truncate">
                                {request.users.user_email_address}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Scale className="w-4 h-4 text-gray-400" />
                            <span>Weight (estimated):</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{request.weight} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Requested:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{formatDate(request.created_at)}</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href={`/collector/recyclables/${request.recyclable_collect_request_id}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
