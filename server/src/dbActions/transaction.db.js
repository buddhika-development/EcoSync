import supabase from "../../libs/supabase/supabase_client.js"

export const _insert_transaction = async (user_id, transaction_amount )=> {

    try{

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: user_id,
                transaction_amount: transaction_amount
            }])
            .select()
            .single()
        
        if(error){
            return {
                message: "Failed to insert new transaction.",
                error: { message: "Failed to insert new transaction.", details: error }
            }
        }

        return {
            message: "Successfully inserted new transaction.",
            data: data
        }
        
    }
    catch(err){
        return {
            message: "Something went wrong in supabase connection.",
            error: { message: "Something went wrong in supabase connection.", details: err }
        }
    }
    
}