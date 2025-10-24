// src/types/bin.types.ts

export interface Bin {
  id: string;
  lat: number;
  lng: number;
  areaName: string;
  userId: string;
  status: 'FULL' | 'EMPTY';
  createdAt: string;
  updatedAt: string;
}

export interface BinsResponse {
  ok: boolean;
  data: Bin[];
  total: number;
}
