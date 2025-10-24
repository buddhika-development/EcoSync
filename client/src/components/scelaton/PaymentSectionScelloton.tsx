import React from "react";

const PaymentSectionScelloton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="h-12 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="flex justify-center space-x-4">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
};

export default PaymentSectionScelloton;
