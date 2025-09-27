import React, { useState } from 'react'
import { X, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import { createMaxelPayOrder, generateOrderId } from '../../utils/maxelpay'
import { useAuth } from '../../contexts/AuthContext'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user, profile } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    const depositAmount = parseFloat(amount)
    if (depositAmount < 10) {
      setError('Minimum deposit amount is $10 USDT')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderId = generateOrderId()
      const result = await createMaxelPayOrder(
        depositAmount,
        user.email || '',
        profile.full_name || 'User',
        orderId
      )

      if (result.success && result.data?.checkout_url) {
        // Redirect to MaxelPay checkout
        window.location.href = result.data.checkout_url
      } else {
        setError(result.error || 'Failed to initialize payment')
      }
    } catch (error) {
      setError('An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Deposit USDT</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDT)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="10"
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum deposit: $10 USDT</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Payment Method</h3>
            <p className="text-sm text-blue-700">
              Secure USDT deposit via MaxelPay. You'll be redirected to complete your payment.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Deposit USDT'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}