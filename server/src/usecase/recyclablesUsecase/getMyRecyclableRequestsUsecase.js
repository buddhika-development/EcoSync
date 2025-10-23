import { RecyclableRequestRepository } from "../../repositories/recyclablesRepository/recyclableRequest.repository.js";
/**
 * UseCase: business orchestration (SRP). No HTTP/DB specifics.
 * DIP: depends on a repository abstraction (interface) rather than DB client.
 */
export async function GetMyRecyclableRequestsUseCase({ userId, filters }) {
  if (!userId) return { ok: false, status: 400, message: 'Missing user id' };

  // Minimal, defensive normalization (avoid code smells from unchecked inputs)
  const safe = {};
  if (filters?.status)   safe.status = String(filters.status).trim();
  if (filters?.type)     safe.type = String(filters.type).trim();
  if (filters?.category) safe.category = String(filters.category).trim();
  if (filters?.from)     safe.from = String(filters.from);
  if (filters?.to)       safe.to = String(filters.to);

  const rows = await RecyclableRequestRepository.getByUser(userId, safe);

  // DTO: decouple API from storage names (anti-corruption layer)
  const data = rows.map(r => ({
    id: r.recyclable_collect_request_id,
    userId: r.user_id,
    areaId: r.area_id,
    status: r.status,       // enum: recyclable_request_status_type
    type: r.type,           // enum: recyclable_request_type
    category: r.category,   // enum: recyclable_category_type
    weight: Number(r.weight),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  // Business-friendly default: newest first
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { ok: true, data };
}
