// src/repositories/adminRepository/admin.scheduledroutes.repository.js
import { supabase_client } from "../../../libs/supabase/supabase.js";

export const AdminScheduledRoutesRepository = {
  /**
   * Fetch all pickup orders with details from the view
   * @param {Object} filters - Optional filters (status, areaId, areaName)
   * @returns {Promise<{items: Array, total: number}>}
   */
  async findAllScheduledRoutes({ status, areaId, areaName }) {
    const supabase = supabase_client;

    let query = supabase
      .from("pickup_orders_with_area")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("order_status", status);
    }

    if (areaId) {
      query = query.eq("area_id", areaId);
    }

    if (areaName) {
      query = query.ilike("area_name", `%${areaName}%`);
    }

    const { data, count, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`DB_ERROR: ${error.message}`);
    }

    return {
      items: data ?? [],
      total: count ?? 0,
    };
  },
};
