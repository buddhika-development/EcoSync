// 
// ✅ Composition Root: orchestrates smaller components (no business logic here)
// ✅ Single Responsibility: Only handles component composition and state management
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import RecyclableCard from "./RecyclableCard";
import RecyclableFilters from "./RecyclableFilters";
import RecyclableAdvancedFilters from "./RecyclableAdvancedFilters";
import RecyclableRequestForm from "./RecyclableRequestForm";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import { fetchRecyclableRequestsHistory } from "@/services/recyclableRequests.service";
import type {
  RecyclableRequest,
  RecyclableStatus,
  RecyclableType,
  RecyclableCategory,
} from "@/types/recyclable";

export default function RecyclablePage() {
  const userId = useCurrentUserId();
  const [status, setStatus] = useState<RecyclableStatus | "All">("All");
  const [type, setType] = useState<RecyclableType | "All">("All");
  const [category, setCategory] = useState<RecyclableCategory | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [recyclables, setRecyclables] = useState<RecyclableRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ Handle user ID loading
  useEffect(() => {
    if (userId !== null) {
      setUserLoading(false);
      console.log("[RecyclablePage] User ID loaded:", userId);
    }
  }, [userId]);

  /**
   * ✅ Fetch recyclable requests with applied filters
   * Dependency Inversion: Uses service abstraction
   */
  const fetchRecyclables = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Build filters object (only include non-"All" values)
      const filters: {
        status?: RecyclableStatus;
        type?: RecyclableType;
        category?: RecyclableCategory;
      } = {};

      if (status !== "All") filters.status = status;
      if (type !== "All") filters.type = type;
      if (category !== "All") filters.category = category;

      const response = await fetchRecyclableRequestsHistory(filters);

      if (response.ok && response.data) {
        setRecyclables(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch recyclables:", error);
      setRecyclables([]);
    } finally {
      setLoading(false);
    }
  }, [userId, status, type, category]);

  // ✅ Fetch when filters change
  useEffect(() => {
    fetchRecyclables();
  }, [fetchRecyclables]);

  /**
   * ✅ Handle successful form submission
   */
  const handleFormSuccess = () => {
    fetchRecyclables();
    setTimeout(() => setShowForm(false), 2000);
  };

  /**
   * ✅ Clear all filters
   */
  const handleClearFilters = () => {
    setStatus("All");
    setType("All");
    setCategory("All");
  };

  const hasActiveFilters =
    status !== "All" || type !== "All" || category !== "All";

  // ✅ Loading state for user
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Unable to load user information
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // ✅ Show form view
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowForm(false)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Requests</span>
          </button>

          <RecyclableRequestForm userId={userId} onSuccess={handleFormSuccess} />
        </div>
      </div>
    );
  }

  // ✅ Show list view
  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Recyclables</h1>
            <p className="text-sm text-gray-600 mt-1">
              {recyclables.length}{" "}
              {recyclables.length === 1 ? "request" : "requests"} found
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-colors"
          >
            + New Recyclable Request
          </button>
        </header>

        {/* ✅ Filters Section (Inline Layout) */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
            {/* Status Filters */}
            <div className="md:flex-1">
              <RecyclableFilters
                activeStatus={status}
                onStatusChange={(s) =>
                  setStatus(s as RecyclableStatus | "All")
                }
              />
            </div>

            {/* Advanced Filters */}
            <div className="md:flex-1">
              <RecyclableAdvancedFilters
                selectedType={type}
                selectedCategory={category}
                onTypeChange={setType}
                onCategoryChange={setCategory}
              />
            </div>

            {/* Clear Filters */}
            <div className="md:ml-auto">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Results Section */}
        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : recyclables.length === 0 ? (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
            <p className="text-gray-500 text-lg mb-2">
              No recyclable requests found
            </p>
            <p className="text-gray-400 text-sm">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Click 'New Recyclable Request' to get started"}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recyclables.map((rec) => (
              <RecyclableCard key={rec.id} {...rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
