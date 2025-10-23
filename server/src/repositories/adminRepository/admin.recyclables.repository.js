import { supabase_client } from "../../../libs/supabase/supabase.js";

/**
 * Repository: Handles recyclable requests fetching for admin.
 * SOLID: Single Responsibility – DB queries only.
 */
export const AdminRecyclablesRepository = {
  async getRecyclables({ status, category, type, areaId }) {
    const supabase = supabase_client;

    let query = supabase
  .from("recyclable_collect_request")
  .select(`
    recyclable_collect_request_id,
    status,
    type,
    category,
    weight,
    created_at,
    users:user_id (
      user_first_name,
      user_last_name,
      user_email_address
    ),
    area:area_id (
      area_name
    )
  `)
  .order("created_at", { ascending: false });

    // optional filters
    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (type) query = query.eq("type", type);
    if (areaId) query = query.eq("area_id", areaId);

    const { data, error } = await query;

    if (error) throw new Error(`DB_ERROR: ${error.message}`);

    return data;
  },
};
