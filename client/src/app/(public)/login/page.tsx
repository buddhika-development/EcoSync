// src/app/(public)/login/page.tsx
'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const submitted = useRef(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitted.current) return; // guard double submit
        submitted.current = true;

        setErr('');
        const res = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setErr(body?.errors?.message || 'Login failed');
            submitted.current = false;
            return;
        }

        const body = await res.json();
        // Backend returns { role: 'admin' | 'collector' | 'resident' }
        const roleHomeMap: Record<string, string> = {
            admin: '/admin/dashboard',
            collector: '/collector/dashboard',
            resident: '/app/home',
        };

        // hard navigate; middleware + server layouts will route correctly
        window.location.href = roleHomeMap[body.role] || '/app/home';
    }

    return (
        <main className="max-w-sm mx-auto p-6">
            <h1 className="text-xl font-semibold mb-4">Login</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input className="w-full border p-2 rounded" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                {err && <p className="text-red-600 text-sm">{err}</p>}
                <button className="w-full bg-primary text-white py-2 rounded">Login</button>
            </form>
        </main>
    );
}
