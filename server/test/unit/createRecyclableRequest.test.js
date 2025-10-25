import { describe, it, expect, jest } from '@jest/globals';

// Mock BEFORE importing the use case (ESM rule)
await jest.unstable_mockModule('../../libs/response.js', () => ({
  // Return a plain object instead of touching res
  fail: (_res, message = 'Error', status = 400, extra = {}) => ({
    ok: false,
    status,
    errors: { message, ...extra },
  }),
}));

const { default: CreateRecyclableRequestUsecase } = await import(
  '../../src/usecase/recyclablesUsecase/createRecyclableRequestUsecase.js'
);

describe('usecase: CreateRecyclableRequestUsecase (more positive coverage)', () => {
  const repo = { create: jest.fn() };
  const usecase = new CreateRecyclableRequestUsecase(repo);

  it('creates a PENDING request (happy path)', async () => {
    const created = {
      recyclable_collect_request_id: 'r1',
      user_id: 'u1',
      area_id: 'a1',
      type: 'HOME',
      category: 'PLASTIC',
      weight: 3.25,
      status: 'PENDING',
      created_at: '2025-10-24T10:00:00Z',
    };
    repo.create.mockResolvedValueOnce(created);

    // many implementations allow calling execute with a plain payload
    const res = await usecase.execute({
      user_id: 'u1',
      area_id: 'a1',
      type: 'HOME',
      category: 'PLASTIC',
      weight: 3.25,
      status: 'PENDING',
    });

    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
    expect(res.data).toEqual(created);
  });

  it('accepts decimal weights (happy path)', async () => {
    const created = {
      recyclable_collect_request_id: 'r2',
      user_id: 'u1',
      area_id: 'a1',
      type: 'HOME',
      category: 'PAPER',
      weight: 1.5,
      status: 'PENDING'
    };
    repo.create.mockResolvedValueOnce(created);

    const res = await usecase.execute({
      user_id: 'u1',
      area_id: 'a1',
      type: 'HOME',
      category: 'PAPER',
      weight: 1.5,
      status: 'PENDING',
    });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
    expect(res.data.weight).toBe(1.5);
  });

  it('supports different category/type combinations (happy path)', async () => {
    const created = {
      recyclable_collect_request_id: 'r3',
      user_id: 'u9',
      area_id: 'a2',
      type: 'BUSINESS',
      category: 'GLASS',
      weight: 10,
      status: 'PENDING'
    };
    repo.create.mockResolvedValueOnce(created);

    const res = await usecase.execute({
      user_id: 'u9',
      area_id: 'a2',
      type: 'BUSINESS',
      category: 'GLASS',
      weight: 10,
      status: 'PENDING',
    });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(201);
    expect(res.data.category).toBe('GLASS');
  });


  it('returns 400 when weight is not positive', async () => {
    const res = await usecase.execute({
      user_id: 'u1',
      area_id: 'a1',
      type: 'HOME',
      category: 'PLASTIC',
      weight: 0,
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    expect(res.errors).toBeDefined();
  });
});
