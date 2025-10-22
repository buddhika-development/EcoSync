import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SALT_ROUNDS = 12;

export async function hashPassword(password) { return bcrypt.hash(password, SALT_ROUNDS); }

export async function verifyPassword(password, hashedPassword) { return bcrypt.compare(password, hashedPassword); }

export function signAccessJwt(payload, expiresIn = '1h') { return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }); }

export function verifyAccessJwt(token) {
    try {
        return { payload: jwt.verify(token, process.env.JWT_SECRET) };
    } catch (error) {
        return { error: 'Invalid or expired token' };
    }
}