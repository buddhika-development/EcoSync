import { jest } from '@jest/globals';

// Mock the use cases
const mockGetAdminBinsUseCase = jest.fn();
const mockGetAdminFullBinsUseCase = jest.fn();
const mockSchedulePickupUseCase = jest.fn();
const mockGetPickupProgressUseCase = jest.fn();
const mockGetScheduledRoutesUseCase = jest.fn();

jest.unstable_mockModule('../../src/usecase/adminUsecase/getAdminBins.usecase.js', () => ({
  GetAdminBinsUseCase: mockGetAdminBinsUseCase
}));

jest.unstable_mockModule('../../src/usecase/adminUsecase/getAdminFullBins.usecase.js', () => ({
  GetAdminFullBinsUseCase: mockGetAdminFullBinsUseCase
}));

jest.unstable_mockModule('../../src/usecase/adminUsecase/schedulePickup.usecase.js', () => ({
  SchedulePickupUseCase: mockSchedulePickupUseCase
}));

jest.unstable_mockModule('../../src/usecase/adminUsecase/getPickupProgress.usecase.js', () => ({
  GetPickupProgressUseCase: mockGetPickupProgressUseCase
}));

jest.unstable_mockModule('../../src/usecase/adminUsecase/getScheduledRoutes.usecase.js', () => ({
  GetScheduledRoutesUseCase: mockGetScheduledRoutesUseCase
}));

// Import controllers after mocking
const { getAdminBinsController } = await import('../../src/controller/adminController/admin.bins.controller.js');
const { getAdminFullBinsController } = await import('../../src/controller/adminController/admin.fullbins.controller.js');
const { schedulePickupController, getPickupProgressController } = await import('../../src/controller/adminController/admin.pickups.controller.js');
const { getScheduledRoutesController } = await import('../../src/controller/adminController/admin.scheduledroutes.controller.js');

// Mock request and response objects
const mockRequest = (queryParams = {}, bodyParams = {}, params = {}) => ({
  query: queryParams,
  body: bodyParams,
  params: params
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getAdminBinsController - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with bins data on success', async () => {
    const req = mockRequest({ status: 'FULL', areaName: 'Colombo' });
    const res = mockResponse();

    const mockData = {
      data: [{ bin_id: '1', bin_status: 'FULL' }],
      total: 1
    };

    mockGetAdminBinsUseCase.mockResolvedValue(mockData);

    await getAdminBinsController(req, res);

    expect(mockGetAdminBinsUseCase).toHaveBeenCalledWith({
      status: 'FULL',
      areaId: undefined,
      areaName: 'Colombo',
      search: undefined
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      ...mockData
    });
  });

  test('should return 400 on validation error', async () => {
    const req = mockRequest({ status: 'INVALID' });
    const res = mockResponse();

    const validationError = new Error('Invalid status');
    validationError.code = 'VALIDATION_ERROR';

    mockGetAdminBinsUseCase.mockRejectedValue(validationError);

    await getAdminBinsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Invalid status',
        code: 'VALIDATION_ERROR'
      }
    });
  });

  test('should return 500 on internal error', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockGetAdminBinsUseCase.mockRejectedValue(new Error('Database error'));

    await getAdminBinsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Database error',
        code: 'INTERNAL_ERROR'
      }
    });
  });

  test('should handle requests with no query parameters', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockGetAdminBinsUseCase.mockResolvedValue({ data: [], total: 0 });

    await getAdminBinsController(req, res);

    expect(mockGetAdminBinsUseCase).toHaveBeenCalledWith({
      status: undefined,
      areaId: undefined,
      areaName: undefined,
      search: undefined
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getAdminFullBinsController - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with full bins data on success', async () => {
    const req = mockRequest({ status: 'PENDING', binId: '123' });
    const res = mockResponse();

    const mockData = {
      data: [{ full_bin_id: '1', request_status: 'PENDING' }],
      total: 1
    };

    mockGetAdminFullBinsUseCase.mockResolvedValue(mockData);

    await getAdminFullBinsController(req, res);

    expect(mockGetAdminFullBinsUseCase).toHaveBeenCalledWith({
      status: 'PENDING',
      areaId: undefined,
      areaName: undefined,
      binId: '123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      ...mockData
    });
  });

  test('should return 400 on validation error', async () => {
    const req = mockRequest({ status: 'INVALID_STATUS' });
    const res = mockResponse();

    const validationError = new Error('Invalid request status');
    validationError.code = 'VALIDATION_ERROR';

    mockGetAdminFullBinsUseCase.mockRejectedValue(validationError);

    await getAdminFullBinsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Invalid request status',
        code: 'VALIDATION_ERROR'
      }
    });
  });

  test('should return 500 on internal error', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockGetAdminFullBinsUseCase.mockRejectedValue(new Error('Query failed'));

    await getAdminFullBinsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Query failed',
        code: 'INTERNAL_ERROR'
      }
    });
  });
});

describe('schedulePickupController - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 201 on successful pickup scheduling', async () => {
    const req = mockRequest({}, {
      areaId: 'area-1',
      binIds: ['bin-1', 'bin-2'],
      scheduledDate: '2025-10-26',
      autoAssignCollector: true
    });
    const res = mockResponse();

    const mockResult = {
      orderId: 'order-123',
      scheduledDate: '2025-10-26'
    };

    mockSchedulePickupUseCase.mockResolvedValue(mockResult);

    await schedulePickupController(req, res);

    expect(mockSchedulePickupUseCase).toHaveBeenCalledWith({
      areaId: 'area-1',
      areaName: undefined,
      binIds: ['bin-1', 'bin-2'],
      scheduledDate: '2025-10-26',
      autoAssignCollector: true
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: 'Pickup scheduled',
      ...mockResult
    });
  });

  test('should return 400 on validation error (missing binIds)', async () => {
    const req = mockRequest({}, {
      areaId: 'area-1',
      scheduledDate: '2025-10-26'
    });
    const res = mockResponse();

    const validationError = new Error('binIds is required');
    validationError.code = 'VALIDATION_ERROR';

    mockSchedulePickupUseCase.mockRejectedValue(validationError);

    await schedulePickupController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: 'binIds is required'
    });
  });

  test('should return 400 on validation error (empty binIds)', async () => {
    const req = mockRequest({}, {
      areaId: 'area-1',
      binIds: [],
      scheduledDate: '2025-10-26'
    });
    const res = mockResponse();

    const validationError = new Error('binIds cannot be empty');
    validationError.code = 'VALIDATION_ERROR';

    mockSchedulePickupUseCase.mockRejectedValue(validationError);

    await schedulePickupController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should return 500 on internal error', async () => {
    const req = mockRequest({}, {
      areaId: 'area-1',
      binIds: ['bin-1'],
      scheduledDate: '2025-10-26'
    });
    const res = mockResponse();

    mockSchedulePickupUseCase.mockRejectedValue(new Error('Database insert failed'));

    await schedulePickupController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: 'Database insert failed'
    });
  });

  test('should handle areaName instead of areaId', async () => {
    const req = mockRequest({}, {
      areaName: 'Colombo',
      binIds: ['bin-1'],
      scheduledDate: '2025-10-26',
      autoAssignCollector: false
    });
    const res = mockResponse();

    mockSchedulePickupUseCase.mockResolvedValue({ orderId: 'order-123' });

    await schedulePickupController(req, res);

    expect(mockSchedulePickupUseCase).toHaveBeenCalledWith({
      areaId: undefined,
      areaName: 'Colombo',
      binIds: ['bin-1'],
      scheduledDate: '2025-10-26',
      autoAssignCollector: false
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('getPickupProgressController - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with pickup progress data', async () => {
    const req = mockRequest({}, {}, { orderId: 'order-123' });
    const res = mockResponse();

    const mockResult = {
      orderId: 'order-123',
      derivedStatus: 'IN_PROGRESS',
      totalTasks: 5,
      completedTasks: 2,
      tasks: []
    };

    mockGetPickupProgressUseCase.mockResolvedValue(mockResult);

    await getPickupProgressController(req, res);

    expect(mockGetPickupProgressUseCase).toHaveBeenCalledWith('order-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: mockResult
    });
  });

  test('should return 500 on error (order not found)', async () => {
    const req = mockRequest({}, {}, { orderId: 'invalid-order' });
    const res = mockResponse();

    mockGetPickupProgressUseCase.mockRejectedValue(new Error('Order not found'));

    await getPickupProgressController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: 'Order not found'
    });
  });

  test('should handle UUID format orderId', async () => {
    const req = mockRequest({}, {}, { orderId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = mockResponse();

    mockGetPickupProgressUseCase.mockResolvedValue({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      derivedStatus: 'COMPLETED',
      totalTasks: 3,
      completedTasks: 3,
      tasks: []
    });

    await getPickupProgressController(req, res);

    expect(mockGetPickupProgressUseCase).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getScheduledRoutesController - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with scheduled routes data', async () => {
    const req = mockRequest({ status: 'SCHEDULED', areaName: 'Colombo' });
    const res = mockResponse();

    const mockData = {
      data: [
        {
          orderId: 'order-1',
          orderStatus: 'SCHEDULED',
          areaName: 'Colombo',
          tasks: []
        }
      ],
      total: 1
    };

    mockGetScheduledRoutesUseCase.mockResolvedValue(mockData);

    await getScheduledRoutesController(req, res);

    expect(mockGetScheduledRoutesUseCase).toHaveBeenCalledWith({
      status: 'SCHEDULED',
      areaId: undefined,
      areaName: 'Colombo'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      ...mockData
    });
  });

  test('should return 400 on validation error', async () => {
    const req = mockRequest({ status: 'INVALID' });
    const res = mockResponse();

    const validationError = new Error('Invalid status');
    validationError.code = 'VALIDATION_ERROR';

    mockGetScheduledRoutesUseCase.mockRejectedValue(validationError);

    await getScheduledRoutesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Invalid status',
        code: 'VALIDATION_ERROR'
      }
    });
  });

  test('should return 500 on internal error', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockGetScheduledRoutesUseCase.mockRejectedValue(new Error('Database connection lost'));

    await getScheduledRoutesController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: {
        message: 'Database connection lost',
        code: 'INTERNAL_ERROR'
      }
    });
  });

  test('should handle no filters', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockGetScheduledRoutesUseCase.mockResolvedValue({ data: [], total: 0 });

    await getScheduledRoutesController(req, res);

    expect(mockGetScheduledRoutesUseCase).toHaveBeenCalledWith({
      status: undefined,
      areaId: undefined,
      areaName: undefined
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
