import { jest } from '@jest/globals';

// Mock AdminFullBinRepository
jest.unstable_mockModule('../../../src/repositories/adminRepository/admin.fullbins.repository.js', () => ({
    AdminFullBinRepository: {
        findFullBins: jest.fn()
    }
}));

// Import use case (named export)
const { GetAdminFullBinsUseCase } = await import('../../../src/usecase/adminUsecase/getAdminFullBins.usecase.js');

// Import mocked repository
const { AdminFullBinRepository } = await import('../../../src/repositories/adminRepository/admin.fullbins.repository.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';

// TEST SUITE: GetAdminFullBinsUseCase
describe('GetAdminFullBinsUseCase - Unit Tests', () => {

    const mockFullBinsData = {
        items: [
            {
                full_bin_id: 'fb-001',
                bin_id: 'bin-003',
                request_status: 'PENDING',
                updated_at: '2025-10-25T10:00:00Z',
                bin_status: 'FULL',
                latitude: '6.9271',
                longitude: '79.8612',
                area_id: 'area-001',
                area_name: 'Malabe'
            },
            {
                full_bin_id: 'fb-002',
                bin_id: 'bin-004',
                request_status: 'SCHEDULED',
                updated_at: '2025-10-25T11:00:00Z',
                bin_status: 'FULL',
                latitude: '6.9344',
                longitude: '79.8428',
                area_id: 'area-002',
                area_name: 'Kaduwela'
            }
        ],
        total: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #1: Success - Get all full bins
    test('should successfully return all full bins', async () => {

        AdminFullBinRepository.findFullBins.mockResolvedValue(mockFullBinsData);

        const result = await GetAdminFullBinsUseCase({});

        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
        
        expect(result.data[0]).toEqual({
            fullBinId: 'fb-001',
            binId: 'bin-003',
            requestStatus: 'PENDING',
            updatedAt: '2025-10-25T10:00:00Z',
            binStatus: 'FULL',
            latitude: 6.9271,
            longitude: 79.8612,
            areaId: 'area-001',
            areaName: 'Malabe'
        });

        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledTimes(1);
    });

    // TEST CASE #2: Success - Filter by request status
    test('should return filtered full bins by request status', async () => {
 
        const pendingOnly = {
            items: [mockFullBinsData.items[0]],
            total: 1
        };
        AdminFullBinRepository.findFullBins.mockResolvedValue(pendingOnly);

        const result = await GetAdminFullBinsUseCase({ status: 'PENDING' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].requestStatus).toBe('PENDING');
        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledWith({ status: 'PENDING' });
    });

    // TEST CASE #3: Error - Invalid status
    test('should throw validation error for invalid status', async () => {
        
        await expect(GetAdminFullBinsUseCase({ status: 'INVALID_STATUS' }))
            .rejects.toThrow('Invalid status');
    });

    // TEST CASE #4: Edge Case - Empty result
    test('should return empty array when no full bins match filters', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockResolvedValue({ items: [], total: 0 });

        // ACT
        const result = await GetAdminFullBinsUseCase({ status: 'COMPLETED' });

        // ASSERT
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #5: Edge Case - Null coordinates
    test('should handle null latitude/longitude gracefully', async () => {
        // ARRANGE
        const binsWithNullCoords = {
            items: [{
                full_bin_id: 'fb-003',
                bin_id: 'bin-005',
                request_status: 'PENDING',
                updated_at: '2025-10-25T12:00:00Z',
                bin_status: 'FULL',
                latitude: null,
                longitude: null,
                area_id: 'area-003',
                area_name: 'Kottawa'
            }],
            total: 1
        };
        AdminFullBinRepository.findFullBins.mockResolvedValue(binsWithNullCoords);

        // ACT
        const result = await GetAdminFullBinsUseCase({});

        // ASSERT
        expect(result.data[0].latitude).toBeNull();
        expect(result.data[0].longitude).toBeNull();
    });

    // TEST CASE #6: Negative - Repository throws database error
    test('should throw error when repository fails', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockRejectedValue(
            new Error('Connection timeout')
        );

        // ACT & ASSERT
        await expect(GetAdminFullBinsUseCase({}))
            .rejects.toThrow('Connection timeout');
    });

    // TEST CASE #7: Negative - Invalid area_id format
    test('should handle invalid area_id gracefully', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockResolvedValue({ items: [], total: 0 });

        // ACT
        const result = await GetAdminFullBinsUseCase({ areaId: 'invalid-uuid-format' });

        // ASSERT
        expect(result.data).toEqual([]);
        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledWith({ 
            areaId: 'invalid-uuid-format' 
        });
    });

    // TEST CASE #8: Edge Case - Missing optional fields
    test('should handle full bins with missing area_name', async () => {
        // ARRANGE
        const binsWithoutAreaName = {
            items: [{
                full_bin_id: 'fb-004',
                bin_id: 'bin-006',
                request_status: 'SCHEDULED',
                updated_at: '2025-10-25T13:00:00Z',
                bin_status: 'FULL',
                latitude: '6.9271',
                longitude: '79.8612',
                area_id: 'area-004',
                area_name: null
            }],
            total: 1
        };
        AdminFullBinRepository.findFullBins.mockResolvedValue(binsWithoutAreaName);

        // ACT
        const result = await GetAdminFullBinsUseCase({});

        // ASSERT
        expect(result.data[0].areaName).toBeNull();
    });

    // TEST CASE #9: Edge Case - Repository returns empty items array
    test('should handle repository returning empty items gracefully', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockResolvedValue({ 
            items: [], 
            total: 0 
        });

        // ACT
        const result = await GetAdminFullBinsUseCase({});

        // ASSERT
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #10: Edge Case - Multiple filters combined
    test('should handle multiple filter parameters correctly', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockResolvedValue({ items: [], total: 0 });

        // ACT
        const result = await GetAdminFullBinsUseCase({ 
            status: 'PENDING',
            areaId: 'area-001',
            areaName: 'Malabe'
        });

        // ASSERT
        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledWith({
            status: 'PENDING',
            areaId: 'area-001',
            areaName: 'Malabe',
            binId: undefined
        });
        expect(result.data).toEqual([]);
    });
});
