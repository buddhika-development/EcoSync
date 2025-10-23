import { createUserSchema } from '../../validation/user.schema.js';
import { findUserByEmail, insertUser } from '../../repositories/userRepository/userRepo.js';
import { hashPassword } from '../../../utils/crypto.js';

export default async function createUserUsecase(rawInput) {
    // 1) validate + normalize input
    const parsed = createUserSchema.safeParse(rawInput);
    console.log("Create user input parse result:", parsed);
    if (!parsed.success) {
        const flat = parsed.error.flatten();
        return { ok: false, status: 422, message: 'Validation error', errors: flat.fieldErrors };
    }
    const input = parsed.data;
    const email = input.user_email_address.toLowerCase();

    // 2) unique email
    const existing = await findUserByEmail(email);
    if (existing) {
        return { ok: false, status: 409, message: 'Email already in use' };
    }

    // 3) hash password
    const passwordHash = await hashPassword(input.user_password);

    // 4) build row matching your DB columns
    const row = {
        user_first_name: input.user_first_name,
        user_last_name: input.user_last_name,
        user_email_address: email,
        user_contact_number: input.user_contact_number ?? null,
        user_profile_image: input.user_profile_image ?? null,
        user_role: input.user_role,               // 'admin' | 'collector' | 'resident'
        user_password: passwordHash,              // store hash (you already chose to store it)
    };

    // 5) insert
    const created = await insertUser(row);

    // 6) return dto
    return {
        ok: true,
        status: 201,
        message: 'User created',
        data: { user_id: created.user_id, user_role: created.user_role }
    };
}
