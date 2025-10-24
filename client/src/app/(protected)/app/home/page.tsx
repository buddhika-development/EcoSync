'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import useCurrentUserId from '@/hooks/useCurrentUserId';
import { api } from '@/lib/api';

import Header from "@/components/ResidentPortal/ResidentHeader";
import ResidentNavbar from "@/components/ResidentPortal/ResidentNavBar";
import BinCard from '@/components/bins/BinCard';
import MyBinsToolbar from '@/components/bins/MyBinsToolbar';
import BinQRModal from '@/components/bins/BinQRModal';
import type { Bin, BinHistoryRow, BinStatus } from '@/components/bins/types';

type ApiBinRow = {
  bin_id: string;
  latitude: number;
  longitude: number;
  area_id: string;
  user_id: string;
  qr_code_link: string;
  created_at: string;
  updated_at: string;
  bin_status: BinStatus;
};

function mapApiToUi(row: ApiBinRow): Bin {
  // SRP: single place to adapt API → UI shape (anti-duplication)
  return {
    id: row.bin_id,
    shortId: row.bin_id.slice(0, 8).toUpperCase(), // First 8 characters in uppercase
    location: `${row.latitude.toFixed(6)}, ${row.longitude.toFixed(6)}`,
    lastUpdated: new Date(row.updated_at).toLocaleString(),
    status: row.bin_status,
    qrCodeLink: row.qr_code_link, // Store QR code link for modal
  };
}

// Inline status filter chips (All, Empty, Full) — no "Normal"
function StatusChips({
  value,
  onChange,
}: {
  value: 'ALL' | BinStatus;
  onChange: (v: 'ALL' | BinStatus) => void;
}) {
  const options: Array<{ key: 'ALL' | BinStatus; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'EMPTY', label: 'Empty' },
    { key: 'FULL', label: 'Full' },
  ];

  return (
    <div className="flex items-center gap-3">
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm',
              active
                ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ].join(' ')}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}


export default function Page() {
  const userId = useCurrentUserId();
  const [filter, setFilter] = useState<'ALL' | BinStatus>('ALL');
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  const handleMarkFull = useCallback(async (id: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const res = await api(`/api/bins/${id}/mark-full`, {
        method: 'POST',
      });
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        throw new Error(body?.errors?.message || body?.message || 'Failed to mark full');
      }

      setBins(prev =>
        prev.map(b => (b.id === id ? { ...b, status: 'FULL', lastUpdated: new Date().toLocaleString() } : b))
      );

      // Show success message
      setSuccessMessage('Bin successfully marked as full! A pickup request has been created.');
      setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds

    } catch (e: any) {
      const errorMsg = e.message ?? 'Failed to mark bin as full';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000); // Clear after 5 seconds
    }
  }, []);

  const handleViewQr = useCallback((id: string) => {
    // SRP: Find the bin and open QR modal
    const bin = bins.find(b => b.id === id);
    if (bin) {
      setSelectedBin(bin);
      setQrModalOpen(true);
    }
  }, [bins]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const qs = new URLSearchParams();
  //       if (filter !== 'ALL') qs.set('status', filter);
  //       qs.set('page', '1');
  //       qs.set('pageSize', '50');
  //       const res = await api('/api/bins/my');
  //       const body = await res.json();
  //       if (!res.ok || body?.ok === false) {
  //         throw new Error(body?.errors?.message || body?.message || 'Failed to load bins');
  //       }

  //       const items: ApiBinRow[] = body?.data?.items ?? [];
  //       setBins(items.map(mapApiToUi));
  //     } catch (e: any) {
  //       setError(e.message ?? 'Could not fetch bins');
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  // }, [userId, filter]);

  // Change this effect's dependency array and body
useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all bins once; filter is applied client-side
      const res = await api('/api/bins/my');
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        throw new Error(body?.errors?.message || body?.message || 'Failed to load bins');
      }

      const items: ApiBinRow[] = body?.data?.items ?? [];
      setBins(items.map(mapApiToUi));
    } catch (e: any) {
      setError(e.message ?? 'Could not fetch bins');
    } finally {
      setLoading(false);
    }
  })();
}, [userId]); // ⬅️ remove `filter` here


  // const filteredBins = useMemo(() => bins, [bins]);
  const filteredBins = useMemo(() => {
    if (filter === 'ALL') return bins;
    return bins.filter(b => b.status === filter);
  }, [bins, filter]);

  console.log('[MyBins] userId =', userId);

  return (
    <main>
      <Header />
      <ResidentNavbar />

      {/* === Page Section === */}
      <section className="min-h-screen bg-emerald-50 py-8">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* === Title === */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bins</h1>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md animate-slide-in">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-slide-in">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          
          <div className="mb-10">
            <StatusChips
              value={filter}
              onChange={(val) => setFilter(val as 'ALL' | BinStatus)}
            />
          </div>

          {loading && <div className="text-gray-600">Loading bins…</div>}

          {/* === Cards grid === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && filteredBins.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
                onMarkFull={handleMarkFull}
                onViewQr={handleViewQr}
              />
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {selectedBin && selectedBin.qrCodeLink && (
        <BinQRModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedBin(null);
          }}
          binId={selectedBin.id}
          binShortId={selectedBin.shortId}
          qrCodeLink={selectedBin.qrCodeLink}
        />
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}