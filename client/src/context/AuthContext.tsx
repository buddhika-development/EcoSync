// src/context/AuthContext.jsx
'use client';

import { createContext, ReactNode, useContext, useEffect, useState, Dispatch, SetStateAction } from 'react';

type AuthContextType = {
    user: any | null;
    setUser: Dispatch<SetStateAction<any | null>>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: (_: any) => { },
});

export function AuthProvider({ children }: { children?: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);

    // Fetch user data on mount to populate client state
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000') + '/api/auth/me', {
                    credentials: 'include',
                });
                if (res.ok) {
                    const response = await res.json();
                    // The /me endpoint returns { ok: true, data: { uid, email, role, name } }
                    if (response.ok && response.data) {
                        // Map uid to id for consistency with useCurrentUserId hook
                        setUser({
                            id: response.data.uid,
                            ...response.data,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                // User remains null if fetch fails
            }
        })();
    }, []);

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
