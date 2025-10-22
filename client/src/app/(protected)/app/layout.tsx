// src/app/(protected)/app/layout.tsx
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth.server';
import { roleHome, Roles } from '@/lib/role';

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
    const me = await getMe();
    // If token is invalid, redirect to a logout route that will clear cookie
    if (!me) redirect('/api/logout?redirect=/login');
    if (me.role !== Roles.Resident) redirect(roleHome[me.role] || '/login');
    return <section className="min-h-screen">{children}</section>;
}
