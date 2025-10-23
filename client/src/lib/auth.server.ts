import { cookies } from 'next/headers';
import { api } from './api';

function buildCookieHeader(c: Awaited<ReturnType<typeof cookies>>): string {
    // Turn Next's cookies() store into a standard Cookie header
    return c.getAll().map(({ name, value }) => `${name}=${value}`).join('; ');
}

export async function getMe() {
    // 👈 NEXT 15: cookies() is async now
    const cookieStore = await cookies();
    const cookieHeader = buildCookieHeader(cookieStore);

    // Forward the cookie to your backend so it sees access_token
    const res = await api('/api/auth/me', {
        method: 'GET',
        headers: { cookie: cookieHeader },
    });

    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch /me');

    const body = await res.json();
    // Backend returns { ok: true, data: { uid, email, role, name } }
    if (!body.ok || !body.data) return null;

    return {
        id: body.data.uid,
        email: body.data.email,
        role: body.data.role,
        name: body.data.name,
    } as { id: string; email: string; role: 'admin' | 'collector' | 'resident'; name: string };
}
