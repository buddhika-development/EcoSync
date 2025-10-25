//10
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getBinStatusById: jest.fn(),
    getFullBinStatusByBinId: jest.fn(),
    updateBinStatus: jest.fn(),
    updateFullBinStatus: jest.fn(),
    updatePickupTaskCleared: jest.fn()
}));


const {
    getBinStatusById,
    getFullBinStatusByBinId,
    updateBinStatus,
    updateFullBinStatus,
    updatePickupTaskCleared
} = await import('../../../src/repositories/collectorRepository/collectorRepo.js');
const updateBinStatusUC = (await import('../../../src/usecase/collectorUsecase/updateBinStatusUC.js')).default;

describe('updateBinStatusUC', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // positive
    test('should successfully update bin status to EMPTY and full bin status to COLLECTED', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        const mockCurrentBin = {
            bin_id: binId,
            location_name: 'Main Street Junction',
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567-8901',
            bin_id: binId,
            request_status: 'PENDING'
        };

        const mockUpdatedBin = {
            ...mockCurrentBin,
            status: bin_status,
            updated_at: '2025-10-25T10:30:00.000Z'
        };

        const mockUpdatedFullBin = {
            ...mockCurrentFullBin,
            request_status: full_bin_status,
            updated_at: '2025-10-25T10:30:00.000Z'
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });
        updateBinStatus.mockResolvedValue({ data: mockUpdatedBin, error: null });
        updateFullBinStatus.mockResolvedValue({ data: mockUpdatedFullBin, error: null });
        updatePickupTaskCleared.mockResolvedValue({ error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId, orderId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.bin.status).toBe(bin_status);
        expect(result.data.fullBinStatus.request_status).toBe(full_bin_status);

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(getBinStatusById).toHaveBeenCalledWith(binId);
        expect(updateBinStatus).toHaveBeenCalledTimes(1);
        expect(updateFullBinStatus).toHaveBeenCalledTimes(1);
        expect(updatePickupTaskCleared).toHaveBeenCalledTimes(1);
        expect(updatePickupTaskCleared).toHaveBeenCalledWith(orderId, mockUpdatedFullBin.full_bin_id);
    });

    // negative
    test('should return error for invalid binId format', async () => {
        // Arrange
        const invalidBinId = 'not-a-valid-uuid';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        // Act
        const result = await updateBinStatusUC(invalidBinId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*bin.*id/i);

        expect(getBinStatusById).not.toHaveBeenCalled();
        expect(updateBinStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when bin does not exist', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        getBinStatusById.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toMatch(/bin.*not found/i);

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(updateBinStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error for invalid bin_status value', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const invalid_bin_status = 'INVALID_STATUS';
        const full_bin_status = 'COLLECTED';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });

        // Act
        const result = await updateBinStatusUC(binId, invalid_bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(422);
        expect(result.message).toMatch(/validation/i);

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(updateBinStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error for invalid full_bin_status value', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const invalid_full_bin_status = 'INVALID_STATUS';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, invalid_full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(422);
        expect(result.message).toMatch(/validation/i);

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(updateBinStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when database fails to update bin status', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });
        updateBinStatus.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/database|error/i);

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(updateBinStatus).toHaveBeenCalledTimes(1);
        expect(updateFullBinStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when database fails to update full bin status', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        const mockUpdatedBin = {
            ...mockCurrentBin,
            status: bin_status
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });
        updateBinStatus.mockResolvedValue({ data: mockUpdatedBin, error: null });
        updateFullBinStatus.mockResolvedValue({
            data: null,
            error: { message: 'Full bin table update failed' }
        });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/database|error/i);

        expect(updateBinStatus).toHaveBeenCalledTimes(1);
        expect(updateFullBinStatus).toHaveBeenCalledTimes(1);
        expect(updatePickupTaskCleared).not.toHaveBeenCalled();
    });

    // edge case
    test('should handle idempotent update when bin is already collected', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'EMPTY'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            bin_id: binId,
            request_status: 'COLLECTED'
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.message).toMatch(/already.*collected/i);
        expect(result.data.fullBinStatus.request_status).toBe('COLLECTED');

        expect(getBinStatusById).toHaveBeenCalledTimes(1);
        expect(getFullBinStatusByBinId).toHaveBeenCalledTimes(1);
        // Should NOT call updates - returns early for idempotency
        expect(updateBinStatus).not.toHaveBeenCalled();
        expect(updateFullBinStatus).not.toHaveBeenCalled();
    });

    // edge case
    test('should successfully update bin status without orderId', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const bin_status = 'EMPTY';
        const full_bin_status = 'COLLECTED';
        // No orderId provided

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        const mockUpdatedBin = {
            ...mockCurrentBin,
            status: bin_status
        };

        const mockUpdatedFullBin = {
            ...mockCurrentFullBin,
            request_status: full_bin_status
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });
        updateBinStatus.mockResolvedValue({ data: mockUpdatedBin, error: null });
        updateFullBinStatus.mockResolvedValue({ data: mockUpdatedFullBin, error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);

        expect(updateBinStatus).toHaveBeenCalledTimes(1);
        expect(updateFullBinStatus).toHaveBeenCalledTimes(1);
        expect(updatePickupTaskCleared).not.toHaveBeenCalled();
    });

    // edge case
    test('should successfully update bin status to CANCELLED and clear task', async () => {
        // Arrange
        const binId = 'b4a5f876-1234-5678-9abc-def012345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const bin_status = 'UNAVAILABLE';
        const full_bin_status = 'CANCELLED';

        const mockCurrentBin = {
            bin_id: binId,
            status: 'FULL'
        };

        const mockCurrentFullBin = {
            full_bin_id: 'f123-4567',
            request_status: 'PENDING'
        };

        const mockUpdatedBin = {
            ...mockCurrentBin,
            status: bin_status
        };

        const mockUpdatedFullBin = {
            ...mockCurrentFullBin,
            request_status: full_bin_status
        };

        getBinStatusById.mockResolvedValue({ data: mockCurrentBin, error: null });
        getFullBinStatusByBinId.mockResolvedValue({ data: mockCurrentFullBin, error: null });
        updateBinStatus.mockResolvedValue({ data: mockUpdatedBin, error: null });
        updateFullBinStatus.mockResolvedValue({ data: mockUpdatedFullBin, error: null });
        updatePickupTaskCleared.mockResolvedValue({ error: null });

        // Act
        const result = await updateBinStatusUC(binId, bin_status, full_bin_status, collectorId, orderId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.fullBinStatus.request_status).toBe('CANCELLED');


        expect(updatePickupTaskCleared).toHaveBeenCalledTimes(1);
        expect(updatePickupTaskCleared).toHaveBeenCalledWith(orderId, mockUpdatedFullBin.full_bin_id);
    });
});
