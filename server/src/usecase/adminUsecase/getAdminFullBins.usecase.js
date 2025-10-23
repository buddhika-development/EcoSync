import { AdminFullBinRepository } from "../../repositories/adminRepository/admin.fullbins.repository.js";

/**
 * GetAdminFullBinsUseCase
 * Responsibility: Orchestrates fetching + validation
 */
const VALID_REQUEST_STATUSES = ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"];

export async function GetAdminFullBinsUseCase(query) {
  const { status, areaId, binId } = query ?? {};

  // Validate filters
  if (status && !VALID_REQUEST_STATUSES.includes(status.toUpperCase())) {
    const err = new Error(`Invalid status. Allowed: ${VALID_REQUEST_STATUSES.join(", ")}`);
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const result = await AdminFullBinRepository.findFullBins({
    status: status ? status.toUpperCase() : undefined,
    areaId,
    binId,
  });

  // Map DB rows to DTO (data transfer object)
  const data = (result.items || []).map((row) => ({
    fullBinId: row.full_bin_id,
    binId: row.bin_id,
    requestStatus: row.request_status,
    updatedAt: row.updated_at,
    binStatus: row.bins?.bin_status,
    latitude: Number(row.bins?.latitude),
    longitude: Number(row.bins?.longitude),
    areaId: row.bins?.area_id,
  }));

  return { data, total: result.total };
}
