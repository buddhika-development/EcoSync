// src/types/wasteRequest.types.ts

export interface WasteRequest {
  fullBinId: string;
  binId: string;
  requestStatus: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  updatedAt: string | null;
  binStatus: string;
  latitude: number;
  longitude: number;
  areaId: string;
  areaName: string;
}

export interface WasteRequestsResponse {
  ok: boolean;
  data: WasteRequest[];
  total: number;
}

export interface SchedulePickupRequest {
  areaName: string;
  binIds: string[];
  scheduledDate: string;
  autoAssignCollector: boolean;
}

export interface SchedulePickupResponse {
  ok: boolean;
  message?: string;
  orderId?: string;
  collectorId?: string | null;
  totalTasks?: number;
  scheduledDate?: string | null;
  error?: {
    message: string;
    code: string;
  };
}
