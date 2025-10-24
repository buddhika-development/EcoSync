// ✅ SRP: All shared types/constants for the resident portal live here.

export type BinStatus = 'EMPTY' | 'NORMAL' | 'FULL';

export interface Bin {
  id: string;
  shortId: string; // First 8 characters of ID in uppercase
  location: string;
  lastUpdated: string; // ISO or display string (frontend-only here)
  status: BinStatus;
  qrCodeLink?: string; // QR code link for the bin (optional for backward compatibility)
}

export type HistoryStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface BinHistoryRow {
  dateTime: string;
  status: HistoryStatus;
  notes?: string;
}

// Centralized status -> style mapping (avoids magic strings)
export const BIN_STATUS_BADGE: Record<BinStatus, string> = {
  EMPTY: 'bg-blue-100 text-blue-700',
  NORMAL: 'bg-yellow-100 text-yellow-700',
  FULL: 'bg-red-100 text-red-700',
};

export const HISTORY_STATUS_BADGE: Record<HistoryStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  SCHEDULED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

// For filters
export const ALL_FILTERS: Array<'ALL' | BinStatus> = ['ALL', 'EMPTY', 'NORMAL', 'FULL'];
