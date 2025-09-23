import React, { useState } from 'react'
import { X, CreditCard, Banknote } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

declare global {
  interface Window {
    Korapay: any
  }
}

interface TopUpModalProps {
  onClose: () => void
}

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [loading, setLoading] = useState(false)

  const presetAmounts = [1000, 5000, 10000, 20000, 50000, 100000]

  const getSelectedAmount = () => {
    return useCustom ? parseFloat(customAmount) || 0 : parseFloat(amount) || 0
  }

  const handlePayment = async () => {
    if (!user || !profile) return

    const paymentAmount = getSelectedAmount()
    if (paymentAmount < 100) {
      alert('Minimum top-up amount is ₦100')
      return
    }

    setLoading(true)

    try {
      // Initialize Korapay payment
      if (typeof window !== 'undefined' && window.Korapay) {
        window.Korapay.initialize({
          key: 'pk_test_your_korapay_public_key_here', // Replace with actual key
          reference: `remo_${user.id}_${Date.now()}`,
          amount: paymentAmount,
          currency: 'NGN',
          customer: {
            name: profile.full_name || profile.email,
            email: profile.email
          },
          notification_url: `${window.location.origin}/api/korapay/webhook`,
          redirect_url: `${window.location.origin}/dashboard`,
          onClose: () => {
            setLoading(false)
          },
          onSuccess: (data: any) => {
            console.log('Payment successful:', data)
            // The webhook will handle crediting the account
            refreshProfile()
            onClose()
          },
          onFailed: (data: any) => {
            console.log('Payment failed:', data)
            setLoading(false)
            alert('Payment failed. Please try again.')
          }
        })
      } else {
        // Fallback for development - simulate successful payment
        console.log('Korapay not loaded, simulating payment...')
        
        // In production, this would be handled by webhook
        // For demo purposes, we'll directly credit the account
        const newBalance = profile.balance + paymentAmount
        
        // This should be done via webhook in production
        // await supabase.from('users').update({ balance: newBalance }).eq('id', user.id)
        
        alert(`Demo: ₦${paymentAmount.toLocaleString()} would be added to your account`)
        setLoading(false)
        onClose()
      }
    } catch (error) {
      console.error('Payment error:', error)
      setLoading(false)
      alert('Payment initialization failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Top Up Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="bg-mining-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-mining-700 font-medium">Current Balance</span>
              <span className="text-mining-900 font-bold text-lg">
                ₦{profile?.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Amount
            </label>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset.toString())
                    setUseCustom(false)
                  }}
                  className={`p-2 text-sm rounded-md border ${
                    !useCustom && amount === preset.toString()
                      ? 'border-mining-500 bg-mining-50 text-mining-700'
                      : 'border-gray-300 hover:border-mining-300'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Custom Amount</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₦</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setUseCustom(true)
                  }}
                  onFocus={() => setUseCustom(true)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
                  placeholder="Enter amount"
                  min="100"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {getSelectedAmount() > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Top-up Amount</span>
                <span className="font-medium">₦{getSelectedAmount().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Balance</span>
                <span className="font-bold text-green-600">
                  ₦{((profile?.balance || 0) + getSelectedAmount()).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || getSelectedAmount() < 100}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {loading ? 'Processing...' : `Pay ₦${getSelectedAmount().toLocaleString()}`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment powered by Korapay. Your funds will be credited instantly.
          </p>
        </div>
      </div>
    </div>
  )
}