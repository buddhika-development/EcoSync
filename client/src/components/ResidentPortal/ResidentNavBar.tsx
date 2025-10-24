'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  CubeIcon,
  CreditCardIcon,
  GiftIcon,
  ArrowPathIcon as RecycleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import useCurrentUserId from '@/hooks/useCurrentUserId';

const NAV = [
  { label: 'My Bins', href: '/app/home', icon: CubeIcon },
  { label: 'Recyclables', href: '/app/recyclables', icon: RecycleIcon },
  { label: 'Payments', href: '/app/payments', icon: CreditCardIcon },
];

export default function ResidentNavbar() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);
  const [rewardPoints, setRewardPoints] = useState(0);

  // Hardcoded rewards for now (will be replaced with actual data later)
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const userId = useCurrentUserId()
  
  useEffect(() => {
    const fetchRewardPoints = async () => {
      try {
        const response = await fetch(`${baseURL}/api/recycle_coin/user/recycle-coin/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setRewardPoints(data.message.data.recycle_coin_balance || 0);
        } else {
          console.error('Failed to fetch reward points');
        }

      }
      catch (error) {
        console.error('Error fetching reward points:', error);
      }
    }

    fetchRewardPoints();
  }, [userId])

  return (
    <nav className="w-full bg-white border-b border-gray-100 h-[80px]">
      <div className="flex items-center justify-between px-8 py-4 h-full w-full max-w-[1400px] mx-auto">
        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = (active || pathname) === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setActive(href)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 font-poppins
                  ${isActive
                    ? 'bg-gradient-to-br from-[#39B56A] to-[#2d9456] text-white shadow-md shadow-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#39B56A]'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Rewards Display - Modern Card */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200/50 shadow-sm">
          {/* Icon with gradient background */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg blur-sm opacity-40"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <SparklesIcon className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Points Display */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-amber-700/70 uppercase tracking-wider">Reward Points</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {rewardPoints.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-amber-600/60">PTS</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
