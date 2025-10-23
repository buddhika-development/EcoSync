import { SchedulePickupUseCase } from "../../usecase/adminUsecase/schedulePickup.usecase.js";
import { GetPickupProgressUseCase } from "../../usecase/adminUsecase/getPickupProgress.usecase.js";

/**
 * SOLID: Each function handles only HTTP transformation.
 */
export async function schedulePickupController(req, res) {
  try {
    const { areaId, areaName, binIds, scheduledDate, autoAssignCollector } = req.body;
    const result = await SchedulePickupUseCase({ areaId, areaName, binIds, scheduledDate, autoAssignCollector });
    return res.status(201).json({ ok: true, message: "Pickup scheduled", ...result });
  } catch (err) {
    const status = err.code === "VALIDATION_ERROR" ? 400 : 500;
    return res.status(status).json({ ok: false, error: err.message });
  }
}

export async function getPickupProgressController(req, res) {
  try {
    const { orderId } = req.params;
    const result = await GetPickupProgressUseCase(orderId);
    return res.status(200).json({ ok: true, data: result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
