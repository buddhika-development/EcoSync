import { AdminBinRepository } from "../../repositories/adminRepository/admin.bins.repository.js";

const VALID_STATUSES = ["FULL", "EMPTY"];

export async function GetAdminBinsUseCase(query) {
  const { status, areaId, search } = query ?? {};

  // Basic validation
  if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
    const allowed = VALID_STATUSES.join(", ");
    const err = new Error(`Invalid status. Allowed: ${allowed}`);
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const result = await AdminBinRepository.findBins({
    status: status ? status.toUpperCase() : undefined,
    areaId,
    search,
  });

  // DTO mapping (clean output)
  const data = (result.items || []).map((b) => ({
    id: b.bin_id,
    lat: Number(b.latitude),
    lng: Number(b.longitude),
    areaId: b.area_id,
    userId: b.user_id,
    status: b.bin_status,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  }));

  return {
    data,
    total: result.total,
  };
}
