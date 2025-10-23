import { markBinFull } from "../../repositories/binRepository/binRepo.js";

export default async function markBinFullUsecase(binId) {
  if (!binId) {
    return { ok: false, status: 400, message: "Bin ID is required" };
  }

  try {
    const fullRow = await markBinFull(binId);
    return {
      ok: true,
      status: 200,
      message: "Bin marked FULL and full_bin_status created",
      data: fullRow,
    };
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("BIN_NOT_FOUND"))
      return { ok: false, status: 404, message: "Bin not found" };
    if (msg.includes("ALREADY_FULL"))
      return { ok: false, status: 409, message: "Bin already FULL" };
    return { ok: false, status: 500, message: "Database operation failed", errors: { message: msg } };
  }
}
