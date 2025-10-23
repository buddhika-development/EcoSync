import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth.server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const me = await getMe();
    if (!me) redirect('/api/logout?redirect=/login');
    if (me.role !== 'admin') redirect(me.role === 'collector' ? '/collector/tasks' : '/app/home');
    return <section className="min-h-screen">{children}</section>;
}
