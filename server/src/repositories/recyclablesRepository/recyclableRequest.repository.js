import { supabase } from "../../../libs/supabase/supabase.js";
/**
 * Repository Pattern: isolates DB details. Easier to unit test + swap DB.
 * OCP: extend filters here without touching usecase/controller.
 */
export const RecyclableRequestRepository = {
  /**
   * Get logged-in user's recyclable requests with optional filters.
   * Filters: status, type, category, from, to (created_at range)
   */
  async getByUser(userId, { status, type, category, from, to } = {}) {
    let q = supabase
      .from('recyclable_collect_request')
      .select(`
        recyclable_collect_request_id,
        user_id,
        area_id,
        status,
        type,
        category,
        weight,
        created_at,
        updated_at
      `)
      .eq('user_id', userId);

    if (status)   q = q.eq('status', status);
    if (type)     q = q.eq('type', type);
    if (category) q = q.eq('category', category);
    if (from)     q = q.gte('created_at', from);
    if (to)       q = q.lte('created_at', to);

    // DB-side ordering for performance/consistency
    q = q.order('created_at', { ascending: false });

    const { data, error } = await q;
    if (error) throw new Error(`DB_ERROR: ${error.message}`);
    return data ?? [];
  }
};
