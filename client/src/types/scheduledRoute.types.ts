// src/types/scheduledRoute.types.ts

export interface ScheduledRouteTask {
  taskId: string;
  fullBinId: string;
  binRequestStatus: string;
  binId: string;
  binStatus: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ScheduledRoute {
  orderId: string;
  orderStatus: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  areaId: string;
  areaName: string;
  collectorId: string | null;
  collectorName: string | null;
  tasks: ScheduledRouteTask[];
}

export interface ScheduledRoutesResponse {
  ok: boolean;
  data: ScheduledRoute[];
  total: number;
}

export interface RouteDetailTask {
  fullBinId: string;
  binId: string;
  latitude: number;
  longitude: number;
  binStatus: string;
  areaName: string;
  requestStatus: string;
  updatedAt: string;
}

export interface RouteDetail {
  orderId: string;
  areaId: string;
  areaName: string;
  collectorId: string | null;
  collectorName: string | null;
  scheduledDate: string;
  totalTasks: number;
  completedTasks: number;
  derivedStatus: string;
  tasks: RouteDetailTask[];
}

export interface RouteDetailResponse {
  ok: boolean;
  data: RouteDetail;
}
