'use client';

import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-[#F7FDF9] border-b border-gray-200">
      
      <div className="flex items-center space-x-2">
        <div className="bg-[#39B56A] p-2 rounded-xl flex items-center justify-center">
          <Image
            src="/logo.png" 
            alt="EcoSync Logo"
            width={24}
            height={24}
          />
        </div>
        <h1 className="text-xl font-semibold">
          <span className="text-black">Eco</span>
          <span className="text-[#39B56A]">Sync</span>
        </h1>
      </div>

      <div className="w-10 h-10 rounded-full bg-[#39B56A] flex items-center justify-center text-white font-semibold shadow-sm">
        JD
      </div>
    </header>
  );
}

