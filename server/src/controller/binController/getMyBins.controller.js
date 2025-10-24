import { fail, okay } from "../../../libs/response.js";

/**
 * Controller factory
 * DIP: inject the use case so we can unit-test controller with a fake interactor.
 */
export default function makeGetMyBinsController({ getUserBinsUsecase }) {
  if (typeof getUserBinsUsecase !== "function") {
    throw new Error("getUserBinsUsecase function is required");
  }

  /**
   * Express handler
   * Reads user id from req.user (middleware), query from req.query.
   */
  return async function GetMyBinsController(req, res) {
    try {
      // NOTE: adapt to your auth payload shape
      const userId =
        req.user?.uid || req.user?.user_id || req.auth?.userId || req.auth?.id;

      // Build raw input for the use case
      const rawInput = {
        userId,
        status: req.query.status, // optional
        page: req.query.page,
        pageSize: req.query.pageSize,
      };

      const result = await getUserBinsUsecase(rawInput);

      console.log(userId);

      if (!result.ok) {
        return fail(res, result.message, result.status, result.errors);
      }

      return okay(res, result.data, result.message, result.status);
    } catch (err) {
      console.error("Unexpected error in GetMyBinsController:", err);
      return fail(res, "Internal Server Error", 500);
    }
  };
}
