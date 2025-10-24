'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Scale,
    Package,
    User,
    Clock,
    Loader2,
    AlertCircle,
    Edit,
    CheckCircle,
} from 'lucide-react';
import UpdateStatusModal from '@/components/collector/UpdateStatusModal';
import { fetchRecyclableRequestDetails, updateRecyclableRequestStatus } from '@/services/recyclableRequests.service';
import type { RecyclableRequestDetail, UpdateRecyclableStatusPayload } from '@/types/recyclable';
import {
    RECYCLABLE_STATUS_LABELS,
    RECYCLABLE_STATUS_COLORS,
    RECYCLABLE_CATEGORY_LABELS,
    RECYCLABLE_CATEGORY_ICONS,
    RECYCLABLE_TYPE_LABELS,
} from '@/types/recyclable';

export default function RecyclableDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.requestId as string;

    const [request, setRequest] = useState<RecyclableRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        if (requestId) {
            loadRequestDetails();
        }
    }, [requestId]);

    const loadRequestDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchRecyclableRequestDetails(requestId);
            if (response.ok) {
                setRequest(response.data);
            } else {
                setError(response.message || 'Failed to fetch request details');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching request details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (payload: UpdateRecyclableStatusPayload) => {
        await updateRecyclableRequestStatus(requestId, payload);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        await loadRequestDetails();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading request details...</p>
                </div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Request</h2>
                    <p className="text-gray-600 mb-6">{error || 'Request not found'}</p>
                    <button
                        onClick={() => router.push('/collector/recyclables')}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Back to Requests
                    </button>
                </div>
            </div>
        );
    }

    const statusColors = RECYCLABLE_STATUS_COLORS[request.status];
    const categoryIcon = RECYCLABLE_CATEGORY_ICONS[request.category];
    const categoryLabel = RECYCLABLE_CATEGORY_LABELS[request.category];
    const typeLabel = RECYCLABLE_TYPE_LABELS[request.type];

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {updateSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Request updated successfully!</p>
                </div>
            )}

            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/collector/recyclables')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
                    <p className="text-gray-600">ID: {request.recyclable_collect_request_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status and Category */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{categoryIcon}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{categoryLabel}</h2>
                                        <p className="text-sm text-gray-600">{typeLabel} Request</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                                >
                                    {RECYCLABLE_STATUS_LABELS[request.status]}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Scale className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="text-lg font-bold text-gray-900">{request.weight} kg</p>
                                        <p className="text-xs text-gray-500">Estimated</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Area</p>
                                        <p className="text-lg font-bold text-gray-900">{request.area.area_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Created</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Last Updated</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(request.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Status Button */}
                    {request.status === 'PENDING' ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            Update Request Status
                        </button>
                    ) : (
                        <div className="w-full bg-gray-100 border-2 border-gray-200 text-gray-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                            <CheckCircle className="w-5 h-5" />
                            {request.status === 'COMPLETED' ? 'Request Already Completed' : 'Request Cancelled'}
                        </div>
                    )}
                </div>

                {/* Sidebar - User Information */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Resident Information
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* User Avatar and Name */}
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <span className="text-white font-bold text-xl">
                                        {request.users.user_first_name.charAt(0)}
                                        {request.users.user_last_name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {request.users.user_first_name} {request.users.user_last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">Resident</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-xs font-medium">Phone Number</span>
                                    </div>
                                    <a
                                        href={`tel:${request.users.user_contact_number}`}
                                        className="block px-4 py-2.5 bg-gray-50 hover:bg-green-50 rounded-lg text-sm font-medium text-gray-900 hover:text-green-700 transition-colors"
                                    >
                                        {request.users.user_contact_number}
                                    </a>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs font-medium">Email Address</span>
                                    </div>
                                    <a
                                        href={`mailto:${request.users.user_email_address}`}
                                        className="block px-4 py-2.5 bg-gray-50 hover:bg-green-50 rounded-lg text-sm font-medium text-gray-900 hover:text-green-700 transition-colors break-all"
                                    >
                                        {request.users.user_email_address}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Status Modal */}
            <UpdateStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdate}
                currentStatus={request.status}
                currentCategory={request.category}
                currentWeight={request.weight}
            />
        </div>
    );
}
