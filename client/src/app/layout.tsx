// src/app/layout.jsx
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import './styles/globals.css';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
