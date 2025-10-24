'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { RecyclableStatus, RecyclableCategory, UpdateRecyclableStatusPayload } from '@/types/recyclable';
import { RECYCLABLE_STATUS_LABELS, RECYCLABLE_CATEGORY_LABELS } from '@/types/recyclable';

interface UpdateStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (payload: UpdateRecyclableStatusPayload) => Promise<void>;
    currentStatus: RecyclableStatus;
    currentCategory: RecyclableCategory;
    currentWeight: number;
}

export default function UpdateStatusModal({
    isOpen,
    onClose,
    onUpdate,
    currentStatus,
    currentCategory,
    currentWeight,
}: UpdateStatusModalProps) {
    const [status, setStatus] = useState<RecyclableStatus>(currentStatus);
    const [category, setCategory] = useState<RecyclableCategory>(currentCategory);
    const [weight, setWeight] = useState<string>(currentWeight.toString());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStatus(currentStatus);
            setCategory(currentCategory);
            setWeight(currentWeight.toString());
            setShowConfirmation(false);
            setError(null);
        }
    }, [isOpen, currentStatus, currentCategory, currentWeight]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        try {
            setIsUpdating(true);
            setError(null);

            const payload: UpdateRecyclableStatusPayload = {
                status,
            };

            // Only include category if status is COMPLETED or if it changed
            if (status === 'COMPLETED' || category !== currentCategory) {
                payload.category = category;
            }

            // Only include weight if status is COMPLETED and weight was entered
            if (status === 'COMPLETED' && weight.trim()) {
                const weightNum = parseFloat(weight);
                if (isNaN(weightNum) || weightNum <= 0) {
                    setError('Please enter a valid weight greater than 0');
                    setIsUpdating(false);
                    return;
                }
                payload.weight = weightNum;
            }

            await onUpdate(payload);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update request');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Update Request Status</h2>
                    <button
                        onClick={onClose}
                        disabled={isUpdating}
                        className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!showConfirmation ? (
                    /* Update Form */
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Status Selection */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as RecyclableStatus)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                {Object.entries(RECYCLABLE_STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                                Waste Category {status === 'COMPLETED' && '*'}
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as RecyclableCategory)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required={status === 'COMPLETED'}
                            >
                                {Object.entries(RECYCLABLE_CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Confirm the exact waste category</p>
                        </div>

                        {/* Weight Input */}
                        <div>
                            <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-2">
                                Actual Weight (kg) {status === 'COMPLETED' && '(Optional)'}
                            </label>
                            <input
                                id="weight"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1000"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Enter actual weight"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {status === 'COMPLETED'
                                    ? 'Enter the actual weight if available'
                                    : 'Leave empty if status is not completed'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Confirmation Dialog */
                    <div className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Update</h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to update this recyclable request?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-semibold text-gray-900">
                                            {RECYCLABLE_STATUS_LABELS[status]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-semibold text-gray-900">
                                            {RECYCLABLE_CATEGORY_LABELS[category]}
                                        </span>
                                    </div>
                                    {weight && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Weight:</span>
                                            <span className="font-semibold text-gray-900">{weight} kg</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Go Back
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Confirm Update
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
