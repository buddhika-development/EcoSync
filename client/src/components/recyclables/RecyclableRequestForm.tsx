'use client';

import { useState, useEffect } from 'react';
import { Trash2, Package, Recycle, MapPin, Weight, CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';
import { fetchAllAreas } from '@/services/areas.service';
import { createRecyclableRequest } from '@/services/recyclableRequests.service';
import type { Area } from '@/types/area';
import type { CreateRecyclableRequestPayload, RecyclableCategory } from '@/types/recyclable';
import { RECYCLABLE_CATEGORY_LABELS, RECYCLABLE_CATEGORY_ICONS } from '@/types/recyclable';

interface RecyclableRequestFormProps {
    userId: string;
    onSuccess?: () => void;
}

interface FormData {
    area_id: string;
    type: 'PICKUP' | 'DROP-OFF';
    category: RecyclableCategory | '';
    weight: string;
}

interface Notification {
    type: 'success' | 'error';
    message: string;
}

export default function RecyclableRequestForm({ userId, onSuccess }: RecyclableRequestFormProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [formData, setFormData] = useState<FormData>({
        area_id: '',
        type: 'PICKUP',
        category: '',
        weight: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(true);
    const [notification, setNotification] = useState<Notification | null>(null);

    // Fetch areas on component mount
    useEffect(() => {
        const loadAreas = async () => {
            try {
                const response = await fetchAllAreas();
                if (response.ok && response.data) {
                    setAreas(response.data);
                }
                // No error thrown - service returns empty array as fallback
            } catch (error) {
                console.error('Failed to fetch areas:', error);
                // Areas will remain empty array
            } finally {
                setLoadingAreas(false);
            }
        };

        loadAreas();
    }, []);

    // Auto-dismiss notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTypeChange = (type: 'PICKUP' | 'DROP-OFF') => {
        setFormData((prev) => ({
            ...prev,
            type,
        }));
    };

    const validateForm = (): string | null => {
        if (!formData.area_id) return 'Please select an area';
        if (!formData.category) return 'Please select a waste category';
        if (!formData.weight) return 'Please enter weight';

        const weightNum = parseFloat(formData.weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            return 'Weight must be a positive number';
        }
        if (weightNum > 1000) {
            return 'Weight cannot exceed 1000 kg';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setNotification({
                type: 'error',
                message: validationError,
            });
            return;
        }

        setLoading(true);
        setNotification(null);

        try {
            const payload: CreateRecyclableRequestPayload = {
                user_id: userId,
                area_id: formData.area_id,
                type: formData.type,
                category: formData.category as RecyclableCategory,
                weight: parseFloat(formData.weight),
            };

            const response = await createRecyclableRequest(payload);

            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: response.message || 'Request created successfully!',
                });

                // Reset form
                setFormData({
                    area_id: '',
                    type: 'PICKUP',
                    category: '',
                    weight: '',
                });

                // Trigger parent callback
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error(response.message || 'Failed to create request');
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to create request',
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedArea = areas.find((area) => area.area_id === formData.area_id);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Recycle className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        New Recyclable Request
                    </h2>
                    <p className="text-sm text-gray-500">
                        Schedule a collection or arrange drop-off
                    </p>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300 ${notification.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                        className={`text-sm font-medium ${notification.type === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'
                            }`}
                    >
                        {notification.message}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Request Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('PICKUP')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'PICKUP'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Trash2
                                className={`h-6 w-6 mx-auto mb-2 ${formData.type === 'PICKUP'
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                                    }`}
                            />
                            <div
                                className={`text-sm font-semibold ${formData.type === 'PICKUP'
                                    ? 'text-green-700'
                                    : 'text-gray-600'
                                    }`}
                            >
                                Pickup
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Collect from my location
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange('DROP-OFF')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'DROP-OFF'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Package
                                className={`h-6 w-6 mx-auto mb-2 ${formData.type === 'DROP-OFF'
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                                    }`}
                            />
                            <div
                                className={`text-sm font-semibold ${formData.type === 'DROP-OFF'
                                    ? 'text-green-700'
                                    : 'text-gray-600'
                                    }`}
                            >
                                Drop-off
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                I'll deliver to center
                            </div>
                        </button>
                    </div>
                </div>

                {/* Drop-off Instructions */}
                {formData.type === 'DROP-OFF' && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 animate-in slide-in-from-top duration-300">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 mb-1">
                                    Drop-off Instructions
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Please follow these steps for a successful drop-off
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Visit the Collection Center
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Go to your selected area's collection center during operating hours
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Meet the Assigned Collector
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Inform the collector that you've submitted a drop-off request online
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Verify Weight Measurement
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Watch carefully as the collector weighs your recyclables and confirm the measurement is accurate
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Request Completion
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        The collector will mark your request as completed in their system
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                    5
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Check Your Dashboard
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        After completion, verify in your dashboard that the status shows "COMPLETED" with the correct weight
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-amber-900">
                                    Important Reminder
                                </p>
                                <p className="text-xs text-amber-800 mt-1">
                                    Always double-check the weight measurement and ensure you receive confirmation before leaving.
                                    Your recycle coins will be calculated based on the final recorded weight.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Area Selection */}
                <div>
                    <label
                        htmlFor="area_id"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            Collection Area
                        </div>
                    </label>
                    <select
                        id="area_id"
                        name="area_id"
                        value={formData.area_id}
                        onChange={handleInputChange}
                        disabled={loadingAreas}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                    >
                        <option value="">
                            {loadingAreas ? 'Loading areas...' : 'Select an area'}
                        </option>
                        {areas.map((area) => (
                            <option key={area.area_id} value={area.area_id}>
                                {area.area_name}
                                {area.collector && ` - Collector: ${area.collector.user_first_name} ${area.collector.user_last_name}`}
                            </option>
                        ))}
                    </select>
                    {selectedArea && selectedArea.collector && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            Assigned to: {selectedArea.collector.user_first_name}{' '}
                            {selectedArea.collector.user_last_name}
                        </p>
                    )}
                </div>

                {/* Category Selection */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        Waste Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(RECYCLABLE_CATEGORY_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() =>
                                    setFormData((prev) => ({ ...prev, category: key as RecyclableCategory }))
                                }
                                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${formData.category === key
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl">{RECYCLABLE_CATEGORY_ICONS[key as RecyclableCategory]}</span>
                                <span
                                    className={`text-sm font-medium ${formData.category === key
                                        ? 'text-green-700'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weight Input */}
                <div>
                    <label
                        htmlFor="weight"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-gray-500" />
                            Estimated Weight (kg)
                        </div>
                    </label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        max="1000"
                        placeholder="Enter weight in kilograms"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Maximum weight: 1000 kg
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || loadingAreas}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating Request...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-5 w-5" />
                            Submit Request
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
