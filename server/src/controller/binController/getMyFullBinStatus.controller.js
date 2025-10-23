// SRP: Translate HTTP <-> use-case; no DB code here.
import { okay, fail } from "../../../libs/response.js";
import buildGetMyFullBinStatusUsecase from "../../usecase/binUsecase/getMyFullBinUseCase.js";
import { FullBinStatusRepository } from "../../repositories/binRepository/fullBinStatus.repository.js";

const usecase = buildGetMyFullBinStatusUsecase({
  fullBinRepo: new FullBinStatusRepository()
});

export default async function getMyFullBinStatusController(req, res) {
  try {
    // You chose Option A: inline bypass sets req.user.uid
    const userId = req.user?.uid;           // IMPORTANT: use uid here
    const status = req.query?.status || null;

    const result = await usecase({ userId, status });
    if (!result.ok) return fail(res, result.message, result.status, result.errors);
    return okay(res, result.data, result.message, result.status);
  } catch (err) {
    return fail(res, "Failed to fetch full bin status", 500, { message: err.message });
  }
}
