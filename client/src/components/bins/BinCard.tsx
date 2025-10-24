'use client';

import { memo, useCallback, useState } from 'react';
import {
  ClockIcon,
  QrCodeIcon,
  ChevronDownIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import type { Bin, BinHistoryRow } from './types';
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
  history?: BinHistoryRow[];
  onMarkFull?: (id: string) => void;
  onViewQr?: (id: string) => void;
};

function BinCardComponent({
  bin,
  history = [],
  onMarkFull,
  onViewQr,
}: Props) {
  const [open, setOpen] = useState(false);

  // Log the bin data received by BinCard
  console.log('BinCard received bin:', bin);

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
        View History
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* === History content (stacked list cards) === */}
      {open && (
        <div id={`bin-history-${bin.id}`} className="px-5 pb-5">
          {/* Guard clause — empty state */}
          {history.length === 0 ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 text-center">
              No history yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((row, idx) => (
                <li
                  key={`${bin.id}-h-${idx}`}
                  className="bg-[#F7FDF9] rounded-xl p-4 border border-[#E6F4EA]"
                >
                  {/* Top row: date + status chip */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">
                      {row.dateTime}
                    </div>

                    {/* ✅ History status chip (Pending/Scheduled/Completed/Cancelled) */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${HISTORY_STATUS_BADGE[row.status]}`}
                    >
                      {formatHistoryStatus(row.status)}
                    </span>
                  </div>

                  {/* Notes/description */}
                  <p className="mt-2 text-sm text-gray-600">
                    {row.notes ?? '—'}
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

/** ✅ Tiny formatter — keeps UI strings consistent (avoids sprinkling .toLowerCase()/case logic) */
function formatHistoryStatus(s: BinHistoryRow['status']): string {
  // 👇 Simple map (OCP-ready for i18n later)
  const map = {
    PENDING: 'Pending',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  } as const;
  return map[s];
}

export default memo(BinCardComponent);
