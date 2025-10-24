import { sendResponse } from "../../libs/response.js"
import supabase from "../../libs/supabase/supabase_client.js"

export const access_user_card_details_by_user_id = async (user_id) => {

    try{
        const { data, error} = await supabase
            .from("card_details")
            .select("*")
            .eq("user_id", user_id)

        if(error){
            return {
                message : "Error accessing user card details",
                error : {
                    message : "Error accessing user card details",
                    details : error
                }
            }
        }

        return {
            message : "Successfully accessed user card details",
            data : data
        }
    }
    catch(error){
        return {
            message : "Supabase database connection occur error",
            error : {
                message : "supabase database connection error",
                details : error
            }
        }
    }
    
}


export const insert_new_user_card_details = async (user_id, card_number, cvc, holder_name)  => {
    try{
        const { data, error} = await supabase
            .from("card_details")
            .insert([
                {
                    user_id : user_id,
                    card_number : card_number,
                    cvc : cvc,
                    card_holder_name : holder_name
                }
            ])
            .select()
        
        if(error){
            return {
                message : "Error inserting new user card details",
                error : {
                    message : "Error inserting new user card details",
                    details : error
                }
            }
        }

        return {
            message : "Successfully inserted new user card details",
            data : data
        }
    }
    catch(error) {
        return {
            message : "Supabase database connection occur error",
            error : {
                message : "supabase database connection error",
                details : error
            }
        }
    }
}