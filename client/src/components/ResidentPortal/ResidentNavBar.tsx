'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  CubeIcon,
  CreditCardIcon,
  GiftIcon,
  ArrowPathIcon as RecycleIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { label: 'My Bins', href: '/app/home', icon: CubeIcon },
  { label: 'Recyclables', href: '/app/recyclables', icon: RecycleIcon },
  { label: 'Rewards', href: '/protected/app/rewards', icon: GiftIcon },
  { label: 'Payments', href: '/protected/app/payments', icon: CreditCardIcon },
];

export default function ResidentNavbar() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);

  return (
    <nav className="w-full bg-[#F7FDF9] border-b border-gray-200">
      <div className="flex items-center justify-start gap-8 px-6 pt-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = (active || pathname) === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setActive(href)}
              className={`flex items-center gap-2 text-sm font-medium pb-2 transition-colors
                ${isActive ? 'text-[#39B56A] border-b-2 border-[#39B56A]' : 'text-gray-600 hover:text-[#39B56A]'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
