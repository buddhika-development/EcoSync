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

    // Optional: fetch /me once on mount to prime client state.
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000') + '/api/auth/me', {
    //                 credentials: 'include',
    //             });
    //             if (res.ok) setUser(await res.json());
    //         } catch {
    //             // ignore
    //         }
    //     })();
    // }, []);

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
