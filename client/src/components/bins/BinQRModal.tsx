'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Download, QrCode as QrCodeIcon, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface BinQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    binId: string;
    binShortId: string;
    qrCodeLink: string;
}

/**
 * Modal component to display and download bin QR codes
 * Single Responsibility: Handles QR code generation and display
 */
export default function BinQRModal({ isOpen, onClose, binId, binShortId, qrCodeLink }: BinQRModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && qrCodeLink) {
            // Small delay to ensure canvas is mounted
            const timer = setTimeout(() => {
                generateQRCode();
            }, 100);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, qrCodeLink]);

    const generateQRCode = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            console.log('🔍 Generating QR code...', { qrCodeLink, hasCanvas: !!canvasRef.current });

            if (!canvasRef.current) {
                console.error('❌ Canvas ref is not available');
                setError('Canvas element not ready');
                setIsGenerating(false);
                return;
            }

            if (!qrCodeLink) {
                console.error('❌ QR code link is missing');
                setError('QR code link is missing');
                setIsGenerating(false);
                return;
            }

            console.log('📝 QR Code link:', qrCodeLink);

            // Generate QR code with the exact qr_code_link string
            await QRCode.toCanvas(canvasRef.current, qrCodeLink, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#16A34A', // Green color for QR
                    light: '#FFFFFF', // White background
                },
                errorCorrectionLevel: 'H', // High error correction
            });

            console.log('✅ QR code generated successfully');
            setIsGenerating(false);
        } catch (err) {
            console.error('❌ QR generation error:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate QR code');
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;

        try {
            // Convert canvas to blob and download
            canvasRef.current.toBlob((blob) => {
                if (!blob) {
                    setError('Failed to create download file');
                    return;
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bin-qr-${binShortId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                // Show success message
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 2000);
            });
        } catch (err) {
            setError('Failed to download QR code');
        }
    };

    const handleClose = () => {
        setDownloadSuccess(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <QrCodeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Bin QR Code</h2>
                            <p className="text-sm text-green-100">ID: {binShortId}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* QR Code Display */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6 flex flex-col items-center relative">
                        {/* Loading State */}
                        {isGenerating && (
                            <div className="w-[300px] h-[300px] flex items-center justify-center absolute inset-0 bg-gray-50 rounded-xl z-10">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-gray-600 text-sm">Generating QR code...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isGenerating && (
                            <div className="w-[300px] h-[300px] flex items-center justify-center absolute inset-0 bg-gray-50 rounded-xl z-10">
                                <div className="text-center text-red-600">
                                    <p className="font-semibold mb-2">Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Canvas - Always rendered */}
                        <canvas
                            ref={canvasRef}
                            className="rounded-lg shadow-md"
                            style={{ visibility: isGenerating || error ? 'hidden' : 'visible' }}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <span className="text-lg">ℹ️</span>
                            How to use this QR code
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                            <li>Download and print this QR code</li>
                            <li>Attach it to your waste bin</li>
                            <li>Collectors will scan it during pickup</li>
                        </ul>
                    </div>

                    {/* Success Message */}
                    {downloadSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-800 font-medium">QR code downloaded successfully!</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating || !!error}
                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </button>
                    </div>

                    {/* QR Link Info (for debugging/reference) */}
                    {/* <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">QR Code Data:</p>
                        <p className="text-xs text-gray-700 font-mono bg-gray-100 p-2 rounded break-all">
                            {qrCodeLink}
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
