import { AdminPickupRepository } from "../../repositories/adminRepository/admin.pickups.repository.js";

/**
 * Use-case: Fetch order + dynamic progress summary.
 */
export async function GetPickupProgressUseCase(orderId) {
  const { order, tasks } = await AdminPickupRepository.getOrderWithTasks(orderId);

  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.full_bin_status?.request_status === "COMPLETED"
  ).length;

  let derivedStatus = "SCHEDULED";
  if (completed > 0 && completed < total) derivedStatus = "IN_PROGRESS";
  else if (completed === total && total > 0) derivedStatus = "COMPLETED";

  return {
    orderId: order.order_id,
    areaId: order.area_id,
    collectorId: order.collector_id,
    scheduledDate: order.scheduled_date,
    totalTasks: total,
    completedTasks: completed,
    derivedStatus,
    tasks: tasks.map((t) => ({
      fullBinId: t.full_bin_status.full_bin_id,
      binId: t.full_bin_status.bins.bin_id,
      latitude: t.full_bin_status.bins.latitude,
      longitude: t.full_bin_status.bins.longitude,
      binStatus: t.full_bin_status.bins.bin_status,
      areaName: t.full_bin_status.bins.area.area_name,
      requestStatus: t.full_bin_status.request_status,
      updatedAt: t.full_bin_status.updated_at,
    })),
  };
}
