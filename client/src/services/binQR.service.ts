/**
 * Bin QR Code Validation Service
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles only bin QR validation and status updates
 * - Dependency Inversion: Depends on API abstraction
 * 
 * Design Pattern: Service Layer Pattern
 */

import { api } from '@/lib/api';

/**
 * Request body for QR validation
 */
export interface QRValidationRequest {
    binId: string;
    qrCodeLink: string;
}

/**
 * Response from QR validation
 */
export interface QRValidationResponse {
    ok: boolean;
    message: string;
    data?: {
        binId: string;
        currentStatus: string;
        qrValidated: boolean;
        validatedAt: string;
    };
}

/**
 * Request body for bin status update
 */
export interface BinStatusUpdateRequest {
    bin_status: 'EMPTY' | 'FULL';
    full_bin_status: 'COLLECTED' | 'CANCELLED';
    order_id: string;
}

/**
 * Response from bin status update
 */
export interface BinStatusUpdateResponse {
    ok: boolean;
    message: string;
    data?: any;
}

/**
 * Bin QR Service
 * Encapsulates all QR-related operations
 */
class BinQRService {
    /**
     * Validate QR code against bin
     * 
     * Security: Ensures collector is physically at the bin location
     * 
     * @param binId - UUID of the bin
     * @param qrCodeLink - Scanned QR code link
     * @returns Validation result
     */
    async validateQRCode(
        binId: string,
        qrCodeLink: string
    ): Promise<QRValidationResponse> {
        try {
            const response = await api('/api/bins/validate-qr', {
                method: 'POST',
                body: JSON.stringify({
                    binId,
                    qrCodeLink,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('QR validation error:', error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to validate QR code'
            );
        }
    }

    /**
     * Update bin status after collection
     * 
     * @param binId - UUID of the bin
     * @param statusUpdate - Status update details
     * @returns Update result
     */
    async updateBinStatus(
        binId: string,
        statusUpdate: BinStatusUpdateRequest
    ): Promise<BinStatusUpdateResponse> {
        try {
            const response = await api(`/api/collector/bins/${binId}/status`, {
                method: 'PATCH',
                body: JSON.stringify(statusUpdate),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Bin status update error:', error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update bin status'
            );
        }
    }

    /**
     * Mark bin as collected
     * 
     * @param binId - UUID of the bin
     * @param orderId - UUID of the pickup order
     * @returns Update result
     */
    async markBinCollected(
        binId: string,
        orderId: string
    ): Promise<BinStatusUpdateResponse> {
        return this.updateBinStatus(binId, {
            bin_status: 'EMPTY',
            full_bin_status: 'COLLECTED',
            order_id: orderId,
        });
    }

    /**
     * Mark bin as cancelled
     * 
     * @param binId - UUID of the bin
     * @param orderId - UUID of the pickup order
     * @returns Update result
     */
    async markBinCancelled(
        binId: string,
        orderId: string
    ): Promise<BinStatusUpdateResponse> {
        return this.updateBinStatus(binId, {
            bin_status: 'FULL',
            full_bin_status: 'CANCELLED',
            order_id: orderId,
        });
    }
}

// Export singleton instance
export const binQRService = new BinQRService();
