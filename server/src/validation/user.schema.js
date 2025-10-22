import { z } from 'zod';

export const RoleEnum = z.enum(['admin', 'collector', 'resident']);

export const createUserSchema = z.object({
    user_first_name: z.string().trim().min(1, 'first name is required'),
    user_last_name: z.string().trim().min(1, 'last name is required'),
    user_email_address: z.string().trim().email('valid email required'),
    user_contact_number: z.string().trim().optional(),
    user_profile_image: z.string().trim().optional(),
    user_role: RoleEnum.default('resident'),
    user_password: z.string().min(6, 'password must be at least 6 characters'),
});


