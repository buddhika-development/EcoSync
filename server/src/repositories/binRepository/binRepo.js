import { supabase } from "../../../libs/supabase/supabase.js";

/**
 * Repository for bin data access
 * SOLID: 
 * - Single Responsibility: Only handles database operations for bins
 * - Dependency Inversion: Abstracts database details from business logic
 * Design Pattern: Repository Pattern - encapsulates data access logic
 */

/**
 * Create a new bin
 * @param {Object} bin - Validated bin data to insert
 * @returns {Promise<{data: Object|null, error: Object|null}>} Supabase response
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
 * READ: list bins owned by a user, with optional status filter & pagination.
 * @param {Object} params
 * @param {string} params.userId - owner (required)
 * @param {string|undefined} params.status - optional bin_status
 * @param {number} params.page - 1-based page
 * @param {number} params.pageSize - items per page
 * @returns {Promise<{data:Array, error:any, total:number}>}
 */
export async function findBinsByUser({ userId, status, page, pageSize }) {
    // Base query
    let query = supabase
        .from("bins")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    // Optional filter
    if (status) {
        query = query.eq("bin_status", status);
    }

    // Pagination (convert to 0-based range)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    return { data, error, total: count ?? 0 };
}

export async function markBinFull(binId) {
    const db = await supabase;
    const { data, error } = await db.rpc("mark_bin_full", { p_bin_id: binId }).single();

    if (error) throw new Error(error.message);
    return data; // new full_bin_status row
}

/**
 * Get bin by ID
 * @param {string} binId - UUID of bin
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
 * Get bin by QR code link
 * @param {string} qrCodeLink - QR code link to search for
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