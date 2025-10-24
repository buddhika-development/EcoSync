// ✅ Single Responsibility: Handles only search input UI
// ✅ Open/Closed Principle: Extensible through props without modification
'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RecyclableSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Search bar component for filtering recyclable requests
 * Implements debouncing to avoid excessive API calls
 */
export default function RecyclableSearchBar({
    value,
    onChange,
    placeholder = 'Search by ID, status, type, or category...',
}: RecyclableSearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    // Debounce search input (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                />
                {localValue && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    );
}
