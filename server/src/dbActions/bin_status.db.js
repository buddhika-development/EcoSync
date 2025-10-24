import supabase from "../../libs/supabase/supabase_client.js"

export const access_all_bin_detials = async () => {
    try{

        const {data, error} = await supabase
            .from("full_bin_status")
            .select("*")
        
        if(error) {
            return {
                message: "Failed to access all bin details",
                error: { message: "Failed to access all bin details", details: error }
            }
        }

        return {
            message: "Successfully accessed all bin details",
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


export const access_bin_details_with_status_filter_by_id = async (status, bin_id) => {
    try{

        const {data, error} = await supabase
            .from("full_bin_status")
            .select("*")
            .eq("payment_status", status)
            .eq("bin_id", bin_id)

        if(error) {            
            return {
                message: `Failed to access bin details with status: ${status}`,
                error: { message: `Failed to access bin details with status: ${status}`, details: error }
            }
        }

        return {
            message: `Successfully accessed bin details with status: ${status}`,
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



export const update_waste_collection_request_payment_status = async (status, bin_id) => {
    try{

        const {data, error} = await supabase
            .from("full_bin_status")
            .update({ payment_status: status })
            .eq("full_bin_id", bin_id)
            .select()

        console.log(data);
        
        if(error) {            
            return {
                message: `Failed to access bin details with status: ${status}`,
                error: { message: `Failed to access bin details with status: ${status}`, details: error }
            }
        }

        return {
            message: `Successfully accessed bin details with status: ${status}`,
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
