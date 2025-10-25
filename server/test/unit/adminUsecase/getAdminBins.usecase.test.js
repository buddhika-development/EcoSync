import { jest } from '@jest/globals';

// Mock AdminBinRepository
jest.unstable_mockModule('../../../src/repositories/adminRepository/admin.bins.repository.js', () => ({
    AdminBinRepository: {
        findBins: jest.fn()
    }
}));

// Import use case (named export)
const { GetAdminBinsUseCase } = await import('../../../src/usecase/adminUsecase/getAdminBins.usecase.js');

// Import mocked repository
const { AdminBinRepository } = await import('../../../src/repositories/adminRepository/admin.bins.repository.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';

// TEST SUITE: GetAdminBinsUseCase
describe('GetAdminBinsUseCase - Unit Tests', () => {

    // TEST DATA - Repository returns raw data
    const mockBinsData = {
        items: [
            {
                bin_id: 'bin-001',
                latitude: '6.9271',
                longitude: '79.8612',
                bin_status: 'FULL',
                area: { area_name: 'Colombo' },
                user_id: 'user-001',
                created_at: '2025-10-25T10:00:00Z',
                updated_at: '2025-10-25T10:00:00Z'
            },
            {
                bin_id: 'bin-002',
                latitude: '6.9344',
                longitude: '79.8428',
                bin_status: 'EMPTY',
                area: { area_name: 'Dehiwala' },
                user_id: 'user-002',
                created_at: '2025-10-25T11:00:00Z',
                updated_at: '2025-10-25T11:00:00Z'
            }
        ],
        total: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #1: Success - Get all bins without filters
    test('should successfully return all bins without filters', async () => {
    
        AdminBinRepository.findBins.mockResolvedValue(mockBinsData);

        const result = await GetAdminBinsUseCase({});

        expect(result).toBeDefined();
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
        
        expect(result.data[0]).toEqual({
            id: 'bin-001',
            lat: 6.9271,
            lng: 79.8612,
            areaName: 'Colombo',
            userId: 'user-001',
            status: 'FULL',
            createdAt: '2025-10-25T10:00:00Z',
            updatedAt: '2025-10-25T10:00:00Z'
        });

        expect(AdminBinRepository.findBins).toHaveBeenCalledTimes(1);
        expect(AdminBinRepository.findBins).toHaveBeenCalledWith({});
    });

    // TEST CASE #2: Success - Filter by status
    test('should return filtered bins by status', async () => {

        const fullBinsOnly = {
            items: [mockBinsData.items[0]],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(fullBinsOnly);

        const result = await GetAdminBinsUseCase({ status: 'FULL' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe('FULL');
        expect(AdminBinRepository.findBins).toHaveBeenCalledWith({ status: 'FULL' });
    });

    // TEST CASE #3: Error - Invalid status
    test('should throw validation error for invalid status', async () => {
       
        await expect(GetAdminBinsUseCase({ status: 'INVALID' }))
            .rejects.toThrow('Invalid status');
    });

    // TEST CASE #4: Edge Case - Empty result
    test('should return empty array when no bins found', async () => {
     
        AdminBinRepository.findBins.mockResolvedValue({ items: [], total: 0 });

        const result = await GetAdminBinsUseCase({ status: 'FULL' });

        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #5: Edge Case - Null area (orphaned bin)
    test('should handle bins with null area', async () => {

        const binsWithNullArea = {
            items: [{
                bin_id: 'bin-003',
                latitude: '6.9271',
                longitude: '79.8612',
                bin_status: 'EMPTY',
                area: null,
                user_id: 'user-003',
                created_at: '2025-10-25T12:00:00Z',
                updated_at: '2025-10-25T12:00:00Z'
            }],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(binsWithNullArea);

        const result = await GetAdminBinsUseCase({});

        expect(result.data[0].areaName).toBeNull();
    });

    // TEST CASE #6: Negative - Repository throws error
    test('should throw error when repository fails', async () => {
        // ARRANGE
        AdminBinRepository.findBins.mockRejectedValue(new Error('Database connection failed'));

        // ACT & ASSERT
        await expect(GetAdminBinsUseCase({}))
            .rejects.toThrow('Database connection failed');
    });

    // TEST CASE #7: Negative - Invalid coordinates format
    test('should handle invalid coordinate strings gracefully', async () => {
        // ARRANGE
        const invalidCoords = {
            items: [{
                bin_id: 'bin-004',
                latitude: 'invalid',
                longitude: 'invalid',
                bin_status: 'EMPTY',
                area: { area_name: 'Test Area' },
                user_id: 'user-004',
                created_at: '2025-10-25T12:00:00Z',
                updated_at: '2025-10-25T12:00:00Z'
            }],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(invalidCoords);

        // ACT
        const result = await GetAdminBinsUseCase({});

        // ASSERT
        expect(result.data[0].lat).toBeNaN();
        expect(result.data[0].lng).toBeNaN();
    });

    // TEST CASE #8: Edge Case - Multiple filters combined
    test('should handle multiple filters combined', async () => {
        // ARRANGE
        AdminBinRepository.findBins.mockResolvedValue({ items: [], total: 0 });

        // ACT
        const result = await GetAdminBinsUseCase({ 
            status: 'FULL',
            areaId: 'area-001'
        });

        // ASSERT
        expect(AdminBinRepository.findBins).toHaveBeenCalledWith({
            status: 'FULL',
            areaId: 'area-001',
            areaName: undefined,
            search: undefined
        });
        expect(result.data).toEqual([]);
    });

    // TEST CASE #9: Negative - Missing required bin_id field
    test('should handle bins with missing bin_id', async () => {
        // ARRANGE
        const incompleteBin = {
            items: [{
                bin_id: null,
                latitude: '6.9271',
                longitude: '79.8612',
                bin_status: 'EMPTY',
                area: { area_name: 'Test' },
                user_id: 'user-005',
                created_at: '2025-10-25T12:00:00Z',
                updated_at: '2025-10-25T12:00:00Z'
            }],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(incompleteBin);

        // ACT
        const result = await GetAdminBinsUseCase({});

        // ASSERT
        expect(result.data[0].id).toBeNull();
    });
});
