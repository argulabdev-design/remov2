import React, { useState, useEffect } from 'react'
import { Package, Clock, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'
import PurchaseMinerModal from './PurchaseMinerModal'

interface Miner {
  id: string
  name: string
  price: number
  duration_days: number
  daily_return: number
  total_return_percentage: number
  description: string | null
  active: boolean
}

export default function Miners() {
  const { profile } = useAuth()
  const [miners, setMiners] = useState<Miner[]>([])
  const [selectedMiner, setSelectedMiner] = useState<Miner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMiners()
  }, [])

  const fetchMiners = async () => {
    try {
      const { data, error } = await supabase
        .from('miners')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true })

      if (error) throw error
      setMiners(data || [])
    } catch (error) {
      console.error('Error fetching miners:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalReturn = (miner: Miner) => {
    return miner.price * (miner.total_return_percentage / 100)
  }

  const getDropsPerDay = () => 2 // Fixed at 2 drops per day (every 12 hours)

  const getRoi = (miner: Miner) => {
    return ((getTotalReturn(miner) - miner.price) / miner.price) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mining-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Miner</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from our range of high-performance mining packages. Each miner guarantees 190% total returns 
          with earnings delivered every 12 hours.
        </p>
      </div>

      {/* Miners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {miners.map((miner) => (
          <div
            key={miner.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-mining-500 to-mining-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{miner.name}</h3>
                <Package className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold">₦{miner.price.toLocaleString()}</div>
              <p className="text-mining-100 text-sm mt-1">Initial Investment</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {miner.description && (
                <p className="text-gray-600 text-sm mb-4">{miner.description}</p>
              )}

              {/* Key Metrics */}
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
                  <span className="font-medium text-green-600">
                    ₦{getTotalReturn(miner).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ROI Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 text-sm font-medium">ROI</span>
                  <span className="text-green-600 font-bold">+{getRoi(miner).toFixed(0)}%</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-mining-500 rounded-full mr-2"></div>
                  {getDropsPerDay()} drops daily (every 12 hours)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-mining-500 rounded-full mr-2"></div>
                  Guaranteed 190% total return
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-mining-500 rounded-full mr-2"></div>
                  Automatic earnings distribution
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => setSelectedMiner(miner)}
                disabled={!profile || profile.balance < miner.price}
                className="w-full bg-mining-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-mining-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {!profile ? 'Sign In Required' :
                 profile.balance < miner.price ? 'Insufficient Balance' :
                 'Purchase Miner'}
              </button>

              {profile && profile.balance < miner.price && (
                <p className="text-red-500 text-xs mt-2 text-center">
                  Need ₦{(miner.price - profile.balance).toLocaleString()} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedMiner && (
        <PurchaseMinerModal
          miner={selectedMiner}
          onClose={() => setSelectedMiner(null)}
          onSuccess={() => {
            setSelectedMiner(null)
            // Optionally refresh miners or show success message
          }}
        />
      )}
    </div>
  )
}