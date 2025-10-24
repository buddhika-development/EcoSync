'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BinCardComponent from './BinCard';

import type { Bin as UIBin, BinStatus } from './types';

interface ApiBin {
    bin_id: string;
    latitude: number;
    longitude: number;
    area_id: string;
    user_id: string;
    qr_code_link: string;
    created_at: string;
    updated_at: string;
    bin_status: BinStatus;
}

interface BinsResponse {
    ok: boolean;
    message: string;
    data: {
        items: ApiBin[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export default function MyBins() {
    const [bins, setBins] = useState<ApiBin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBins = async () => {
            try {
                const res = await api('/api/bins/my');
                if (!res.ok) {
                    throw new Error('Failed to fetch bins');
                }
                const data: BinsResponse = await res.json();
                console.log('Bins data:', data); // Debug log
                setBins(data.data.items);
            } catch (err) {
                console.error('Error fetching bins:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch bins');
            } finally {
                setLoading(false);
            }
        };

        fetchBins();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!bins.length) return <div>No bins found</div>;

    // Log the first bin's data for debugging
    console.log('First bin data:', bins[0]);
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bins.map((bin) => {
                const mappedBin = {
                    id: bin.bin_id,
                    shortId: bin.bin_id.slice(0, 8).toUpperCase(),
                    location: `${bin.latitude}, ${bin.longitude}`,
                    lastUpdated: new Date(bin.updated_at).toLocaleString(),
                    status: bin.bin_status,
                };
                
                // Log the mapped bin data
                console.log('Mapped bin:', mappedBin);
                
                return (
                    <BinCardComponent
                        key={bin.bin_id}
                        bin={mappedBin}
                    />
                );
            })}
        </div>
    );
}