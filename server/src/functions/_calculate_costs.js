import { isCurrentMonth } from "../../utils/_date_check.js";
import { recycle_tax_percentage, waste_collection_fee, waste_collection_tax_percentage } from "../../waste_config.js";
import { access_bin_details_with_user_filter } from "../dbActions/bin.db.js";
import { access_bin_details_with_status_filter_by_id } from "../dbActions/bin_status.db.js"
import { access_user_recycle_collect_requests_filter_by_status } from "../dbActions/recycle_waste.db.js";


export const calculate_waste_collected_cost = async (user_id) => {

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
            isCurrentMonth(bin_status_item.updated_at) && collected_bin_details.push(bin_status_item)
        }
    }

    if(collected_bin_details.error) {
        return {
            message: collected_bin_details.message,
            error: { message: collected_bin_details.error.message, details: collected_bin_details.error.details }
        }
    }

    
    const waste_collection_cost = collected_bin_details.length * waste_collection_fee;
    const tax = waste_collection_cost * waste_collection_tax_percentage;
    const total_cost = waste_collection_cost + tax;

    return {
        message: "Successfully calculated waste collection cost",
        data: {
            collection_count: collected_bin_details.length,
            collection_cost: waste_collection_cost,
            tax: tax,
            total_cost: total_cost
        }
    }
}



export const calculate_recycle_collection_cost = async (user_id) => {

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
            filtered_requests.push(request)
        }
    }
    
    const recycle_collection_count = filtered_requests.length;
    const recycle_collection_cost = recycle_collection_count * waste_collection_fee;
    const tax = recycle_collection_cost * recycle_tax_percentage;
    const total_cost = recycle_collection_cost + tax;
    
    return {
        message: "Successfully calculated recycle collection cost",
        data: {
            collection_count: recycle_collection_count,
            collection_cost: recycle_collection_cost,
            tax: tax,
            total_cost: total_cost
        }
    }
}
