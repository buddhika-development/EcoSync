import React from 'react'

type Details = {
  collection_count?: number
  collection_cost?: number
  tax?: number
  total_cost?: number
}

interface Props {
  title: string
  details?: Details
  className?: string
}

const PaymentDetailsCard: React.FC<Props> = ({ title, details = {}, className = '' }) => {
  const count = details.collection_count ?? 0
  const cost = details.collection_cost ?? 0
  const tax = details.tax ?? 0
  const total = details.total_cost ?? 0

  return (
    <div className={`bg-white text-gray-800 shadow-md rounded-xl p-6 mb-6 border border-gray-100 font-poppins ${className}`}>
      <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-800">
        {title}
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Collection Count</span>
          <span className="font-medium">{count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Collection Cost</span>
          <span className="font-medium">Rs. {cost}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">Rs. {tax}</span>
        </div>
        <div className="flex justify-between border-t border-t-zinc-300 pt-3">
          <span className="text-gray-600 font-semibold">Total Cost</span>
          <span className="font-semibold text-green-600">Rs. {total}</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailsCard