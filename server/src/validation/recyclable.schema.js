import { z } from 'zod';

// Database enum values (uppercase with underscores)
export const recyclableStatusEnum = z.enum(['PENDING', 'CLAIMED', 'COLLECTED', 'CANCELLED']);

export const recyclableCategoryEnum = z.enum(['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ELECTRONIC', 'OTHER']);

export const recyclableTypeEnum = z.enum(['PICKUP', 'DROPOFF']);

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
