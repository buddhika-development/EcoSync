// ✅ Single Responsibility: Handles only advanced filter dropdowns
// ✅ Interface Segregation: Separate from basic status filters
'use client';

import { Filter } from 'lucide-react';
import type { RecyclableType, RecyclableCategory } from '@/types/recyclable';
import { RECYCLABLE_TYPE_LABELS, RECYCLABLE_CATEGORY_LABELS } from '@/types/recyclable';

interface RecyclableAdvancedFiltersProps {
    selectedType: RecyclableType | 'All';
    selectedCategory: RecyclableCategory | 'All';
    onTypeChange: (type: RecyclableType | 'All') => void;
    onCategoryChange: (category: RecyclableCategory | 'All') => void;
}

/**
 * Advanced filters component for type and category filtering
 */
export default function RecyclableAdvancedFilters({
    selectedType,
    selectedCategory,
    onTypeChange,
    onCategoryChange,
}: RecyclableAdvancedFiltersProps) {
    const types: Array<RecyclableType | 'All'> = ['All', 'PICKUP', 'DROP-OFF'];
    const categories: Array<RecyclableCategory | 'All'> = [
        'All',
        'plastic-waste',
        'paper-waste',
        'metal-waste',
        'e-waste',
    ];

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters:</span>
            </div>

            {/* Type Filter */}
            <div>
                <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value as RecyclableType | 'All')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                    {types.map((type) => (
                        <option key={type} value={type}>
                            {type === 'All' ? 'All Types' : RECYCLABLE_TYPE_LABELS[type]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category Filter */}
            <div>
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value as RecyclableCategory | 'All')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category === 'All'
                                ? 'All Categories'
                                : RECYCLABLE_CATEGORY_LABELS[category]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
