// src/lib/api.ts
export async function api(path: any, options: RequestInit = {}) {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
    const res = await fetch(`${base}${path}`, {
        credentials: 'include', // <- send/receive httpOnly cookies
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        },
        cache: 'no-store',
        ...options,
    });
    return res;
}
