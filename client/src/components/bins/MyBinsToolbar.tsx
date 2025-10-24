'use client';

import MagnifyingGlassIcon from '@heroicons/react/24/solid/esm/MagnifyingGlassIcon';
import { ALL_FILTERS } from './types';

// ✅ SRP: Toolbar with filters + (dummy) search & select.
// 🧩 Easily extend/replace without touching parent page.

export default function MyBinsToolbar({
  activeFilter,
  onChangeFilter,
}: {
  activeFilter: string;
  onChangeFilter: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
      {/* Search + dropdown (UI only) */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full sm:w-[600px] lg:w-[800px]">
            
            {/* Input */}
            <input
                type="search"
                placeholder="Search by Bin ID..."
                className="w-full rounded-xl border border-[#CFE9CF] bg-[#F7FDF9] pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#39B56A] focus:border-[#39B56A] transition"
            />
        </div>
       </div>
    </div>
  );
}
