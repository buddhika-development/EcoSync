// repositories/binHistory.repository.js
import supabase from "../../../libs/supabase/supabase_client.js";

/**
 * Repository: contains ONLY data-access logic.
 * DIP: depends on abstraction (Supabase client), not controllers/use cases.
 */
export const BinHistoryRepository = {
  /**
   * Fetch history records for a specific bin.
   * Optional filters:
   *  - status: request_status value
   *  - from/to: ISO timestamps to bound created_at
   */
  async findByBinId({ binId, status = null, from = null, to = null }) {
    // base select
    let query = supabase
      .from("full_bin_status")
      .select(
        `
        full_bin_id,
        bin_id,
        request_status,
        updated_at
      `
      )
      .eq("bin_id", binId)
      .order("updated_at", { ascending: false });

    // optional filters
    if (status) query = query.eq("request_status", status);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;

    if (error) {
      console.error("findByBinId error:", error);
      throw new Error("DB_ERROR: " + error.message);
    }

    // return empty array if no data
    return data || [];
  },
};
