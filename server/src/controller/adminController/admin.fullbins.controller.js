import { GetAdminFullBinsUseCase } from "../../usecase/adminUsecase/getAdminFullBins.usecase.js";

/**
 * Controller - handles HTTP request/response for full bins.
 * SOLID: Single Responsibility - only HTTP transformation.
 */
export async function getAdminFullBinsController(req, res) {
  try {
    const { status, areaId, areaName, binId } = req.query;
    const result = await GetAdminFullBinsUseCase({ status, areaId, areaName, binId });

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
