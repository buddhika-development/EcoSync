'use client';

import { ReactNode } from 'react';
import { useSidebar } from './SidebarContext';

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={`mt-16 p-6 transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {children}
    </main>
  );
}
