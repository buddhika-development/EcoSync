'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if API call fails
      router.push('/login');
    }
  };

  // Get user initials
  const getInitials = () => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return 'JD';
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-[#ffffff] border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="p-2 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="EcoSync Logo"
            width={120}
            height={120}
          />
        </div>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 rounded-full bg-[#39B56A] flex items-center justify-center text-white font-semibold shadow-sm hover:bg-[#2d9456] transition-colors"
        >
          {getInitials()}
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {user?.email || 'user@ecosync.com'}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

