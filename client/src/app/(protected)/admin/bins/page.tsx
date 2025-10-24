'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bin, BinsResponse } from '@/types/bin.types';
import BinsFilters from '@/components/admin/BinsFilters';
import BinsTable from '@/components/admin/BinsTable';

// Dynamically import the map component to avoid SSR issues with Leaflet
const BinsMap = dynamic(() => import('@/components/admin/BinsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    fetchBins();
  }, [selectedStatus, selectedArea]);

  const fetchBins = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedArea) params.append('areaName', selectedArea);

      const url = `${apiBase}/api/admin/bins${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bins: ${response.statusText}`);
      }

      const data: BinsResponse = await response.json();
      
      if (data.ok) {
        setBins(data.data);
        setTotal(data.total);
      } else {
        throw new Error('Failed to fetch bins');
      }
    } catch (err) {
      console.error('Error fetching bins:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bins</h1>
        <p className="text-gray-600 mt-1">All bins across the system</p>
      </div>

      {/* Filters */}
      <BinsFilters
        selectedStatus={selectedStatus}
        selectedArea={selectedArea}
        onStatusChange={setSelectedStatus}
        onAreaChange={setSelectedArea}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Map View */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Map View</h2>
            <BinsMap bins={bins} />
          </div>

          {/* Table View */}
          <div>
            <BinsTable bins={bins} total={total} />
          </div>
        </>
      )}
    </div>
  );
}

