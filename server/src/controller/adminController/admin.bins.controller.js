import { GetAdminBinsUseCase } from "../../usecase/adminUsecase/getAdminBins.usecase.js";

export async function getAdminBinsController(req, res) {
  try {
    const { status, areaId, search } = req.query;
    const result = await GetAdminBinsUseCase({ status, areaId, search });

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
