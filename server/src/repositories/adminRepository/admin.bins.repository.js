// src/repositories/adminRepository/admin.bins.repository.js
import { supabase_client } from "../../../libs/supabase/supabase.js";

export const AdminBinRepository = {
  /**
   * Fetch bins with optional filters (status, areaId, search)
   */
  async findBins({ status, areaId, search }) {
    const supabase = supabase_client;

    // Select only the fields admin dashboard needs
    let query = supabase
      .from("bins")
      .select(`
        bin_id,
        latitude,
        longitude,
        area:area_id (area_name),
        user_id,
        bin_status,
        created_at,
        updated_at
      `, { count: "exact" });

    // Apply filters only when actually provided
    if (status && status.trim() !== "") {
      query = query.eq("bin_status", status.toUpperCase());
    }

    if (areaId && areaId.trim() !== "") {
      query = query.eq("area_id", areaId);
    }

    if (search && search.trim() !== "") {
      // Adjust this if you later add a "label" column for bins
      query = query.ilike("bin_id::text", `%${search}%`);
    }

    const { data, count, error } = await query.order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`DB_ERROR: ${error.message}`);
    }

    return {
      items: data ?? [],
      total: count ?? 0,
    };
  },
};
