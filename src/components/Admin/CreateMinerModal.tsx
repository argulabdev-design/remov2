import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../utils/supabase/client'

interface CreateMinerModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateMinerModal({ onClose, onSuccess }: CreateMinerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate daily return based on 190% total return
  const calculateDailyReturn = (price: number, days: number) => {
    const totalReturn = price * 1.9 // 190%
    return totalReturn / (days * 2) // 2 drops per day
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const price = parseFloat(formData.price)
      const days = parseInt(formData.duration_days)
      const dailyReturn = calculateDailyReturn(price, days)

      const { error } = await supabase.from('miners').insert({
        name: formData.name,
        price: price,
        duration_days: days,
        daily_return: dailyReturn,
        total_return_percentage: 190,
        description: formData.description || null,
        active: true
      })

      if (error) throw error

      onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to create miner')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const price = parseFloat(formData.price) || 0
  const days = parseInt(formData.duration_days) || 0
  const dailyReturn = days > 0 ? calculateDailyReturn(price, days) : 0
  const totalReturn = price * 1.9

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Miner</h3>
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
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Miner Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="e.g., Smart Miner Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              required
              min="1"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration_days"
              required
              min="1"
              value={formData.duration_days}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mining-500 focus:border-mining-500"
              placeholder="Brief description of the miner..."
            />
          </div>

          {price > 0 && days > 0 && (
            <div className="bg-mining-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-mining-800 mb-2">Calculated Returns:</h4>
              <ul className="text-sm text-mining-700 space-y-1">
                <li>• Daily Return: ₦{dailyReturn.toLocaleString()} (2 drops)</li>
                <li>• Total Return: ₦{totalReturn.toLocaleString()}</li>
                <li>• Return Rate: 190%</li>
              </ul>
            </div>
          )}

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
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mining-600 hover:bg-mining-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Miner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}