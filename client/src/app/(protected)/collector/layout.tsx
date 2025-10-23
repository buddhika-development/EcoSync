// src/app/(protected)/collector/layout.jsx
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth.server';
import { roleHome, Roles } from '@/lib/role';
import type { ReactNode } from 'react';
import CollectorHeader from '@/components/collector/CollectorHeader';

export default async function CollectorLayout({ children }: { children: ReactNode }) {
    const me = await getMe();
    if (!me) redirect('/api/logout?redirect=/login');
    if (me.role !== Roles.Collector) redirect(roleHome[me.role] || '/login');

    // Extract user info for header
    const userName = me.name || me.email?.split('@')[0] || 'Collector';

    // Create initials from name or email
    const nameWords = userName.split(' ');
    const userInitials = nameWords.length > 1
        ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
        : userName.slice(0, 2).toUpperCase();

    return (
        <section className="min-h-screen bg-gray-50">
            <CollectorHeader userName={userName} userInitials={userInitials} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </section>
    );
}
