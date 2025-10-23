// SRP: Only data access. No HTTP, no business logic.
// Pattern: Repository
import supabase_client from "../../../libs/supabase/supabase_client.js";

export class FullBinStatusRepository {
  /**
   * Fetch full_bin_status rows that belong to a user
   * by joining via bins.user_id
   */
  async findByUser({ userId, status = null }) {
    const db = await supabase_client();

    // PostgREST join: full_bin_status.bin_id -> bins.bin_id
    // Use !inner to ensure we only get rows that match the join,
    // then filter by bins.user_id
    let q = db
      .from("full_bin_status")
      .select(`
        full_bin_id,
        bin_id,
        request_status,
        created_at,
        updated_at,
        bins!inner (
          bin_id,
          user_id,
          area_id,
          qr_code_link,
          bin_status
        )
      `)
      .eq("bins.user_id", userId)
      .order("created_at", { ascending: false });

    if (status) q = q.eq("request_status", status.toUpperCase());

    const { data, error } = await q;
    if (error) throw new Error(`DB_FIND_FULL_BIN_BY_USER_FAILED: ${error.message}`);

    // Normalize: keep useful bin fields, drop raw join object
    return (data ?? []).map(r => ({
      full_bin_id: r.full_bin_id,
      bin_id: r.bin_id,
      request_status: r.request_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      bin: r.bins
        ? {
            bin_id: r.bins.bin_id,
            area_id: r.bins.area_id,
            qr_code_link: r.bins.qr_code_link,
            bin_status: r.bins.bin_status
          }
        : null
    }));
  }
}
