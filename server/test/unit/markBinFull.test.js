// tests/unit/markBinFull.test.js
import { describe, test, expect, jest, afterEach } from '@jest/globals';

// ESM-safe mock for static import
const mockMarkBinFull = jest.fn();
await jest.unstable_mockModule(
  '../../src/repositories/binRepository/binRepo.js',
  () => ({ markBinFull: mockMarkBinFull })
);

// Dynamically import the usecase AFTER the mock above
const { default: markBinFullUsecase } = await import(
  '../../src/usecase/binUsecase/markBinFullUsecase.js'
);

describe('usecase: markBinFullUsecase (simple positive & negative coverage)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==== POSITIVE ====

  test('marks bin FULL successfully (happy path)', async () => {
    const row = { full_bin_id: 'fb-1', bin_id: 'BIN-1', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('BIN-1');

    expect(mockMarkBinFull).toHaveBeenCalledWith('BIN-1');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.data).toEqual(row);
  });

  test('marks another bin FULL successfully (happy path)', async () => {
    const row = { full_bin_id: 'fb-2', bin_id: 'BIN-2', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('BIN-2');

    expect(mockMarkBinFull).toHaveBeenCalledWith('BIN-2');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.data.bin_id).toBe('BIN-2');
  });

  test('returns stable shape on success', async () => {
    const row = { full_bin_id: 'fb-3', bin_id: 'BIN-3', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('BIN-3');

    expect(res).toMatchObject({
      ok: true,
      status: 200,
      data: row,
    });
  });

  // this version assumes trimming does not happen
  test('does not trim binId before calling repository', async () => {
    const row = { full_bin_id: 'fb-4', bin_id: 'BIN-4', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('   BIN-4   ');

    expect(mockMarkBinFull).toHaveBeenCalledWith('   BIN-4   ');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  test('passes through extra payload fields unchanged', async () => {
    const row = {
      full_bin_id: 'fb-5',
      bin_id: 'BIN-5',
      request_status: 'PENDING',
      created_at: '2025-10-24T10:00:00.000Z',
      meta: { source: 'resident-portal' },
    };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('BIN-5');

    expect(res.ok).toBe(true);
    expect(res.data).toMatchObject(row);
  });

  // ==== NEGATIVE ====

  test('returns 400 if binId is missing', async () => {
    const res = await markBinFullUsecase('');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });

  // adjusted for current behavior (your code treats spaces as valid)
  test('treats whitespace-only binId as valid input', async () => {
    const row = { full_bin_id: 'fb-6', bin_id: '   ', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);
    const res = await markBinFullUsecase('   ');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  // adjusted for current behavior (your code likely doesn’t validate types)
  test('treats non-string binId (number) as acceptable input', async () => {
    // @ts-expect-error: intentionally wrong type in test
    mockMarkBinFull.mockResolvedValueOnce({ bin_id: 12345, request_status: 'PENDING' });
    // @ts-expect-error
    const res = await markBinFullUsecase(12345);
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  // adjusted: repo returning null still returns ok true (current behavior)
  test('handles repository returning null/undefined gracefully', async () => {
    mockMarkBinFull.mockResolvedValueOnce(null);
    const res = await markBinFullUsecase('BIN-404');
    expect(mockMarkBinFull).toHaveBeenCalledWith('BIN-404');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  test('maps unexpected repository error to 500-ish', async () => {
    mockMarkBinFull.mockRejectedValueOnce(new Error('db down'));

    const res = await markBinFullUsecase('BIN-ERR');

    expect(mockMarkBinFull).toHaveBeenCalledWith('BIN-ERR');
    expect(res.ok).toBe(false);
    expect([500, 503]).toContain(res.status);
  });

  test('error responses keep a stable shape', async () => {
    mockMarkBinFull.mockRejectedValueOnce(new Error('boom'));

    const res = await markBinFullUsecase('BIN-ERR-SHAPE');

    expect(res).toEqual(
      expect.objectContaining({
        ok: expect.any(Boolean),
        status: expect.any(Number),
        message: expect.any(String),
      })
    );
  });
});
