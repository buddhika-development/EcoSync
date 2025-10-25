import supabase from "../../../libs/supabase/supabase_client.js";


export const BinHistoryRepository = {

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

    if (status) query = query.eq("request_status", status);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;

    if (error) {
      console.error("findByBinId error:", error);
      throw new Error("DB_ERROR: " + error.message);
    }


    return data || [];
  },
};
