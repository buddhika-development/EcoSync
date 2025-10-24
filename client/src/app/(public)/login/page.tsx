// src/app/(public)/login/page.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Leaf, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const submitted = useRef(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitted.current) return; // guard double submit
        submitted.current = true;
        setLoading(true);

        setErr('');
        const res = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setErr(body?.errors?.message || 'Login failed');
            submitted.current = false;
            setLoading(false);
            return;
        }

        const body = await res.json();
        // Backend returns { role: 'admin' | 'collector' | 'resident' }
        const roleHomeMap: Record<string, string> = {
            admin: '/admin/dashboard',
            collector: '/collector/dashboard',
            resident: '/app/home',
        };

        // hard navigate; middleware + server layouts will route correctly
        window.location.href = roleHomeMap[body.role] || '/app/home';
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-center relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                        <div className="relative z-10">
                            {/* Logo */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-white rounded-2xl p-4 shadow-lg">
                                    <Image
                                        src="/logo.png"
                                        alt="EcoSync Logo"
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Welcome Text */}
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                            <p className="text-green-100 text-sm">Sign in to continue to EcoSync</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="px-8 py-10">
                        <form onSubmit={onSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {err && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                                        <p className="text-sm text-red-700 font-medium">{err}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Text */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                                <Leaf className="h-4 w-4 text-green-600" />
                                Making waste management eco-friendly
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Decoration */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        © 2025 EcoSync. All rights reserved.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </main>
    );
}
