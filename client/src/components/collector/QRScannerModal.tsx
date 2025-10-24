'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { BinDetails } from '@/types/pickup';
import { binQRService } from '@/services/binQR.service';

/**
 * QRScannerModal Component
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles QR scanning and validation only
 * - Open/Closed: Extensible through callbacks
 * - Dependency Inversion: Depends on service abstraction
 * 
 * Design Pattern: Presentational Component with Service Integration
 * 
 * Flow:
 * 1. Open camera for QR scanning
 * 2. Scan QR code
 * 3. Validate QR code with backend
 * 4. Show success/error state
 * 5. Allow collector to update status (COLLECTED/CANCELLED)
 */

interface QRScannerModalProps {
    isOpen: boolean;
    bin: BinDetails | null;
    onClose: () => void;
    onSuccess: () => void; // Callback to refresh data after status update
}

type ScanState = 'scanning' | 'validating' | 'valid' | 'invalid' | 'updating';

export default function QRScannerModal({
    isOpen,
    bin,
    onClose,
    onSuccess,
}: QRScannerModalProps) {
    // State Management
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [scannedData, setScannedData] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [cameraError, setCameraError] = useState<string>('');

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);

    /**
     * Reset state when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            console.log('🔄 Resetting QR Scanner state');
            setScanState('scanning');
            setScannedData('');
            setErrorMessage('');
            setCameraError('');
        }
    }, [isOpen]);

    /**
     * Initialize QR Scanner
     */
    useEffect(() => {
        if (!isOpen || !videoRef.current || !bin) return;

        console.log('🎥 Initializing QR Scanner for bin:', bin.bin_id);

        const scanner = new QrScanner(
            videoRef.current,
            (result) => {
                console.log('🔍 QR Scanner detected code:', result.data);
                handleQRScan(result.data);
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                preferredCamera: 'environment', // Use back camera on mobile
                maxScansPerSecond: 5, // Limit scan rate
            }
        );

        qrScannerRef.current = scanner;

        // Start scanner
        scanner.start()
            .then(() => {
                console.log('✅ QR Scanner started successfully');
                setCameraError('');
            })
            .catch((error) => {
                console.error('❌ Camera error:', error);
                setCameraError('Failed to access camera. Please grant camera permissions.');
            });

        // Cleanup on unmount
        return () => {
            console.log('🛑 Stopping QR Scanner');
            scanner.stop();
            scanner.destroy();
        };
    }, [isOpen, bin]);

    /**
     * Handle QR code scan
     * SOLID: Single Responsibility - handles only scan result
     */
    const handleQRScan = async (data: string) => {
        // Guard: Only process if we're in scanning state
        if (scanState !== 'scanning') {
            console.warn('⚠️  Ignoring scan - not in scanning state:', scanState);
            return;
        }

        if (!bin) {
            console.error('❌ No bin selected!');
            return;
        }

        // Guard: Don't process empty or invalid data
        if (!data || data.trim() === '') {
            console.warn('⚠️  Empty QR code data detected, ignoring');
            return;
        }

        console.log('━'.repeat(50));
        console.log('📷 QR Code Scanned!');
        console.log('   Raw Data:', data);
        console.log('   Bin ID:', bin.bin_id);
        console.log('   Expected QR:', bin.qr_code_link);
        console.log('━'.repeat(50));

        setScannedData(data);
        setScanState('validating');

        // Stop scanner while validating
        qrScannerRef.current?.stop();

        try {
            // Validate QR code with backend
            console.log('🔄 Sending validation request to backend...');
            const result = await binQRService.validateQRCode(bin.bin_id, data);

            console.log('📥 Validation Response:', JSON.stringify(result, null, 2));

            if (result.ok && result.data?.qrValidated === true) {
                console.log('✅ QR Code is VALID!');
                setScanState('valid');
                setErrorMessage('');
            } else {
                console.log('❌ QR Code is INVALID!');
                setScanState('invalid');
                setErrorMessage(result.message || 'QR code does not match this bin');
            }
        } catch (error) {
            console.error('❌ QR validation error:', error);
            setScanState('invalid');
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to validate QR code'
            );
        }
    };

    /**
     * Handle status update (COLLECTED)
     * SOLID: Single Responsibility - handles only collection action
     */
    const handleCollect = async () => {
        if (!bin) return;

        setScanState('updating');
        setErrorMessage('');

        try {
            const result = await binQRService.markBinCollected(
                bin.bin_id,
                bin.order_id
            );

            if (result.ok) {
                // Success - notify parent and close
                onSuccess();
                handleClose();
            } else {
                setErrorMessage(result.message || 'Failed to update bin status');
                setScanState('valid'); // Go back to valid state
            }
        } catch (error) {
            console.error('Collection error:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to mark bin as collected'
            );
            setScanState('valid'); // Go back to valid state
        }
    };

    /**
     * Handle status update (CANCELLED)
     * SOLID: Single Responsibility - handles only cancellation action
     */
    const handleCancel = async () => {
        if (!bin) return;

        setScanState('updating');
        setErrorMessage('');

        try {
            const result = await binQRService.markBinCancelled(
                bin.bin_id,
                bin.order_id
            );

            if (result.ok) {
                // Success - notify parent and close
                onSuccess();
                handleClose();
            } else {
                setErrorMessage(result.message || 'Failed to update bin status');
                setScanState('valid'); // Go back to valid state
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to mark bin as cancelled'
            );
            setScanState('valid'); // Go back to valid state
        }
    };

    /**
     * Retry scanning
     */
    const handleRetry = () => {
        setScanState('scanning');
        setScannedData('');
        setErrorMessage('');
        qrScannerRef.current?.start();
    };

    /**
     * Close modal and cleanup
     */
    const handleClose = () => {
        qrScannerRef.current?.stop();
        setScanState('scanning');
        setScannedData('');
        setErrorMessage('');
        setCameraError('');
        onClose();
    };

    // Don't render if not open or no bin selected
    if (!isOpen || !bin) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Scan Bin QR Code
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Bin Info */}
                <div className="bg-gray-50 p-4 border-b">
                    <p className="text-sm text-gray-600">
                        <strong>Bin ID:</strong> {bin.bin_id.substring(0, 8).toUpperCase()}...
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Owner:</strong> {bin.user_first_name} {bin.user_last_name}
                    </p>
                </div>

                {/* Scanner Area */}
                <div className="p-4">
                    {/* Camera View */}
                    {scanState === 'scanning' && (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                className="w-full h-64 bg-black rounded-lg"
                            />
                            {cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                                    <div className="text-center text-white p-4">
                                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{cameraError}</p>
                                    </div>
                                </div>
                            )}
                            {!cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="border-4 border-green-500 w-48 h-48 rounded-lg"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Validating State */}
                    {scanState === 'validating' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600">Validating QR code...</p>
                        </div>
                    )}

                    {/* Valid QR State */}
                    {scanState === 'valid' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                QR Code Matched!
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                QR code successfully validated. Update the bin status below.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-all"
                                >
                                    Cancel Collection
                                </button>
                                <button
                                    onClick={handleCollect}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                                >
                                    Mark Collected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Invalid QR State */}
                    {scanState === 'invalid' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <XCircle className="w-16 h-16 text-red-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                QR Code Mismatch
                            </h3>
                            <p className="text-red-600 text-center mb-6 px-4">
                                {errorMessage || 'The scanned QR code does not match this bin.'}
                            </p>

                            {/* Retry Button */}
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                            >
                                Scan Again
                            </button>
                        </div>
                    )}

                    {/* Updating State */}
                    {scanState === 'updating' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
                            <p className="text-gray-600">Updating bin status...</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && scanState !== 'invalid' && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {scanState === 'scanning' && !cameraError && (
                    <div className="bg-blue-50 border-t p-4">
                        <p className="text-sm text-blue-800 text-center">
                            📱 Point your camera at the bin's QR code
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
