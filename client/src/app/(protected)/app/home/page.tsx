'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import useCurrentUserId from '@/hooks/useCurrentUserId';
import { api } from '@/lib/api';

import Header from "@/components/ResidentPortal/ResidentHeader";
import ResidentNavbar from "@/components/ResidentPortal/ResidentNavBar";
import BinCard from '@/components/bins/BinCard';
import MyBinsToolbar from '@/components/bins/MyBinsToolbar';
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
   };
}

export default function Page() {
  const userId = useCurrentUserId(); 
  const [filter, setFilter] = useState<'ALL' | BinStatus>('ALL');
  const [bins, setBins] = useState<Bin[]>([]);           
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);

  const handleMarkFull = useCallback(async (id: string) => {
   try {
     setError(null);
     const res = await fetch(`/api/bins/${id}/mark-full`, {
       method: 'POST',
       credentials: 'include', 
       headers: { 'Content-Type': 'application/json' },
     });
     const body = await res.json();
     if (!res.ok || body?.ok === false) {
       throw new Error(body?.errors?.message || body?.message || 'Failed to mark full');
     }
     
     setBins(prev =>
       prev.map(b => (b.id === id ? { ...b, status: 'FULL', lastUpdated: new Date().toLocaleString() } : b))
     );
   } catch (e: any) {
     setError(e.message ?? 'Failed to mark bin as full');
   }
  }, []);

  const handleViewQr = useCallback((id: string) => {
   // SRP: only trigger intent; routing/modal can be implemented later
  }, []);

  useEffect(() => {
   (async () => {
     try {
       setLoading(true);
       setError(null);
       
       const qs = new URLSearchParams();
       if (filter !== 'ALL') qs.set('status', filter);
       qs.set('page', '1');
       qs.set('pageSize', '50');
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
 }, [userId, filter]);

 const filteredBins = useMemo(() => bins, [bins]);

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

          {/* === Search Bar === */}
          <div className="mb-10">
            <MyBinsToolbar
              activeFilter={filter}
              onChangeFilter={(val) => setFilter(val as 'ALL' | BinStatus)}
            />
          </div>

          {loading && <div className="text-gray-600">Loading bins…</div>}
          {error && !loading && (
            <div className="text-red-600 border border-red-200 bg-red-50 rounded-xl p-3 mb-6">
              {error}
            </div>
          )}

          {/* === Cards grid === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && filteredBins.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
                history={[]}
                onMarkFull={handleMarkFull}
                onViewQr={handleViewQr}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
