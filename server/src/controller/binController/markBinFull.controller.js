import markBinFullUsecase from "../../usecase/binUsecase/markBinFullUsecase.js";
import { okay, fail } from "../../../libs/response.js";

export default async function MarkBinFullController(req, res) {
  try {
    const binId = String(req.params.id || "").trim();

    const result = await markBinFullUsecase(binId);
    if (!result.ok) return fail(res, result.message, result.status, result.errors);

    return okay(res, result.data, result.message, result.status);
  } catch (err) {
    return fail(res, "Unexpected error", 500, { message: err.message });
  }
}
