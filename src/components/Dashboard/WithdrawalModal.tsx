import React, { useState } from 'react'
import { X, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'

interface WithdrawalModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function WithdrawalModal({ onClose, onSuccess }: WithdrawalModalProps) {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    const amount = parseFloat(formData.amount)
    
    if (amount < 1000) {
      setError('Minimum withdrawal amount is ₦1,000')
      return
    }

    if (amount > profile.balance) {
      setError('Insufficient balance')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: amount,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
        status: 'pending'
      })

      if (withdrawalError) throw withdrawalError

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request of ₦${amount.toLocaleString()} has been submitted and is being processed.`,
        type: 'info'
      })

      onSuccess()
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      setError(error.message || 'Failed to submit withdrawal request')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Withdraw Funds</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Available Balance */}
          <div className="bg-mining-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-mining-700 font-medium">Available Balance</span>
              <span className="text-mining-900 font-bold text-lg">
                ₦{profile?.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Withdrawal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₦</span>
              <input
                type="number"
                name="amount"
                required
                min="1000"
                max={profile?.balance}
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
                placeholder="Enter amount"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ₦1,000</p>
          </div>

          {/* Bank Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              required
              value={formData.bankName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="e.g., First Bank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              required
              pattern="[0-9]{10}"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="10-digit account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              name="accountName"
              required
              value={formData.accountName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="Account holder name"
            />
          </div>

          {/* Processing Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 mr-2" />
              <div className="text-yellow-800 text-sm">
                <p className="font-medium">Processing Time</p>
                <p>Withdrawals are processed within 24-48 hours during business days.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}