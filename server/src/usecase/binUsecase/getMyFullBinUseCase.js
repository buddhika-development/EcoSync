// SRP: Orchestrates the business rule.
// DIP: depends on repo abstraction passed in.
export default function buildGetMyFullBinStatusUsecase({ fullBinRepo }) {
  if (!fullBinRepo) throw new Error("fullBinRepo is required");

  return async function getMyFullBinStatus({ userId, status }) {
    if (!userId) {
      return { ok: false, status: 401, message: "Unauthorized", errors: { message: "Missing user" } };
    }
    const rows = await fullBinRepo.findByUser({ userId, status });
    return { ok: true, status: 200, message: "Full bin status history fetched", data: rows };
  };
}
