import { supabase } from "../../../libs/supabase/supabase.js";

/**
 * Repository for bin data access
 * SOLID: 
 * - Single Responsibility: Only handles database operations for bins
 * - Dependency Inversion: Abstracts database details from business logic
 * Design Pattern: Repository Pattern - encapsulates data access logic
 * 
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