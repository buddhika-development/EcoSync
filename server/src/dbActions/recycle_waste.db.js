import supabase from "../../libs/supabase/supabase_client.js"

export const access_user_recycle_collect_requests_filter_by_status = async (user_id, status) => {

    try{
        const {data, error} = await supabase
            .from("recyclable_collect_request")
            .select("*")
            .eq("status", status)
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