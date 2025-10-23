import { GetRecyclablesUseCase } from "../../usecase/adminUsecase/getRecyclables.usecase.js";

/**
 * Controller: Handles HTTP request/response for recyclables.
 */
export async function getRecyclablesController(req, res) {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      type: req.query.type,
      areaId: req.query.areaId,
    };

    const data = await GetRecyclablesUseCase(filters);
    return res.status(200).json({ ok: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
