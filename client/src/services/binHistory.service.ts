import { api } from '@/lib/api';

interface BinHistoryResponse {
  ok: boolean;
  message: string;
  data: {
    binId: string;
    count: number;
    history: Array<{
      full_bin_id: string;
      bin_id: string;
      request_status: string;
      updated_at: string | null;
      created_at: string;
    }>;
  };
}

export async function getBinHistory(binId: string) {
  try {
    const res = await api(`/api/bins/${binId}/history`);
    const rawData = await res.json();
    
    console.log('Raw API response:', rawData); // Log the raw response
    
    const data = rawData as BinHistoryResponse;
    
    if (!data.ok) {
      throw new Error(data.message || 'Failed to fetch bin history');
    }
    
    // Transform and validate the history data
    const history = data.data.history.map(item => ({
      ...item,
      created_at: item.created_at || new Date(Date.now()).toISOString(), // Use current date as fallback
      updated_at: item.updated_at || null
    }));
    
    console.log('Processed history data:', history); // Log the processed data
    
    return history;
  } catch (error) {
    console.error('Error fetching bin history:', error);
    return [];
  }
}