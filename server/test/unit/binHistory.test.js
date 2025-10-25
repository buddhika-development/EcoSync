import { describe, it, expect, jest } from '@jest/globals';

const mockFindByBinId = jest.fn();

// FIXED: go up two levels to reach /src
await jest.unstable_mockModule(
  '../../src/repositories/binRepository/binHistory.repository.js',
  () => ({
    // adjust this shape if your real module exports differently (see notes below)
    BinHistoryRepository: { findByBinId: mockFindByBinId },
  })
);

const { GetBinHistoryUseCase } = await import(
  '../../src/usecase/binUsecase/binHistoryUsecase.js'
);

describe('usecase: GetBinHistoryUseCase (more positive coverage)', () => {
  it('returns history for a bin (happy path)', async () => {
    const rows = [
      { full_bin_id: 'f2', bin_id: 'B1', request_status: 'PENDING',   updated_at: '2025-10-02' },
      { full_bin_id: 'f1', bin_id: 'B1', request_status: 'COMPLETED', updated_at: '2025-10-01' },
    ];
    mockFindByBinId.mockResolvedValueOnce(rows);

    const res = await GetBinHistoryUseCase({ binId: 'B1' });
    expect(mockFindByBinId).toHaveBeenCalledWith({ binId: 'B1', status: undefined, from: undefined, to: undefined });
    expect(res.binId).toBe('B1');
    expect(res.count).toBe(2);
    expect(res.history).toEqual(rows);
  });

  it('applies status filter (happy path)', async () => {
    const rows = [{ full_bin_id: 'f3', bin_id: 'B2', request_status: 'PENDING', updated_at: '2025-10-03' }];
    mockFindByBinId.mockResolvedValueOnce(rows);

    const res = await GetBinHistoryUseCase({ binId: 'B2', status: 'PENDING' });
    expect(mockFindByBinId).toHaveBeenCalledWith({ binId: 'B2', status: 'PENDING', from: undefined, to: undefined });
    expect(res.history[0].request_status).toBe('PENDING');
  });

  it('applies date range filters (happy path)', async () => {
    const rows = [{ full_bin_id: 'f4', bin_id: 'B3', request_status: 'COMPLETED', updated_at: '2025-09-20' }];
    mockFindByBinId.mockResolvedValueOnce(rows);

    const res = await GetBinHistoryUseCase({ binId: 'B3', from: '2025-09-01', to: '2025-09-30' });
    expect(mockFindByBinId).toHaveBeenCalledWith({ binId: 'B3', status: undefined, from: '2025-09-01', to: '2025-09-30' });
    expect(res.count).toBe(1);
  });

  it('throws when binId is missing', async () => {
    await expect(GetBinHistoryUseCase({})).rejects.toThrow(/BIN_ID_REQUIRED/);
  });
});
