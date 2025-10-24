// src/controller/adminController/admin.scheduledroutes.controller.js
import { GetScheduledRoutesUseCase } from "../../usecase/adminUsecase/getScheduledRoutes.usecase.js";

/**
 * Controller - handles HTTP request/response for scheduled routes
 * SOLID: Single Responsibility - only HTTP transformation
 */
export async function getScheduledRoutesController(req, res) {
  try {
    const { status, areaId, areaName } = req.query;
    const result = await GetScheduledRoutesUseCase({ status, areaId, areaName });

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const isValidation = err?.code === "VALIDATION_ERROR";
    const statusCode = isValidation ? 400 : 500;

    return res.status(statusCode).json({
      ok: false,
      error: {
        message: err.message || "Unexpected error",
        code: err.code || "INTERNAL_ERROR",
      },
    });
  }
}
