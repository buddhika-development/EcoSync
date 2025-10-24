'use client';

import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-[#ffffff] border-b border-gray-200">

      <div className="flex items-center space-x-2">
        <div className=" p-2  flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="EcoSync Logo"
            width={120}
            height={120}
          />
        </div>
      </div>

      <div className="w-10 h-10 rounded-full bg-[#39B56A] flex items-center justify-center text-white font-semibold shadow-sm">
        JD
      </div>
    </header>
  );
}

