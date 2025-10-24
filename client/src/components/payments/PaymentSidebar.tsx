"use client";

import React, { useEffect, useState } from "react";

type Card = {
  id: string;
  brand?: string;
  last4: string;
  name?: string;
  exp?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  cards?: Card[];
  selectedCardId?: string | null;
  onSelectCard: (cardId: string) => void;
  onAddCard: (card: Card) => void;
  onProcessPayment: () => Promise<void>;
  isProcessing?: boolean;
  paymentAmount?: number;
}

const PaymentSidebar: React.FC<Props> = ({
  open,
  onClose,
  userId,
  cards = [],
  selectedCardId,
  onSelectCard,
  onAddCard,
  onProcessPayment,
  isProcessing = false,
  paymentAmount = 0,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardOnName, setCardOnName] = useState("");
  const [localCards, setLocalCards] = useState<Card[]>(cards || [])
  const [loadingCards, setLoadingCards] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!open) return
    // fetch user cards when sidebar opens
    const fetchCards = async () => {
      if (!userId) return
      setLoadingCards(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/user-card-details/details/${userId}`)
        const body = await res.json()
        // expected body.message.data => array
        if (body?.message?.success === false) {
          const details = body?.message?.error?.details || body?.message?.message || 'Failed to load cards'
          setMessage(String(details))
          setMessageType('error')
        } else {
          const data = body?.message?.data || []
          const mapped: Card[] = data.map((it: any) => ({
            id: it.card_id,
            last4: (it.card_number + '').slice(-4),
            name: it.card_holder_name || '',
            brand: it.card_brand || 'card',
          }))
          setLocalCards(mapped)
          // clear previous messages when load succeeds
          setMessage(null)
          setMessageType(null)
        }
      } catch (err) {
        console.error(err)
        setMessage('Failed to load cards')
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCards()
  }, [open, userId])

  console.log('PaymentSidebar - localCards:', localCards);

  const handleAddCard = async () => {
    setMessage(null)
    if (!userId) {
      setMessage('User not available')
      setMessageType('error')
      return
    }
    const payload = {
      user_id: userId,
      cvc,
      card_number: cardNumber,
      holder_name: cardOnName,
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/user-card-details/add-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      // API returns message.success true/false
      if (body?.message?.success === false) {
        // show error -> details
        const details = body?.message?.error?.details || body?.message?.error?.message || body?.message?.message
        setMessage(String(details))
        setMessageType('error')
        return
      }

      // success: map returned data and insert
      const inserted = body?.message?.data?.[0]
      if (inserted) {
        const newCard: Card = {
          id: inserted.card_id,
          last4: (inserted.card_number + '').slice(-4),
          name: inserted.card_holder_name || '',
          brand: inserted.card_brand || 'card',
        }
        // update local list and notify parent
        setLocalCards((c) => [newCard, ...c])
        onAddCard(newCard)
        setMessage(String(body?.message?.message || 'Card added'))
        setMessageType('success')
        // reset form
        setCardNumber("");
        setCvc("");
        setCardOnName("");
      } else {
        setMessage('Added but no card data returned')
        setMessageType('error')
      }
    } catch (err) {
      console.error(err)
      setMessage('Failed to add card')
      setMessageType('error')
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 font-poppins bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white px-5 py-4">
          <h3 className="text-lg font-semibold">Payment Options</h3>
        </div>

        <div className="flex-1 overflow-auto space-y-4">
          <section>
            <h4 className="mb-2 font-poppins text-green-900 font-semibold">Your cards</h4>
            <div className="space-y-2">
              {localCards.length === 0 && <div className="text-sm text-gray-500">No cards added.</div>}
              {localCards.map((c) => {
                const selected = selectedCardId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCard(c.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border ${selected ? 'border-green-600 bg-green-50' : 'border-gray-200'} text-left`}
                    aria-pressed={selected}
                  >
                    <div>
                      <div className="text-sm font-medium font-poppins mb-1">{c.name || 'Card'}</div>
                      <div className="text-xs text-gray-600 font-poppins">•••• {c.last4}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-poppins">{c.brand}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pt-4 border-t border-t-zinc-300">
            <div className="flex items-center justify-between">
              {!showAddForm ? (
                // full-width clickable header to reveal the form
                <button
                  type="button"
                  onClick={() => { setShowAddForm(true); setMessage(null); setMessageType(null); }}
                  className="w-full text-left p-2 rounded hover:bg-zinc-50 flex items-center justify-between"
                  aria-expanded={showAddForm}
                >
                  <span className="mb-0 font-poppins font-semibold text-green-900">Add new card</span>
                  <span className="text-sm text-blue-600 font-poppins">Tap to add</span>
                </button>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <h4 className="mb-0 font-poppins font-semibold text-green-900">Add new card</h4>
                  <button
                    type="button"
                    className="text-sm text-gray-600 underline font-poppins"
                    onClick={() => { setShowAddForm(false); setCardNumber(''); setCvc(''); setCardOnName(''); setMessage(null); setMessageType(null); }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {showAddForm && (
              <div className="space-y-2 mt-2">
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number"
                  className="w-full p-2 border rounded font-poppins placeholder:text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="p-2 border rounded font-poppins placeholder:text-sm"
                  />
                  <input
                    value={cardOnName}
                    onChange={(e) => setCardOnName(e.target.value)}
                    placeholder="Name on card"
                    className="p-2 border rounded font-poppins placeholder:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                      onClick={handleAddCard}
                      className="px-4 py-2 text-white rounded bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-poppins text-sm"
                      disabled={!cardNumber || !cvc || !cardOnName}
                  >
                      Add Card
                  </button>
                </div>
                {message && (
                  <div
                    role="status"
                    className={`text-sm text-center font-poppins border-[1px] rounded-lg h-[46px] flex items-center justify-center mt-4 ${messageType === 'success' ? 'text-green-800 bg-green-100 border-green-200' : 'text-red-800 bg-red-100 border-red-200'}`}
                  >
                    {message}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="pt-4 border-t border-t-zinc-300">
          <div className="mb-5 text-sm text-gray-700 font-poppins">Amount: Rs. <span className="font-semibold text-[18px]">{paymentAmount?.toFixed(2)}</span></div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded font-poppins"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onProcessPayment}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 font-poppins"
              disabled={isProcessing || !selectedCardId}
            >
              {isProcessing ? 'Processing...' : 'Process payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSidebar;
