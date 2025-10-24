import { RECYCLABLE_ERRORS, RECYCLABLE_SUCCESS, RECYCLABLE_STATUS } from "../../constants/recyclable.constants.js";
import { updateRecyclableSchema } from "../../validation/recyclable.schema.js";
import { getRecyclableRequestById, updateRecyclableRequest } from "../../repositories/collectorRepository/collectorRepo.js";
import { _calculate_waste_recycle_coin } from "../../functions/_calculate_recycle_coin.js";

/**
 * Validates UUID format
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Business logic for updating recyclable request details
 * 
 * Key Features:
 * 1. Idempotency - returns success message if status already updated
 * 2. Validates collector authorization
 * 3. Supports partial updates (status, category, weight)
 * 
 * SOLID: Single Responsibility - only handles recyclable update logic
 * 
 * @param {string} requestId - UUID of recyclable request
 * @param {Object} updates - Fields to update { status?, category?, weight? }
 * @param {string} collectorId - UUID of authenticated collector
 * @returns {Promise<Object>} Standardized response
 */
export default async function updateRecyclableUC(requestId, updates, collectorId) {
    // Step 1: Validate request ID
    if (!requestId || !isValidUUID(requestId)) {
        return {
            ok: false,
            status: 400,
            message: RECYCLABLE_ERRORS.INVALID_ID
        };
    }

    // Step 2: Validate update data
    const validation = updateRecyclableSchema.safeParse(updates);

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: RECYCLABLE_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }

    // Step 3: Check if request exists and collector has access
    const { data: existingRequest, error: fetchError } = await getRecyclableRequestById(requestId);

    if (fetchError) {
        console.error("Error fetching recyclable request:", fetchError);
        return {
            ok: false,
            status: 500,
            message: RECYCLABLE_ERRORS.DATABASE_ERROR
        };
    }

    if (!existingRequest) {
        return {
            ok: false,
            status: 404,
            message: RECYCLABLE_ERRORS.NOT_FOUND
        };
    }

    // Step 4: Verify collector owns this request (check via area)
    if (existingRequest.area?.collector_id && existingRequest.area.collector_id !== collectorId) {
        return {
            ok: false,
            status: 403,
            message: RECYCLABLE_ERRORS.UNAUTHORIZED
        };
    }

    // Step 5: Idempotency check - if status update requested and already in that state
    if (validation.data.status && existingRequest.status === validation.data.status) {
        let message = RECYCLABLE_SUCCESS.ALREADY_UPDATED;

        switch (validation.data.status) {
            case RECYCLABLE_STATUS.COLLECTED:
                message = RECYCLABLE_ERRORS.ALREADY_COLLECTED;
                break;
            case RECYCLABLE_STATUS.CANCELLED:
                message = RECYCLABLE_ERRORS.ALREADY_CANCELLED;
                break;
            case RECYCLABLE_STATUS.CLAIMED:
                message = RECYCLABLE_ERRORS.ALREADY_CLAIMED;
                break;
        }

        // Transform existing request data
        const transformedExisting = {
            id: existingRequest.recyclable_collect_request_id,
            userId: existingRequest.user_id,
            areaId: existingRequest.area_id,
            status: existingRequest.status,
            type: existingRequest.type,
            category: existingRequest.category,
            weight: existingRequest.weight,
            createdAt: existingRequest.created_at,
            updatedAt: existingRequest.updated_at,
            users: existingRequest.users,
            area: existingRequest.area
        };

        return {
            ok: true,
            status: 200,
            message,
            data: transformedExisting
        };
    }

    // Step 6: Update request in database
    const { data, error } = await updateRecyclableRequest(requestId, validation.data);

    if (error) {
        console.error("Error updating recyclable request:", error);
        return {
            ok: false,
            status: 500,
            message: RECYCLABLE_ERRORS.UPDATE_FAILED
        };
    }

    console.log("Updated recyclable request:", validation.data);

    // Step 7: Calculate and award recycle coins (only if status is COMPLETED)

    try {
        const recycle_coin_amount = await _calculate_waste_recycle_coin(validation.data.category, validation.data.weight);
        console.log("Calculated recycle coin amount:", recycle_coin_amount);

        if (recycle_coin_amount > 0) {
            // Call the recycle coin update endpoint
            const response = await fetch('http://localhost:8000/api/recycle_coin/update-recycle-coin-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: data.user_id,
                    transaction_type: 'earn',
                    amount: recycle_coin_amount
                })
            });
            console.log("Recycle coin service response status:", response)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Failed to update recycle coin balance:", errorData);
                // Don't fail the whole operation
            } else {
                const coinData = await response.json();
                console.log(`✅ Successfully awarded ${recycle_coin_amount} recycle coins to user ${data.user_id}`);
                console.log("Recycle coin response:", coinData);
            }
        }
    } catch (coinError) {
        console.error("❌ Error processing recycle coins:", coinError);
        // Don't fail the whole operation if coin update fails
    }


    // Step 8: Transform data to match frontend expectations
    const transformedData = {
        id: data.recyclable_collect_request_id,
        userId: data.user_id,
        areaId: data.area_id,
        status: data.status,
        type: data.type,
        category: data.category,
        weight: data.weight,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };

    // Step 9: Return success with transformed data
    return {
        ok: true,
        status: 200,
        message: RECYCLABLE_SUCCESS.REQUEST_UPDATED,
        data: transformedData
    };
}
