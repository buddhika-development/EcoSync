'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ResidentHeader() {
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
    return 'U';
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 w-full max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex items-center h-[80px]">
          <Image
            src="/logo.png"
            alt="EcoSync Logo"
            width={200}
            height={200}
            className="h-[80px] w-auto object-contain"
          />
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {/* Welcome Message */}
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium font-poppins text-[14px]">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-900 text-[18px] font-poppins  ">{user?.name || 'User'}</p>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-[#39B56A] to-[#2d9456] hover:from-[#2d9456] hover:to-[#248a47] transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
                {getInitials()}
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                  {/* User Info */}
                  <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39B56A] to-[#2d9456] flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {getInitials()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 font-poppins text-[16px]">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-poppins text-[14px]">
                          {user?.email || 'user@ecosync.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors font-poppins text-[16px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
