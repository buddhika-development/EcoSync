import supabase from "../../libs/supabase/supabase_client.js"

export const access_bin_details_with_user_filter = async (user_id) => {

    try{

        const { data, error } = await supabase
            .from("bins")
            .select("*")
            .eq("user_id", user_id)
        
        if (error) {
            return {
                message: "Failed to access the bin details",
                error: { message: "Failed to access the bin details", details: error }
            }
        }

        return {
            message: "Successfully accessed bin details",
            data: data
        }
        
    }
    catch(err) {
        return {
            message: "Something went wrong in supabase connection.",
            error : { message : "SOmething went wrong in supabase connection.", details: err}
        }
    }
    
}