'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';

interface CollectorHeaderProps {
    userName?: string;
    userInitials?: string;
}

export default function CollectorHeader({ userName = 'User', userInitials = 'U' }: CollectorHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { label: 'My Routes', href: '/collector/dashboard', active: pathname === '/collector/dashboard' },
        { label: 'Recyclables', href: '/collector/recyclables', active: pathname === '/collector/recyclables' },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/collector/dashboard" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="EcoSync Logo"
                                width={150}
                                height={150}
                                className="object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    backgroundColor: item.active ? '#28A745' : 'transparent',
                                    color: item.active ? '#FFFFFF' : '#28A745',
                                }}
                                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 no-underline"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>



                    {/* User Info & Mobile Menu Button */}
                    <div className="flex items-center gap-3">
                        {/* User Profile */}
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Welcome</p>
                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {userInitials}
                            </div>
                        </div>

                        {/* Mobile User Avatar (Visible on small screens) */}
                        <div className="sm:hidden w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {userInitials}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
                        <div className="flex flex-col gap-2">
                            {/* User Info on Mobile */}
                            <div className="sm:hidden px-4 py-3 bg-gray-50 rounded-lg mb-2">
                                <p className="text-xs text-gray-500">Welcome</p>
                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                <p className="text-xs text-green-600 font-medium mt-1">Collector Dashboard</p>
                            </div>

                            {/* Nav Items */}
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                        ${item.active
                                            ? 'bg-green-600 text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-green-50'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* Logout Button on Mobile */}
                            <Link
                                href="/api/logout?redirect=/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-2"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }
            `}</style>
        </header>
    );
}
