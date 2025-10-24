import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth.server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { SidebarProvider } from '@/components/admin/SidebarContext';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const me = await getMe();
    if (!me) redirect('/api/logout?redirect=/login');
    if (me.role !== 'admin') redirect(me.role === 'collector' ? '/collector/tasks' : '/app/home');
    
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50">
                <AdminSidebar />
                <AdminNavbar user={me} />
                <AdminLayoutClient>
                    {children}
                </AdminLayoutClient>
            </div>
        </SidebarProvider>
    );
}
