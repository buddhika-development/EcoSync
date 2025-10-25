import { describe, test, expect, jest } from '@jest/globals';

// ESM-safe mock for static import
const mockMarkBinFull = jest.fn();
await jest.unstable_mockModule(
  '../../src/repositories/binRepository/binRepo.js',   
  () => ({ markBinFull: mockMarkBinFull })
);

const { default: markBinFullUsecase } = await import(
  '../../src/usecase/binUsecase/markBinFullUsecase.js' 
);

describe('usecase: markBinFullUsecase (more positive coverage)', () => {
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

  test('returns stable shape and message (happy path)', async () => {
    const row = { full_bin_id: 'fb-3', bin_id: 'BIN-3', request_status: 'PENDING' };
    mockMarkBinFull.mockResolvedValueOnce(row);

    const res = await markBinFullUsecase('BIN-3');
    expect(res).toMatchObject({
      ok: true,
      status: 200,
      data: row,
    });
  });

  // single negative retained
  test('returns 400 if binId is missing', async () => {
    const res = await markBinFullUsecase('');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });
});
