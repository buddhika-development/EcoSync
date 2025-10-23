// src/hooks/useRole.js
'use client';
import { useAuth } from '@/context/AuthContext';
export default function useRole() {
    const { user } = useAuth();
    return user?.role ?? null;
}
