import supabase from "../../libs/supabase/supabase_client.js"

export const access_user_recycle_collect_requests_filter_by_status = async (user_id, status) => {

    try{
        const {data, error} = await supabase
            .from("recyclable_collect_request")
            .select("*")
            .eq("payment_status", status)
            .eq("user_id", user_id)

        if(error) {            
            return {
                message: `Failed to access recycle collect requests with status: ${status}`,
                error: { message: `Failed to access recycle collect requests with status: ${status}`, details: error }
            }
        }

        return {
            message: `Successfully accessed recycle collect requests with status: ${status}`,
            data: data
        }
        
    }
    catch(err) {
        return {
            message: "Something went wrong in supabase connection.",
            error: { message: "Something went wrong in supabase connection.", details: err}
        }
    }
    
}



export const update_recycle_collect_request_payment_status = async (request_id, new_status) => {
    try{
        const {data, error} = await supabase
            .from("recyclable_collect_request")
            .update({ payment_status: new_status })
            .eq("recyclable_collect_request_id", request_id)
            .select()
            
        console.log("Updated recycle collect request payment status: ", error);

        if(error) {            
            return {
                message: `Failed to update recycle collect request payment status to: ${new_status}`,
                error: { message: `Failed to update recycle collect request payment status to: ${new_status}`, details: error }
            }
        }

        return {
            message: `Successfully updated recycle collect request payment status to: ${new_status}`,
            data: data
        }
    
    }
    catch(err) {
        return {
            message: "Something went wrong in supabase connection.",
            error: { message: "Something went wrong in supabase connection.", details: err}
        }
    }
}