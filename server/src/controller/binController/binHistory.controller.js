// controller/binController/binHistory.controller.js
import { okay, fail } from "../../../libs/response.js";
import { GetBinHistoryUseCase } from "../../usecase/binUsecase/binHistoryUsecase.js";

export async function GetBinHistoryController(req, res) {
  try {
    const { binId } = req.params;
    if (!binId) {
      return fail(res, "binId is required in the route param", 400);
    }

    const { status, from, to } = req.query;

    const result = await GetBinHistoryUseCase({
      binId,
      status: status || null,
      from: from || null,
      to: to || null,
    });

    // ✅ Use okay(res, data, message, status)
    return okay(res, result, "Bin history fetched successfully", 200);
  } catch (err) {
    console.error("GetBinHistoryController error:", err);
    return fail(res, err.message || "Server error", 500);
  }
}
