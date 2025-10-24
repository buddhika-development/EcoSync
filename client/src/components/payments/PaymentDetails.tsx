"use client";

import React, { useEffect, useState } from "react";
import PaymentDetailsCard from "./PaymentDetailsCard";
import { BeatLoader } from "react-spinners";

type CostDetails = {
  collection_count?: number
  collection_cost?: number
  tax?: number
  total_cost?: number
}

type PaymentDetailsData = {
  waste_collection_cost: CostDetails
  recycle_collection_cost: CostDetails
}

type RecyclePoints = {
  recycle_coin_balance?: number
}

const PaymentDetails: React.FC = () => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recyclePoints, setRecyclePoints] = useState<RecyclePoints | null>(null);

  const [isRecycleCoinUsed, setIsRecycleCoinUsed] = useState(false);
  const [usedRecycleCoinAmount, setUsedRecycleCoinAmount] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [originalPaymentAmount, setOriginalPaymentAmount] = useState(0);
  const [recycleCoinAmount, setRecycleCoinAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
  const recycleCoinValue = 3.5;
  const userId = "2510c54b-9573-4ef9-a3a9-94935408f01c";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentRes, pointRes] = await Promise.all([
          fetch(`${baseUrl}/api/costs/calculate_cost/${userId}`),
          fetch(`${baseUrl}/api/recycle_coin/user/recycle-coin/${userId}`),
        ]);

        const [paymentData, pointData] = await Promise.all([
          paymentRes.json(),
          pointRes.json(),
        ]);

        const payment = Number(paymentData?.message?.data?.total_cost ?? 0);
        const coinBalance = Number(
          pointData?.message?.data?.recycle_coin_balance ?? 0
        );

  setPaymentDetails((paymentData?.message?.data ?? null) as PaymentDetailsData | null);
  setRecyclePoints((pointData?.message?.data ?? null) as RecyclePoints | null);
        setPaymentAmount(payment);
        setOriginalPaymentAmount(paymentData?.message?.data?.total_cost ?? 0);
        setRecycleCoinAmount(coinBalance);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number | string | undefined | null) => {
    const v = Number(value ?? 0);
    return v.toFixed(2);
  };

  const handleRecycleCoinUsage = () => {
    if (isRecycleCoinUsed) {
      setPaymentAmount(Number(originalPaymentAmount));
      setUsedRecycleCoinAmount(0);
      setIsRecycleCoinUsed(false);
      return;
    }

    const availableCoins = Number(recycleCoinAmount ?? 0);
    if (availableCoins <= 0) {
      window.alert("You have no recycle coins to use.");
      return;
    }

    const totalCoinValue = availableCoins;
    const original = Number(originalPaymentAmount ?? paymentAmount ?? 0);

    if (totalCoinValue >= original) {
      const coinsNeeded = Math.ceil(original - recycleCoinValue);
      setUsedRecycleCoinAmount(coinsNeeded);
      setPaymentAmount(0);
    } else {
      setUsedRecycleCoinAmount(availableCoins);
      const remaining = original - totalCoinValue;
      setPaymentAmount(Number(remaining.toFixed(2)));
    }

    setIsRecycleCoinUsed(true);
  };


  // handle payment actions
  // if there have use any recycle coin it need to update in the database using an api call
  // if payment amount is have still it need to reduce using payment gateway
  const handlePaymentAction = async() => {
    setIsProcessing(true)
    try {
      // If the user opted to use recycle coins, update the recycle coin balance first
      if (isRecycleCoinUsed) {
        // Only call recycle coin API when some coins are being used
        alert(`Using ${usedRecycleCoinAmount} recycle coins towards payment.`)
        if (usedRecycleCoinAmount > 0) {
          const recycle_coin_payload = {
            user_id: userId,
            transaction_type: 'spend',
            amount: usedRecycleCoinAmount
          }

          const recycleRes = await fetch(`${baseUrl}/api/recycle_coin/update-recycle-coin-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recycle_coin_payload)
          })

          if (!recycleRes.ok) {
            // Try to surface server error message if available
            let errText = 'Failed to update recycle coin balance.'
            try { const errBody = await recycleRes.json(); errText = errBody?.message || errText } catch (e) {}
            alert(errText)
            return
          }

          const recycleData = await recycleRes.json()
          console.log('Recycle Coin Update Response:', recycleData)
        } else {
          // No coins to update
          console.log('No recycle coins to update')
        }

        // If there's still a payment amount remaining, create a bank transaction
        if (paymentAmount > 0) {
          const payment_payload = {
            user_id: userId,
            transaction_amount: Number(paymentAmount)
          }

          const paymentRes = await fetch(`${baseUrl}/api/transaction/new-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment_payload)
          })

          if (!paymentRes.ok) {
            let errText = 'Failed to create transaction.'
            try { const errBody = await paymentRes.json(); errText = errBody?.message || errText } catch (e) {}
            alert(errText)
            return
          }

          const paymentData = await paymentRes.json()
          console.log('Payment Transaction Response:', paymentData)
          alert('Payment and recycle coin usage processed successfully.')
          return
        }

        // If we reached here, recycle coins were used and no additional payment required
        alert(`Recycle coin usage processed: ${usedRecycleCoinAmount} coins.`)
        return
      }

      // If recycle coins were not used, and there's an amount to pay, call the transaction API
      if (!isRecycleCoinUsed && paymentAmount > 0) {
        const payment_payload = {
          user_id: userId,
          transaction_amount: Number(paymentAmount)
        }

        const paymentRes = await fetch(`${baseUrl}/api/transaction/new-transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment_payload)
        })

        if (!paymentRes.ok) {
          let errText = 'Failed to create transaction.'
          try { const errBody = await paymentRes.json(); errText = errBody?.message || errText } catch (e) {}
          alert(errText)
          return
        }

        const paymentData = await paymentRes.json()
        console.log('Payment Transaction Response:', paymentData)
        alert('Payment processed successfully.')
        return
      }

      // Nothing to do: no recycle coin usage and no payment amount
      alert('No payment or recycle coin usage to process.')
    } catch (err) {
      console.error(err)
      alert('An unexpected error occurred while processing payment.')
    } finally {
      setIsProcessing(false)
    }
  };

  const wasteCollectionCost = Number(
    paymentDetails?.waste_collection_cost?.collection_cost ?? 0
  );
  const recycleCollectionCost = Number(
    paymentDetails?.recycle_collection_cost?.collection_cost ?? 0
  );
  const wasteTax = Number(paymentDetails?.waste_collection_cost?.tax ?? 0);
  const recycleTax = Number(paymentDetails?.recycle_collection_cost?.tax ?? 0);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-xl p-8 border-[1px] border-green-700 border-dashed">
        {isLoading ? (
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
        ) : paymentDetails ? (
          <div className="space-y-8">
            <div className="text-center bg-gradient-to-r from-green-600 to-green-700 font-poppinstext-white rounded-2xl p-6 shadow-md">
              <h1 className="text-3xl font-bold">Billing Details</h1>
              <p className="text-white/90 mt-2 font-poppins">View and manage your payment information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PaymentDetailsCard
                  title="Waste Collection Costs"
                  details={paymentDetails?.waste_collection_cost}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm"
                />
                <PaymentDetailsCard
                  title="Recycle Collection Costs"
                  details={paymentDetails?.recycle_collection_cost}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm"
                />
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
                <div className="space-y-6 mt-8">
                  <div className="grid grid-cols-2 gap-6">
                    <span className="text-gray-700 font-medium font-poppins">Waste Collection Cost</span>
                    <span className="text-right font-semibold text-gray-800 font-poppins">
                      Rs. {formatCurrency(wasteCollectionCost)}
                    </span>
                    <span className="text-gray-700 font-medium font-poppins">Recycle Collection Cost</span>
                    <span className="text-right font-semibold text-gray-800 font-poppins">
                      Rs. {formatCurrency(recycleCollectionCost)}
                    </span>
                    <span className="text-gray-700 font-medium font-poppins">Total Taxes</span>
                    <span className="text-right font-semibold text-gray-800 font-poppins">
                      Rs. {formatCurrency(wasteTax + recycleTax)}
                    </span>
                  </div>
                  <div className="border-t pt-6 text-center">
                    <p className="text-xl text-gray-700 font-medium font-poppins">Total Amount Due</p>
                    <p className="text-4xl font-bold text-green-600 mt-2 font-poppins">
                      Rs. {formatCurrency(paymentAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                  <button
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 font-poppins ${
                      recycleCoinAmount <= 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isRecycleCoinUsed
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } shadow-md hover:shadow-lg`}
                    onClick={handleRecycleCoinUsage}
                    disabled={recycleCoinAmount <= 0 || isProcessing}
                    title={
                      recycleCoinAmount <= 0
                        ? "No recycle coins available"
                        : "Use recycle coins"
                    }
                  >
                    {isProcessing ? (
                      <>
                        Processing...
                        <span className="text-sm"> ({formatCurrency(recycleCoinAmount - usedRecycleCoinAmount)} coins left)</span>
                      </>
                    ) : isRecycleCoinUsed ? (
                      "Remove Recycle Coins"
                    ) : (
                      <>
                        Use Recycle Coins
                        <span className="text-sm"> ({formatCurrency(recycleCoinAmount - usedRecycleCoinAmount)} coins left)</span>
                      </>
                    )}
                  </button>
                  <button
                    className="w-full font-poppins py-3 px-6 bg-green-600 hover:bg-green-700 text-white  rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={handlePaymentAction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <BeatLoader size={12} color="#ffffff" /> : 'Pay Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No payment details available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;