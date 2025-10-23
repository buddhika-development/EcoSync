import { supabase_client } from "../../../libs/supabase/supabase.js";

/**
 * AdminFullBinRepository
 * Responsibility: Only talk to the database.
 * SOLID: Single Responsibility Principle
 */
export const AdminFullBinRepository = {
  /**
   * Fetch full_bin_status rows joined with bins + area
   * @param {Object} filters
   * @param {string=} filters.status - request_status filter (PENDING | SCHEDULED | COMPLETED | CANCELLED)
   * @param {string=} filters.areaId - filter by area_id
   * @param {string=} filters.binId - filter by a specific bin
   */
  async findFullBins({ status, areaId, binId }) {
    const supabase = supabase_client;

    // Build base query
    let query = supabase
      .from("full_bin_status")
      .select(
        `
        full_bin_id,
        bin_id,
        request_status,
        updated_at,
        bins:bin_id (
          bin_status,
          latitude,
          longitude,
          area_id
        ),
        area:bins(area_id)
      `,
        { count: "exact" }
      );

    // Apply filters
    if (status && status.trim() !== "") query = query.eq("request_status", status.toUpperCase());
    if (areaId && areaId.trim() !== "") query = query.eq("bins.area_id", areaId);
    if (binId && binId.trim() !== "") query = query.eq("bin_id", binId);

    // Sort newest first
    const { data, count, error } = await query.order("updated_at", { ascending: false });

    if (error) throw new Error(`DB_ERROR: ${error.message}`);

    return { items: data ?? [], total: count ?? 0 };
  },
};
