'use client';

import { memo, useCallback, useState, useEffect } from 'react';
import {
  ClockIcon,
  QrCodeIcon,
  ChevronDownIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { getBinHistory } from '@/services/binHistory.service';

import type { Bin, BinHistoryRow, HistoryStatus } from './types';
import { BIN_STATUS_BADGE, HISTORY_STATUS_BADGE } from './types';

/**
 * BinCard
 *
 * ✅ SRP: Pure presentational component for a single bin (header, actions, expandable history).
 * ✅ OCP: New actions/sections can be added via props without editing existing logic.
 * ✅ LSP: Accepts the Bin/History contracts; compatible subtypes won't break behavior.
 * ✅ ISP: Only requires minimal handlers; callers aren't forced to provide unused ones.
 * ✅ DIP: Delegates "what to do" on actions via callbacks from higher-level modules.
 *
 * Patterns:
 * - Presentational component (no data fetching / business logic).
 * - Composition over inheritance (handlers injected via props).
 * - Guard clauses for empty history.
 *
 * Clean Code:
 * - No magic strings (badge classnames centralized).
 * - Accessible controls (aria-expanded).
 * - Memo + stable callbacks to avoid needless re-renders.
 */

type Props = {
  bin: Bin;
  onMarkFull?: (id: string) => void;
  onViewQr?: (id: string) => void;
};

function BinCardComponent({
  bin,
  onMarkFull,
  onViewQr,
}: Props) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<BinHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!open) return;
      setLoading(true);
      try {
        const historyData = await getBinHistory(bin.id);
        console.log('Fetched history for bin:', historyData);
        setHistory(historyData || []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [bin.id, open]);

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);
  const handleViewQr = useCallback(() => onViewQr?.(bin.id), [onViewQr, bin.id]);
  const handleMarkFull = useCallback(() => onMarkFull?.(bin.id), [onMarkFull, bin.id]);

  const isFull = bin.status === 'FULL';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full overflow-hidden min-h-[210px] px-2">
      {/* === Header (identity + meta) === */}
      <div className="p-6 pb-4 flex justify-between items-start">
        <div>
          {/* Bin ID with trash icon (location removed per requirement) */}
          <div className="flex items-center gap-2 mb-1">
            <TrashIcon className="w-5 h-5 text-[#39B56A]" />
            {bin.shortId && (
              <h3 className="font-semibold text-lg text-gray-800" title={bin.id}>
                {bin.shortId}
              </h3>
            )}
          </div>

          {/* Last updated */}
          <div className="flex items-center text-gray-500 text-sm">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {bin.lastUpdated}
          </div>
        </div>

        {/* Bin status (EMPTY/NORMAL/FULL) */}
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${BIN_STATUS_BADGE[bin.status]}`}>
          {bin.status}
        </span>
      </div>

      {/* === Actions (equal width buttons) === */}
      <div className="border-t border-gray-100 p-5 flex gap-4">
        <button
          type="button"
          onClick={handleViewQr}
          className="flex-1 flex items-center justify-center border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          <QrCodeIcon className="w-4 h-4 mr-2" />
          View QR
        </button>

        <button
          type="button"
          onClick={handleMarkFull}
          disabled={isFull}
          className={`flex-1 flex items-center justify-center rounded-lg py-2 text-sm font-semibold transition
            ${isFull ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#39B56A] text-white hover:bg-[#2D9255]'}
          `}
        >
          Mark as Full
        </button>
      </div>

      {/* === History toggle (accessible disclosure) === */}
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full flex items-center justify-center gap-1 text-gray-600 text-sm py-3 hover:text-[#39B56A] transition"
        aria-expanded={open}
        aria-controls={`bin-history-${bin.id}`}
      >
        View History {history?.length > 0 && `(${history.length})`}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* === History content (stacked list cards) === */}
      {open && (
        <div id={`bin-history-${bin.id}`} className="px-5 pb-5">
          {/* Loading state */}
          {loading ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 text-center">
              Loading history...
            </div>
          /* Guard clause — empty state */
          ) : !history || history.length === 0 ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 text-center">
              No history yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((row, idx) => (
                <li
                  key={`${bin.id}-h-${idx}`}
                  className={`rounded-xl p-4 ${
                    row.request_status === 'COMPLETED'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-[#F7FDF9] border border-[#E6F4EA]'
                  }`}
                >
                  {/* Top row: date + status chip */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">
                      {(() => {
                        console.log('Rendering history row:', row); // Debug log for each row
                        
                        switch (row.request_status) {
                          case 'PENDING':
                            if (!row.created_at) {
                              console.warn('Missing created_at for PENDING request:', row);
                              return 'Pending Request';
                            }
                            return new Date(row.created_at).toLocaleString();
                          
                          case 'COMPLETED':
                            return row.updated_at 
                              ? new Date(row.updated_at).toLocaleString()
                              : 'Completed';
                          
                          case 'SCHEDULED':
                            return row.updated_at
                              ? new Date(row.updated_at).toLocaleString()
                              : 'Scheduled';
                          
                          default:
                            const date = row.updated_at || row.created_at;
                            return date 
                              ? new Date(date).toLocaleString()
                              : formatHistoryStatus(row.request_status);
                        }
                      })()}
                    </div>

                    {/* ✅ History status chip (Pending/Scheduled/Completed/Cancelled) */}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${HISTORY_STATUS_BADGE[row.request_status as HistoryStatus]}`}
                    >
                      {formatHistoryStatus(row.request_status)}
                    </span>
                  </div>

                  {/* Request ID */}
                  <p className="mt-2 text-sm text-gray-600">
                    Request ID: {row.full_bin_id.slice(0, 8).toUpperCase()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Format a date string safely */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

/** ✅ Tiny formatter — keeps UI strings consistent (avoids sprinkling .toLowerCase()/case logic) */
function formatHistoryStatus(s: string): string {
  // 👇 Simple map (OCP-ready for i18n later)
  const map: Record<string, string> = {
    PENDING: 'Pending',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return map[s] || s;
}

export default memo(BinCardComponent);
