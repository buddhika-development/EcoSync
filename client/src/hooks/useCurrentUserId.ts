// src/hooks/useCurrentUserId.js
'use client';
import { useAuth } from '@/context/AuthContext';
export default function useCurrentUserId() {
    const { user } = useAuth();
    return user?.id ?? null;
}
