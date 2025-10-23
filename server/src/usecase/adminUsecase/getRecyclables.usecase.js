import { AdminRecyclablesRepository } from "../../repositories/adminRepository/admin.recyclables.repository.js";

/**
 * Use-case: Fetch recyclable requests for admin.
 * SOLID: Handles only business logic, not DB or HTTP.
 */
export async function GetRecyclablesUseCase(filters) {
    const recyclables = await AdminRecyclablesRepository.getRecyclables(filters);

     // 🧾 Debug log – just to see what Supabase actually returns
  console.log("🧩 [DEBUG] Raw recyclable data from Supabase:");
  console.log(JSON.stringify(recyclables, null, 2));
  
    if (!Array.isArray(recyclables)) return [];
  
    return recyclables.map((r) => {
      const user = r?.users || {};
      const area = r?.area || {};
  
      return {
        id: r.recyclable_collect_request_id,
        status: r.status || "UNKNOWN",
        type: r.type || "UNKNOWN",
        category: r.category || "UNKNOWN",
        weight: r.weight || 0,
        createdAt: r.created_at || null,
        userName: `${user.user_first_name || ""} ${user.user_last_name || ""}`.trim() || "Unknown User",
        email: user.user_email_address || "N/A",
        areaName: area.area_name || "Unknown Area",
      };
    });
  }
