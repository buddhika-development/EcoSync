import { randomToken } from "../../../utils/crypto.js";
import { createNewBin } from "../../repositories/binRepository/binRepo.js";
import { createBinSchema } from "../../validation/bin.schema.js";
import { BIN_QR_SCHEME, DEFAULT_BIN_STATUS, BIN_ERRORS, BIN_SUCCESS } from "../../constants/bin.constants.js";

/**
 * Factory function to generate QR code link for a bin
 * Design Pattern: Factory Method - encapsulates object creation logic
 */
function generateBinQRLink() {
    const qrToken = randomToken();
    return `${BIN_QR_SCHEME}${qrToken}`;
}

/**
 * Maps raw input to bin creation schema
 * Design Pattern: Data Mapper - separates data structure from business logic
 * SOLID: Single Responsibility - only handles data transformation
 */
function mapToBinInput(bin) {
    return {
        area_id: bin.area_id,
        user_id: bin.user_id,
        longitude: bin.longitude,
        latitude: bin.latitude,
        qr_code_link: generateBinQRLink(),
        bin_status: bin.bin_status || DEFAULT_BIN_STATUS,
    };
}

/**
 * Validates bin data against schema
 * SOLID: Single Responsibility - only validates
 * Returns standardized error response
 */
function validateBinData(binData) {
    const parsed = createBinSchema.safeParse(binData);

    if (!parsed.success) {
        const flat = parsed.error.flatten();
        return {
            isValid: false,
            errors: flat.fieldErrors,
            data: null
        };
    }

    return {
        isValid: true,
        errors: null,
        data: parsed.data
    };
}

/**
 * Business logic for creating a new bin
 * SOLID: 
 * - Single Responsibility: Only orchestrates bin creation flow
 * - Open/Closed: Can extend without modifying (add validators, mappers)
 * - Dependency Inversion: Depends on repository abstraction, not concrete implementation
 * 
 * @param {Object} bin - Raw bin data from request
 * @returns {Object} - Standardized response { ok, status, message, data?, errors? }
 */
export default async function addNewBinUsecase(bin) {
    console.log("Add New Bin Usecase Invoked", bin);

    // Step 1: Map input data
    const binInput = mapToBinInput(bin);

    // Step 2: Validate mapped data
    const validation = validateBinData(binInput);

    if (!validation.isValid) {
        return {
            ok: false,
            status: 422,
            message: BIN_ERRORS.VALIDATION_ERROR,
            errors: validation.errors
        };
    }

    // Step 3: Persist to database via repository
    const { data, error } = await createNewBin(validation.data);

    if (error || !data) {
        console.error("Database error creating bin:", error);
        return {
            ok: false,
            status: 500,
            message: BIN_ERRORS.DATABASE_ERROR,
            errors: error?.message ? { database: [error.message] } : undefined
        };
    }

    // Step 4: Return success response
    return {
        ok: true,
        status: 201,
        message: BIN_SUCCESS.CREATED,
        data: data
    };
}