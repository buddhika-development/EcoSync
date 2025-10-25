import { describe, it, expect, jest } from '@jest/globals';

const mockGetByUser = jest.fn();
await jest.unstable_mockModule(
  '../../src/repositories/recyclablesRepository/recyclableRequest.repository.js',
  () => ({
    RecyclableRequestRepository: { getByUser: mockGetByUser }, // ← correct method name
  })
);

const { GetMyRecyclableRequestsUseCase } = await import(
  '../../src/usecase/recyclablesUsecase/getMyRecyclableRequestsUsecase.js'
);

describe('usecase: GetMyRecyclableRequestsUseCase (more positive coverage)', () => {
  it('returns sorted results by created_at desc (happy path)', async () => {
    const rows = [
      {
        recyclable_collect_request_id: 'r2',
        user_id: 'u1',
        area_id: 'a1',
        status: 'PENDING',
        type: 'HOME',
        category: 'PLASTIC',
        weight: '1.50',
        created_at: '2025-10-20T10:00:00Z',
      },
      {
        recyclable_collect_request_id: 'r1',
        user_id: 'u1',
        area_id: 'a1',
        status: 'COMPLETED',
        type: 'HOME',
        category: 'PAPER',
        weight: '2.00',
        created_at: '2025-10-22T10:00:00Z',
      },
    ];
    mockGetByUser.mockResolvedValueOnce(rows);

    const res = await GetMyRecyclableRequestsUseCase({ userId: 'u1', filters: {} });

    expect(mockGetByUser).toHaveBeenCalledWith('u1', {}); // two args: userId, filters
    expect(res.ok).toBe(true);
    expect(res.data[0].id).toBe('r1'); // newer first
    expect(res.data[1].id).toBe('r2');
    expect(res.data[0].weight).toBe(2);
  });

  it('applies status/type/category filters (happy path)', async () => {
    const rows = [
      {
        recyclable_collect_request_id: 'r3',
        user_id: 'u1',
        area_id: 'a1',
        status: 'PENDING',
        type: 'HOME',
        category: 'PLASTIC',
        weight: '1.00',
        created_at: '2025-10-23T10:00:00Z',
      },
    ];
    mockGetByUser.mockResolvedValueOnce(rows);

    const filters = { status: 'PENDING', type: 'HOME', category: 'PLASTIC' };
    const res = await GetMyRecyclableRequestsUseCase({ userId: 'u1', filters });

    expect(mockGetByUser).toHaveBeenCalledWith('u1', filters); // two args
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].status).toBe('PENDING');
  });

  it('applies date range filters (happy path)', async () => {
    const rows = [
      {
        recyclable_collect_request_id: 'r4',
        user_id: 'u1',
        area_id: 'a1',
        status: 'PENDING',
        type: 'HOME',
        category: 'GLASS',
        weight: '5.00',
        created_at: '2025-09-15T10:00:00Z',
      },
    ];
    mockGetByUser.mockResolvedValueOnce(rows);

    const filters = { from: '2025-09-01', to: '2025-09-30' };
    const res = await GetMyRecyclableRequestsUseCase({ userId: 'u1', filters });

    expect(mockGetByUser).toHaveBeenCalledWith('u1', filters); // two args
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(1);
  });

  it('returns ok with empty array when repository yields none (happy path)', async () => {
    mockGetByUser.mockResolvedValueOnce([]);
    const res = await GetMyRecyclableRequestsUseCase({ userId: 'u1', filters: {} });

    expect(mockGetByUser).toHaveBeenCalledWith('u1', {});
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([]);
  });

  // single negative retained
  it('returns 400 when userId is missing', async () => {
    const res = await GetMyRecyclableRequestsUseCase({ userId: '', filters: {} });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });
});
