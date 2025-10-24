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


    // update the recycle collect requests payment status to COMPLETE for the current month
    const user_recycle_request_details_res = await access_user_recycle_collect_requests_filter_by_status(
        user_id, "PENDING"
    )
    
    if(user_recycle_request_details_res.error) {
        return {
            message: user_recycle_request_details_res.message,
            error: { message: user_recycle_request_details_res.error.message, details: user_recycle_request_details_res.error.details }
        }
    }

    const user_recycle_reqyests = user_recycle_request_details_res.data;
    const filtered_requests = [];

    for(const request of user_recycle_reqyests) {
        if(isCurrentMonth(request.updated_at)) {
            const response = await update_recycle_collect_request_payment_status(request.recyclable_collect_request_id, "COMPLETE")
            console.log("Updated recycle collect request payment status response: ", response)
            filtered_requests.push(request.recyclable_collect_request_id)
        }
    }


    const user_bin_details = await access_bin_details_with_user_filter(user_id)
    const user_bins = [];
    
    if(user_bin_details.error) {
	 return {
	     message: user_bin_details.message,
	     error: { message: user_bin_details.error.message, details: user_bin_details.error.details }
	 }
    }

    for(const bin of user_bin_details.data) {
	 user_bins.push(bin.bin_id)
    }

    const collected_bin_details = [];

    for(const bin_id of user_bins) {
	 const bin_status = await access_bin_details_with_status_filter_by_id("PENDING", bin_id)
	 
	 if(bin_status.error) {
	     return {
		  message: bin_status.message,
		  error: { message: bin_status.error.message, details: bin_status.error.details }
	     }
	 }


	 for( let bin_status_item of bin_status.data ) {
	     if(isCurrentMonth(bin_status_item.updated_at)) {
		const response = await update_waste_collection_request_payment_status( "COMPLETE", bin_status_item?.full_bin_id)
		console.log("Updated bin payment status response: ", response)
		collected_bin_details.push(bin_status_item)
	     }
	 }
    }

    if(collected_bin_details.error) {
	 return {
	     message: collected_bin_details.message,
	     error: { message: collected_bin_details.error.message, details: collected_bin_details.error.details }
	 }
    }

    if(collected_bin_details.error) {
	 return {
	     message: collected_bin_details.message,
	     error: { message: collected_bin_details.error.message, details: collected_bin_details.error.details }
	 }
    }
    
    return sendResponse(res, 200, SUCCESS(transaction_response.message, transaction_response.data))
}

export const _get_user_transactions = async (req, res) => {
    return sendResponse(res, 200, SUCCESS("Get user transactions endpoint is under construction"))
}