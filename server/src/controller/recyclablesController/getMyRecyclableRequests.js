import { okay, fail } from '../../../libs/response.js';
import { GetMyRecyclableRequestsUseCase } from '../../usecase/recyclablesUsecase/getMyRecyclableRequestsUsecase.js';

/**
 * Controller = HTTP adapter (SRP). No business or DB code here.
 * Pattern: Controller delegates to UseCase.
 */
export async function GetMyRecyclableRequestsController(req, res) {
  try {
    const userId = req?.user?.uid;
    if (!userId) return fail(res, 'Unauthorized', 401);

    // Optional, safe filters (no pagination per your preference)
    const { status, type, category, from, to } = req.query;

    const result = await GetMyRecyclableRequestsUseCase({
      userId,
      filters: { status, type, category, from, to }
    });

    if (!result.ok) {
      return fail(res, result.message, result.status ?? 400, result.errors);
    }
    return okay(res, result.data, 'History fetched successfully', 200);
  } catch (err) {
    return fail(res, 'Internal Server Error', 500, { message: err.message });
  }
}
