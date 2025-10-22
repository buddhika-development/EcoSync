import { supabase } from "../../../libs/supabase/supabase.js";

export async function insertUser(row) {
    const { data, error } = await supabase
        .from('users')
        .insert(row)
        .select('user_id, user_role')
        .single();

    if (error) throw error;
    return data;
}

export async function findUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_email_address', email)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116: no rows
    return data || null;
}