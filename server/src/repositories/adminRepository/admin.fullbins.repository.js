// src/repositories/adminRepository/admin.fullbins.repository.js
import { supabase_client } from "../../../libs/supabase/supabase.js";

export const AdminFullBinRepository = {
  async findFullBins({ status, areaId, areaName, binId }) {
    const supabase = supabase_client;

    let query = supabase
      .from("full_bins_with_area") 
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("request_status", status);
    }
    if (areaId) {
      query = query.eq("area_id", areaId);
    }
    if (areaName) {
      query = query.ilike("area_name", `%${areaName}%`);
    }
    if (binId) {
      query = query.eq("bin_id", binId);
    }

    const { data, count, error } = await query.order("updated_at", { ascending: false });
    
    if (error) throw new Error(`DB_ERROR: ${error.message}`);

    return { items: data ?? [], total: count ?? 0 };
  },
};
