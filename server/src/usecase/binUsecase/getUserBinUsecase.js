import { fetchBinsQuerySchema } from "../../validation/bin.fetch.schema.js";
import { BIN_ERRORS, BIN_SUCCESS } from "../../constants/bin.constants.js";

/**
 * Use case factory
 * - SRP: orchestrates validation + repository call.
 * - DIP: depends on an abstracted repository (passed in).
 * - OCP: extend filters or mapping without changing controller.
 */
export default function makeGetUserBinsUsecase({ binRepository }) {
  if (!binRepository?.findBinsByUser) {
    throw new Error("binRepository with findBinsByUser is required");
  }

  /**
   * @param {Object} rawInput - { userId, status, page, pageSize }
   * @returns {Promise<{ok:boolean,status:number,message:string,data?:any,errors?:any}>}
   */
  return async function getUserBins(rawInput) {
    // 1) Validate inputs (keeps controller minimal)
    const parsed = fetchBinsQuerySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        status: 422,
        message: BIN_ERRORS.VALIDATION_ERROR,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { userId, status, page, pageSize } = parsed.data;

    // 2) Query repository
    const { data, error, total } = await binRepository.findBinsByUser({
      userId,
      status,
      page,
      pageSize,
    });

    if (error) {
      return {
        ok: false,
        status: 500,
        message: BIN_ERRORS.DATABASE_ERROR,
        errors: { database: [error.message ?? "Unknown database error"] },
      };
    }

    return {
      ok: true,
      status: 200,
      message: BIN_SUCCESS.FETCHED,
      data: {
        items: data ?? [],
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil((total ?? 0) / pageSize)),
      },
    };
  };
}
