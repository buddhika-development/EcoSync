import { BIN_ERRORS, BIN_SUCCESS, BIN_QR_SCHEME } from "../../constants/bin.constants.js";
import { validateQRCodeSchema } from "../../validation/bin.schema.js";
import { getBinById, getBinByQRCode } from "../../repositories/binRepository/binRepo.js";


function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * @param {string} qrCodeLink 
 * @returns {string|null}
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
 * @param {string} binId 
 * @param {string} qrCodeLink
 * @param {string} collectorId
 * @returns {Promise<Object>}
 */
export default async function validateBinQRCodeUC(binId, qrCodeLink, collectorId) {
    console.log("QR Validation Request:", { binId, qrCodeLink, collectorId });


    const validation = validateQRCodeSchema.safeParse({ binId, qrCodeLink });

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: BIN_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }


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

        console.warn("Invalid QR code scanned:", qrCodeLink);
        return {
            ok: false,
            status: 404,
            message: BIN_ERRORS.INVALID_QR_CODE
        };
    }


    if (binById.bin_id !== binByQR.bin_id) {
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
