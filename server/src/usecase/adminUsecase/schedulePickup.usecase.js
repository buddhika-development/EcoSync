// src/usecase/adminUsecase/schedulePickup.usecase.js

import { PickupFactory } from "../../factories/pickup.factory.js";
import { AdminPickupRepository } from "../../repositories/adminRepository/admin.pickups.repository.js";
import { supabase as sb } from "../../../libs/supabase/supabase.js";

/**
 * Schedule a pickup (single or bulk).
 * Applies Factory Method for creating order & task entities.
 * Uses service-role client (server-only) to avoid RLS issues.
 *
 * @param {Object} params
 * @param {string} params.areaId
 * @param {string[]} params.binIds
 * @param {string=} params.scheduledDate - YYYY-MM-DD
 * @param {boolean=} params.autoAssignCollector
 */
export async function SchedulePickupUseCase({ areaId, binIds, scheduledDate, autoAssignCollector }) {
  // ---- Validation ----------------------------------------------------------
  if (!areaId) {
    const err = new Error("areaId is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  if (!Array.isArray(binIds) || binIds.length === 0) {
    const err = new Error("binIds must be a non-empty array");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // ---- Load full_bin_status for given bins, ensure they are PENDING & in area
  const { data: fullBinsRaw, error: fullBinsErr } = await sb
    .from("full_bin_status")
    .select(`
      full_bin_id,
      bin_id,
      request_status,
      bins!inner (
        area_id,
        bin_status
      )
    `)
    .in("bin_id", binIds);

  if (fullBinsErr) throw new Error(`DB_ERROR: ${fullBinsErr.message}`);
  if (!fullBinsRaw?.length) {
    const err = new Error("No full-bin requests found for provided binIds");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Only schedule PENDING
  const pendingSameArea = fullBinsRaw.filter(
    (r) => r.request_status === "PENDING" && r.bins?.area_id === areaId
  );

  if (pendingSameArea.length === 0) {
    const err = new Error("No PENDING full-bin requests in the specified area for the provided binIds");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const fullBinIds = pendingSameArea.map((r) => r.full_bin_id);

  // ---- Determine collector (auto-assign from area if requested)
  let collectorId = null;
  if (autoAssignCollector) {
    const { data: areaRow, error: areaErr } = await sb
      .from("area")
      .select("collector_id")
      .eq("area_id", areaId)
      .single();

    if (areaErr) throw new Error(`DB_ERROR: ${areaErr.message}`);
    collectorId = areaRow?.collector_id || null;
  }

  // ---- Create order via Factory -------------------------------------------
  const orderData = PickupFactory.createOrder(areaId, collectorId, scheduledDate);
  const order = await AdminPickupRepository.createOrder(orderData);

  // ---- Create tasks via Factory -------------------------------------------
  const taskPayloads = PickupFactory.createTasks(order.order_id, fullBinIds);
  await AdminPickupRepository.createTasks(taskPayloads);

  // ---- Mark full bins as SCHEDULED ----------------------------------------
  await AdminPickupRepository.markBinsScheduled(fullBinIds);

  return {
    orderId: order.order_id,
    collectorId,
    totalTasks: fullBinIds.length,
    scheduledDate: order.scheduled_date || scheduledDate || null,
  };
}
