// src/usecase/adminUsecase/getAdminFullBins.usecase.js
import { AdminFullBinRepository } from "../../repositories/adminRepository/admin.fullbins.repository.js";

const VALID_REQUEST_STATUSES = ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"];

export async function GetAdminFullBinsUseCase(query) {
  const { status, areaId, areaName, binId } = query ?? {};

  // Step 1 — Validate filters
  if (status && !VALID_REQUEST_STATUSES.includes(status.toUpperCase())) {
    const err = new Error(`Invalid status. Allowed: ${VALID_REQUEST_STATUSES.join(", ")}`);
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Step 2 — Call repository (the repo now reads from view)
  const result = await AdminFullBinRepository.findFullBins({
    status: status ? status.toUpperCase() : undefined,
    areaId,
    areaName,
    binId,
  });

  // Step 3 — The view already returns flat data, no need to unwrap nested objects
  const data = (result.items || []).map((row) => ({
    fullBinId: row.full_bin_id,
    binId: row.bin_id,
    requestStatus: row.request_status,
    updatedAt: row.updated_at,
    binStatus: row.bin_status,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    areaId: row.area_id,
    areaName: row.area_name,
  }));

  return { data, total: result.total };
}
