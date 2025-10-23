import { BIN_ERRORS, BIN_SUCCESS, BIN_QR_SCHEME } from "../../constants/bin.constants.js";
import { validateQRCodeSchema } from "../../validation/bin.schema.js";
import { getBinById, getBinByQRCode } from "../../repositories/binRepository/binRepo.js";

/**
 * Validates UUID format
 * SOLID: Single Responsibility - only validates UUID
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Extracts QR token from full QR code link
 * Design Pattern: Utility/Helper function - encapsulates parsing logic
 * @param {string} qrCodeLink - Full QR link (e.g., "ecosync://bin/abc123...")
 * @returns {string|null} - QR token or null if invalid
 */
function extractQRToken(qrCodeLink) {
    if (!qrCodeLink || typeof qrCodeLink !== 'string') {
        return null;
    }

    // Remove scheme to get token
    if (qrCodeLink.startsWith(BIN_QR_SCHEME)) {
        return qrCodeLink.substring(BIN_QR_SCHEME.length);
    }

    return null;
}

/**
 * Business logic for validating QR code before bin status update
 * 
 * Security Feature: Prevents collectors from updating bin status without
 * physically reaching the bin and scanning its QR code.
 * 
 * SOLID:
 * - Single Responsibility: Only validates QR code matches bin
 * - Dependency Inversion: Depends on repository abstraction
 * 
 * Design Pattern: Use Case Pattern - encapsulates business logic
 * 
 * Flow:
 * 1. Collector scans QR code on physical bin
 * 2. Frontend sends: binId (from clicked bin) + qrCodeLink (from scan)
 * 3. Backend validates QR code belongs to that specific bin
 * 4. Only if match, collector can proceed to update status
 * 
 * @param {string} binId - UUID of bin collector wants to update
 * @param {string} qrCodeLink - QR code link scanned from physical bin
 * @param {string} collectorId - UUID of authenticated collector (for logging/audit)
 * @returns {Promise<Object>} Standardized response
 */
export default async function validateBinQRCodeUC(binId, qrCodeLink, collectorId) {
    console.log("QR Validation Request:", { binId, qrCodeLink, collectorId });

    // Step 1: Validate input format
    const validation = validateQRCodeSchema.safeParse({ binId, qrCodeLink });

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: BIN_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }

    // Step 2: Fetch bin by ID (the bin collector clicked in UI)
    const { data: binById, error: binByIdError } = await getBinById(binId);

    if (binByIdError) {
        console.error("Error fetching bin by ID:", binByIdError);
        return {
            ok: false,
            status: 500,
            message: BIN_ERRORS.DATABASE_ERROR
        };
    }

    if (!binById) {
        return {
            ok: false,
            status: 404,
            message: BIN_ERRORS.NOT_FOUND
        };
    }

    // Step 3: Fetch bin by QR code (the bin whose QR was scanned)
    const { data: binByQR, error: binByQRError } = await getBinByQRCode(qrCodeLink);

    if (binByQRError) {
        console.error("Error fetching bin by QR code:", binByQRError);
        return {
            ok: false,
            status: 500,
            message: BIN_ERRORS.DATABASE_ERROR
        };
    }

    if (!binByQR) {
        // QR code doesn't exist in database (invalid/fake QR)
        console.warn("Invalid QR code scanned:", qrCodeLink);
        return {
            ok: false,
            status: 404,
            message: BIN_ERRORS.INVALID_QR_CODE
        };
    }

    // Step 4: SECURITY CHECK - Verify clicked bin ID matches scanned QR's bin ID
    if (binById.bin_id !== binByQR.bin_id) {
        // Collector scanned wrong bin or trying to cheat
        console.warn("QR-Bin mismatch detected:", {
            clickedBinId: binById.bin_id,
            scannedBinId: binByQR.bin_id,
            collectorId
        });

        return {
            ok: false,
            status: 403,
            message: BIN_ERRORS.QR_BIN_MISMATCH,
            details: {
                expectedBinId: binById.bin_id,
                scannedBinId: binByQR.bin_id,
                hint: "Please scan the QR code of the bin you want to update"
            }
        };
    }

    // Step 5: All checks passed - QR code is valid and matches the bin
    console.log("QR validation successful:", {
        binId: binById.bin_id,
        qrToken: extractQRToken(qrCodeLink),
        collectorId,
        binStatus: binById.bin_status
    });

    return {
        ok: true,
        status: 200,
        message: BIN_SUCCESS.QR_VALIDATED,
        data: {
            binId: binById.bin_id,
            currentStatus: binById.bin_status,
            qrValidated: true,
            validatedAt: new Date().toISOString()
        }
    };
}
