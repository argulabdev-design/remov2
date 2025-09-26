import React, { useState } from 'react'
import { User, Mail, Calendar, Wallet, TrendingUp, Award, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'

export default function Profile() {
  const { profile, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setError('')

    try {
      // Update Firebase profile
      await updateProfile({
        full_name: formData.full_name
      })
      
      // Update Supabase profile
      const { error: supabaseError } = await supabase
        .from('users')
        .update({ full_name: formData.full_name })
        .eq('id', profile.id)
      
      if (supabaseError) {
        throw supabaseError
      }
      
      setEditing(false)
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || ''
    })
    setEditing(false)
    setError('')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mining-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-mining-600 text-white rounded-lg hover:bg-mining-700 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-mining-500 focus:border-mining-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-mining-600 text-white rounded-md hover:bg-mining-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {profile.full_name || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.created_at || new Date()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="font-medium text-gray-900">₦{profile.balance?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-mining-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Invested</p>
                  <p className="font-medium text-gray-900">₦{profile.total_invested?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="font-medium text-gray-900">₦{profile.total_earned?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-900">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">₦{profile.balance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-mining-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-mining-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-mining-900">Total Invested</p>
                <p className="text-2xl font-bold text-mining-600">₦{profile.total_invested?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-900">Total Earned</p>
                <p className="text-2xl font-bold text-yellow-600">₦{profile.total_earned?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {(profile.total_invested || 0) > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Return on Investment (ROI)</span>
              <span className="text-lg font-bold text-green-600">
                +{(((profile.total_earned || 0) / (profile.total_invested || 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Withdrawal</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account Age</span>
            <span className="text-sm font-medium">
              {Math.floor((new Date().getTime() - new Date(profile.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Withdrawal Status</span>
            <span className={`text-sm font-medium ${
              (new Date().getTime() - new Date(profile.created_at || new Date()).getTime()) >= (48 * 60 * 60 * 1000)
                ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {(new Date().getTime() - new Date(profile.created_at || new Date()).getTime()) >= (48 * 60 * 60 * 1000)
                ? 'Enabled' : 'Pending (48hr wait)'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Withdrawal</span>
            <span className="text-sm font-medium">
              {profile.last_withdrawal 
                ? new Date(profile.last_withdrawal).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}