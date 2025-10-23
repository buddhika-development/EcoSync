// usecases/binHistory.usecase.js
import { BinHistoryRepository } from "../../repositories/binRepository/binHistory.repository.js";

/**
 * Use Case: orchestrates domain logic (filters, ordering, validation).
 * Open/Closed: easy to extend (e.g., pagination) without touching controller.
 */
export async function GetBinHistoryUseCase({ binId, status, from, to }) {
  // lightweight guards
  if (!binId) {
    throw new Error("BIN_ID_REQUIRED");
  }

  // Delegate to repository (DB access)
  const rows = await BinHistoryRepository.findByBinId({
    binId,
    status,
    from,
    to,
  });

  // If you want to transform/shape response (DTO), do it here
  return {
    binId,
    count: rows.length,
    history: rows,
  };
}
