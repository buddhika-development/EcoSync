import { z } from 'zod';

// Database enum values (uppercase with underscores)
export const recyclableStatusEnum = z.enum(['PENDING', 'COMPLETED', 'CANCELLED']);

export const recyclableCategoryEnum = z.enum(['plastic-waste', 'paper-waste', 'metal-waste', 'e-waste']);

export const recyclableTypeEnum = z.enum(['PICKUP', 'DROP-OFF']);

/**
 * Schema for updating recyclable request
 * Validates status, category, and weight updates
 */
export const updateRecyclableSchema = z.object({
    status: recyclableStatusEnum.optional(),
    category: recyclableCategoryEnum.optional(),
    weight: z.number()
        .positive('Weight must be positive')
        .max(1000, 'Weight cannot exceed 1000 kg')
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
);
