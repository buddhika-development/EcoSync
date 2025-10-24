import { useEffect, useState } from 'react';
import { Area, fetchAllAreas } from '@/services/area.service';

export function useAreas() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAreas = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchAllAreas();
                console.log('Areas response:', response); // Debug log
                if (response.ok) {
                    setAreas(response.data);
                } else {
                    console.error('Failed to fetch areas:', response.message); // Debug log
                    setError(response.message);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load areas';
                console.error('Error in useAreas:', errorMessage); // Debug log
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadAreas();
    }, []);

    return { areas, loading, error };
}