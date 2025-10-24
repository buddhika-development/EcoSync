// src/app/layout.jsx
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import './styles/globals.css';
import 'leaflet/dist/leaflet.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
