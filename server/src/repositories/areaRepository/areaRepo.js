import { supabase } from "../../../libs/supabase/supabase.js";

/**
 * Get all areas
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllAreas() {
    return await supabase
        .from('area')
        .select(`
            area_id,
            area_name,
            collector_id,
            collector:users(
                user_first_name,
                user_last_name
            )
        `)
        .order('area_name');
}

/**
 * Get area by ID
 * @param {string} areaId - UUID of area
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getAreaById(areaId) {
    const { data, error } = await supabase
        .from('area')
        .select(`
            area_id,
            area_name,
            collector_id,
            collector:users(
                user_first_name,
                user_last_name
            )
        `)
        .eq('area_id', areaId)
        .single();

    return { data, error };
}