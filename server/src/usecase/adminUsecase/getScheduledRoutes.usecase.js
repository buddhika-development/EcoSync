// src/usecase/adminUsecase/getScheduledRoutes.usecase.js
import { AdminScheduledRoutesRepository } from "../../repositories/adminRepository/admin.scheduledroutes.repository.js";

/**
 * Use case: Fetch all scheduled pickup routes with details
 * Groups tasks by order and formats the response
 */
export async function GetScheduledRoutesUseCase(query) {
  const { status, areaId, areaName } = query ?? {};

  // Fetch all rows from the view
  const result = await AdminScheduledRoutesRepository.findAllScheduledRoutes({
    status,
    areaId,
    areaName,
  });

  // Group by order_id to structure the response properly
  const ordersMap = new Map();

  result.items.forEach((row) => {
    const orderId = row.order_id;

    if (!ordersMap.has(orderId)) {
      // Create new order entry
      ordersMap.set(orderId, {
        orderId: row.order_id,
        orderStatus: row.order_status,
        scheduledDate: row.scheduled_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        areaId: row.area_id,
        areaName: row.area_name,
        collectorId: row.collector_id,
        collectorName: row.collector_first_name && row.collector_last_name
          ? `${row.collector_first_name} ${row.collector_last_name}`.trim()
          : null,
        tasks: [],
      });
    }

    // Add task to the order if task_id exists (some orders might not have tasks yet)
    if (row.task_id) {
      const order = ordersMap.get(orderId);
      order.tasks.push({
        taskId: row.task_id,
        fullBinId: row.full_bin_id,
        binRequestStatus: row.bin_request_status,
        binId: row.bin_id,
        binStatus: row.bin_status,
        latitude: row.latitude != null ? Number(row.latitude) : null,
        longitude: row.longitude != null ? Number(row.longitude) : null,
      });
    }
  });

  // Convert map to array
  const orders = Array.from(ordersMap.values());

  return {
    data: orders,
    total: orders.length,
  };
}
