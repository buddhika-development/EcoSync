import { supabase } from "../../../libs/supabase/supabase.js";

export async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_email_address', email)
        .single();

    console.log("user data", data);

    return { data, error };
}