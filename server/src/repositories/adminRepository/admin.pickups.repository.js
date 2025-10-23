// src/repositories/adminRepository/admin.pickups.repository.js
// Admin-only repository (server-side). Uses service-role client to bypass RLS safely.
import { supabase as sb } from "../../../libs/supabase/supabase.js";

export const AdminPickupRepository = {
  // Create a pickup order (expects object from PickupFactory)
  async createOrder(orderData) {
    const { data, error } = await sb
      .from("pickup_orders")
      .insert([orderData])
      .select()
      .single();

    if (error) throw new Error(`DB_ERROR: ${error.message}`);
    return data;
  },

  // Insert many tasks (expects array from PickupFactory)
  async createTasks(tasks) {
    if (!tasks?.length) return true;
    const { error } = await sb.from("pickup_tasks").insert(tasks);
    if (error) throw new Error(`DB_ERROR: ${error.message}`);
    return true;
  },

  // Bulk-update full_bin_status → SCHEDULED
  async markBinsScheduled(fullBinIds) {
    if (!fullBinIds?.length) return true;
    const { error } = await sb
      .from("full_bin_status")
      .update({ request_status: "SCHEDULED" })
      .in("full_bin_id", fullBinIds);

    if (error) throw new Error(`DB_ERROR: ${error.message}`);
    return true;
  },

  // Fetch order details + tasks + nested bin/location/area (for progress view)
  async getOrderWithTasks(orderId) {
    // Order header with area details
    const { data: order, error: orderErr } = await sb
      .from("pickup_orders")
      .select(`
        order_id, 
        area_id, 
        collector_id, 
        status, 
        scheduled_date, 
        created_at,
        area:area_id (
          area_name
        ),
        collector:collector_id (
          user_first_name,
          user_last_name
        )
      `)
      .eq("order_id", orderId)
      .single();

    if (orderErr) throw new Error(`DB_ERROR: ${orderErr.message}`);

    // Linked tasks + full_bin_status + bins + area
    const { data: tasks, error: taskErr } = await sb
      .from("pickup_tasks")
      .select(
        `
        full_bin_status:full_bin_id (
          full_bin_id,
          request_status,
          updated_at,
          bins!inner (
            bin_id,
            latitude,
            longitude,
            bin_status,
            area:area_id (
              area_id,
              area_name
            )
          )
        )
      `
      )
      .eq("order_id", orderId);

    if (taskErr) throw new Error(`DB_ERROR: ${taskErr.message}`);

    return { order, tasks };
  },
};
