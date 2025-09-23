import React, { useState } from 'react'
import { X, Package, Clock, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'

interface Miner {
  id: string
  name: string
  price: number
  duration_days: number
  daily_return: number
  total_return_percentage: number
  description: string | null
}

interface PurchaseMinerModalProps {
  miner: Miner
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseMinerModal({ miner, onClose, onSuccess }: PurchaseMinerModalProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getTotalReturn = () => {
    return miner.price * (miner.total_return_percentage / 100)
  }

  const getProfit = () => {
    return getTotalReturn() - miner.price
  }

  const handlePurchase = async () => {
    if (!user || !profile) return

    if (profile.balance < miner.price) {
      setError('Insufficient balance')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Calculate end date
      const purchaseDate = new Date()
      const endDate = new Date(purchaseDate.getTime() + miner.duration_days * 24 * 60 * 60 * 1000)

      // Start transaction
      const { error: purchaseError } = await supabase.from('user_miners').insert({
        user_id: user.id,
        miner_id: miner.id,
        purchase_date: purchaseDate.toISOString(),
        end_date: endDate.toISOString(),
        active: true
      })

      if (purchaseError) throw purchaseError

      // Update user balance and investment
      const newBalance = profile.balance - miner.price
      const newTotalInvested = profile.total_invested + miner.price

      const { error: balanceError } = await supabase
        .from('users')
        .update({
          balance: newBalance,
          total_invested: newTotalInvested
        })
        .eq('id', user.id)

      if (balanceError) throw balanceError

      // Create success notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Miner Purchased Successfully!',
        message: `You have successfully purchased ${miner.name} for ₦${miner.price.toLocaleString()}. Your first earnings will be credited in 12 hours.`,
        type: 'success'
      })

      // Refresh profile to get updated balance
      await refreshProfile()

      onSuccess()
    } catch (error: any) {
      console.error('Purchase error:', error)
      setError(error.message || 'Failed to purchase miner. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirm Purchase</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Miner Details */}
        <div className="bg-gradient-to-r from-mining-500 to-mining-600 text-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold">{miner.name}</h4>
            <Package className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">₦{miner.price.toLocaleString()}</div>
        </div>

        {/* Purchase Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Duration</span>
            </div>
            <span className="font-medium">{miner.duration_days} days</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm">Per Drop</span>
            </div>
            <span className="font-medium">₦{miner.daily_return.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="text-sm">Total Return</span>
            </div>
            <span className="font-medium text-green-600">₦{getTotalReturn().toLocaleString()}</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Your Profit</span>
              <span className="text-green-600">₦{getProfit().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Balance</span>
            <span className="font-medium">₦{profile?.balance.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">After Purchase</span>
            <span className={`font-medium ${
              (profile?.balance || 0) >= miner.price ? 'text-green-600' : 'text-red-600'
            }`}>
              ₦{((profile?.balance || 0) - miner.price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || !profile || profile.balance < miner.price}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mining-600 hover:bg-mining-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}