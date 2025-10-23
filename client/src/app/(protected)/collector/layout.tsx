// src/app/(protected)/collector/layout.jsx
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth.server';
import { roleHome, Roles } from '@/lib/role';
import type { ReactNode } from 'react';

export default async function CollectorLayout({ children }: { children: ReactNode }) {
    const me = await getMe();
    if (!me) redirect('/api/logout?redirect=/login');
    if (me.role !== Roles.Collector) redirect(roleHome[me.role] || '/login');
    return <section className="min-h-screen">{children}</section>;
}
