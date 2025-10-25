import { supabase } from "../../../libs/supabase/supabase.js";

/**
 * @param {Object} bin
 * @returns {Promise<{data: Object|null, error: Object|null}>} 
 */
export async function createNewBin(bin) {
    const { data, error } = await supabase
        .from('bins')
        .insert(bin)
        .select('*')
        .single();

    return { data, error };
}

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string|undefined} params.status
 * @param {number} params.page
 * @param {number} params.pageSize
 * @returns {Promise<{data:Array, error:any, total:number}>}
 */
export async function findBinsByUser({ userId, status, page, pageSize }) {

    let query = supabase
        .from("bins")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("bin_status", status);
    }


    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    return { data, error, total: count ?? 0 };
}

export async function markBinFull(binId) {
    const db = await supabase;
    const { data, error } = await db.rpc("mark_bin_full", { p_bin_id: binId }).single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * @param {string} binId -
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getBinById(binId) {
    const { data, error } = await supabase
        .from('bins')
        .select('*')
        .eq('bin_id', binId)
        .single();

    return { data, error };
}

/**
 * @param {string} qrCodeLink 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getBinByQRCode(qrCodeLink) {
    const { data, error } = await supabase
        .from('bins')
        .select('*')
        .eq('qr_code_link', qrCodeLink)
        .single();

    return { data, error };
}