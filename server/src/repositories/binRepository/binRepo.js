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
 * This is used to validate QR codes before allowing bin status updates
 * @param {string} qrCodeLink - Full QR code link (e.g., "ecosync://bin/abc123...")
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