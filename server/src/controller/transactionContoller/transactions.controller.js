import { ERROR, sendResponse, SUCCESS } from "../../../libs/response.js"
import { access_user_recycle_collect_requests_filter_by_status, update_recycle_collect_request_payment_status } from "../../dbActions/recycle_waste.db.js"
import { _insert_transaction } from "../../dbActions/transaction.db.js"
import { isCurrentMonth } from "../../../utils/_date_check.js"
import { access_bin_details_with_status_filter_by_id, update_waste_collection_request_payment_status } from "../../dbActions/bin_status.db.js"
import { access_bin_details_with_user_filter } from "../../dbActions/bin.db.js"

export const _new_transaction = async (req, res) => {
    
    const request_body = await req.body
    const user_id = request_body.user_id || null
    const transaction_amount = request_body.transaction_amount || null

    if(user_id === null || transaction_amount === null) {
        return sendResponse(res, 400, ERROR("Missing required fields: user_id and transaction_amount"))
    }

    const transaction_response = await _insert_transaction(user_id, transaction_amount)

    if(transaction_response.error) {
        return sendResponse(res, 400, ERROR(transaction_response.message, transaction_response.error.details))
    }

    // modularize follow-up updates: recycle collect requests and bin statuses
    const recycleOk = await updateRecycleCollectRequests(user_id, res)
    if (!recycleOk) return // updateRecycleCollectRequests already responded with error

    const binsOk = await updateBinsPaymentStatus(user_id, res)
    if (!binsOk) return // updateBinsPaymentStatus already responded with error

    return sendResponse(res, 200, SUCCESS(transaction_response.message, transaction_response.data))
}


// helpers
const updateRecycleCollectRequests = async (user_id, res) => {
    const user_recycle_request_details_res = await access_user_recycle_collect_requests_filter_by_status(
        user_id, "PENDING"
    )

    if(user_recycle_request_details_res.error) {
        return sendResponse(res, 400, ERROR(user_recycle_request_details_res.message, user_recycle_request_details_res.error))
    }

    const user_recycle_requests = user_recycle_request_details_res.data || [];
    const filtered_requests = [];

    for(const request of user_recycle_requests) {
        if(isCurrentMonth(request.updated_at)) {
            const response = await update_recycle_collect_request_payment_status(request.recyclable_collect_request_id, "COMPLETE")
            console.log("Updated recycle collect request payment status response: ", response)
            filtered_requests.push(request.recyclable_collect_request_id)
        }
    }

    return true
}

const updateBinsPaymentStatus = async (user_id, res) => {
    const user_bin_details = await access_bin_details_with_user_filter(user_id)
    if(user_bin_details.error) {
        return sendResponse(res, 400, ERROR(user_bin_details.message, user_bin_details.error))
    }

    const user_bins = (user_bin_details.data || []).map(b => b.bin_id)

    for(const bin_id of user_bins) {
        const bin_status = await access_bin_details_with_status_filter_by_id("PENDING", bin_id)
        if(bin_status.error) {
            return sendResponse(res, 400, ERROR(bin_status.message, bin_status.error))
        }

        for(const bin_status_item of bin_status.data || []) {
            if(isCurrentMonth(bin_status_item.updated_at)) {
                const response = await update_waste_collection_request_payment_status("COMPLETE", bin_status_item?.full_bin_id)
                console.log("Updated bin payment status response: ", response)
            }
        }
    }

    return true
}

export const _get_user_transactions = async (req, res) => {
    return sendResponse(res, 200, SUCCESS("Get user transactions endpoint is under construction"))
}