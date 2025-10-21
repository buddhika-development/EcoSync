import supabase from "../../libs/supabase/supabase_client.js"

export const insert_new_recycle_coin_user = async (user_id) => {

    try{
        const {data, error} = await supabase
            .from("recycle_coin")
            .insert([
                { recycle_coin_user: user_id }
            ])
            .select()
            .single()
        
        if(error) {
            return {
                message: "Failed to insert new recycle coin user",
                error: { message: "Failed to insert new recycle coin user", details: error }
            }
        }

        console.log(data)
    
        return {
            message: "Sucessfully insert new recycle coin user",
            data : data
        }
    }
    catch(err) {
        console.log(err)
        return {
            message: "Something went wrong in supabase connection.",
            error: { message: "Something went wrong in supabase connection.", details: err}
        }
    }
}


export const update_recycle_coin_balance = async (user_id, amount) => {

    try{
        const {data, error} = await supabase
            .from("recycle_coin")
            .update({ recycle_coin_balance: amount })
            .eq("recycle_coin_user", user_id)
            .select()
            .single()
        
        if(error) {
            return {
                message: "Failed to update recycle coin balance",
                error: {message: "Failed to update recycle coin balance", details: error }
            }
        }

        return {
            message: "Successfully updated recycle coin balance",
            data: data
        }
    }
    catch(err){
        return {
            message: "Something went wrong in supabase connection.",
            error: { message: "Something went wrong in supabase connection", details: err }
        }
    }
    
}


export const acces_single_recycle_coin = async (user_id) => {

    try{

        const {data, error} = await supabase
            .from("recycle_coin")
            .select("*")
            .eq("recycle_coin_user", user_id)
            .select()
            .single()
        
        if(error) {
            return {
                message: "Failed to access the single recycle coin details",
                error: { message: "Failed to access the single recycle coin details", details: error }
            }
        }

        return {
            message: "Successfully accessed the single coin details",
            data: data
        }
        
    }
    catch(err) {
        return {
            message: "Something went wrong in supabase connection",
            error: { message: "Something went wrong in supabase connection", details: err }
        }
    }
    
}