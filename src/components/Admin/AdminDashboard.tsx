import React, { useState, useEffect } from 'react'
import { Users, Package, CreditCard, Bell, Plus, Eye, Check, X, Ban, CheckCircle, MapPin } from 'lucide-react'
import { supabase } from '../../utils/supabase/client'
import CreateMinerModal from './CreateMinerModal'

interface Miner {
  id: string
  name: string
  price: number
  duration_days: number
  daily_return: number
  total_return_percentage: number
  description: string | null
  active: boolean
  created_at: string
}

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'completed' | 'rejected'
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  created_at: string
  users: {
    email: string
    full_name: string | null
  }
}

interface UserWithIP {
  id: string
  email: string
  full_name: string
  balance: number
  total_invested: number
  total_earned: number
  created_at: string
  last_login_ip?: string
  is_banned?: boolean
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserWithIP[]>([])
  const [miners, setMiners] = useState<Miner[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [showCreateMiner, setShowCreateMiner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMiners: 0,
    pendingWithdrawals: 0,
    totalInvested: 0
  })

  useEffect(() => {
    fetchStats()
    fetchMiners()
    fetchWithdrawals()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_banned: !currentBanStatus }
          : user
      ))
    } catch (error) {
      console.error('Error updating user ban status:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const [usersResult, minersResult, withdrawalsResult, investmentResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('miners').select('id', { count: 'exact' }),
        supabase.from('withdrawals').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('users').select('total_invested')
      ])

      const totalInvested = investmentResult.data?.reduce((sum, user) => sum + (user.total_invested || 0), 0) || 0

      setStats({
        totalUsers: usersResult.count || 0,
        totalMiners: minersResult.count || 0,
        pendingWithdrawals: withdrawalsResult.count || 0,
        totalInvested
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMiners = async () => {
    try {
      const { data, error } = await supabase
        .from('miners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMiners(data || [])
    } catch (error) {
      console.error('Error fetching miners:', error)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          users (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWithdrawals(data || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    }
  }

  const handleWithdrawalAction = async (withdrawalId: string, status: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', withdrawalId)

      if (error) throw error

      // Refresh withdrawals
      fetchWithdrawals()

      // Create notification
      const withdrawal = withdrawals.find(w => w.id === withdrawalId)
      if (withdrawal) {
        await supabase.from('notifications').insert({
          user_id: withdrawal.user_id,
          title: status === 'completed' ? 'Withdrawal Approved' : 'Withdrawal Rejected',
          message: status === 'completed' 
            ? `Your withdrawal of $${withdrawal.amount.toLocaleString()} USDT has been processed.`
            : `Your withdrawal request of $${withdrawal.amount.toLocaleString()} USDT has been rejected.`,
          type: status === 'completed' ? 'success' : 'error'
        })
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error)
    }
  }

  const toggleMinerStatus = async (minerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('miners')
        .update({ active: !currentStatus })
        .eq('id', minerId)

      if (error) throw error
      fetchMiners()
    } catch (error) {
      console.error('Error toggling miner status:', error)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Miners</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalMiners}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Withdrawals</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.pendingWithdrawals}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Invested</dt>
                <dd className="text-lg font-medium text-gray-900">${stats.totalInvested.toLocaleString()} USDT</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">User Management</h3>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={user.is_banned ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(user.balance || 0).toFixed(2)} USDT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(user.total_invested || 0).toFixed(2)} USDT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.last_login_ip || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleUserBan(user.id, user.is_banned || false)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          user.is_banned
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {user.is_banned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderMiners = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Manage Miners</h3>
        <button
          onClick={() => setShowCreateMiner(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Miner
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {miners.map((miner) => (
            <li key={miner.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{miner.name}</p>
                      <p className="text-sm text-gray-500">
                        ${miner.price.toLocaleString()} USDT • {miner.duration_days} days • ${miner.daily_return.toLocaleString()} USDT/drop
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        miner.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {miner.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleMinerStatus(miner.id, miner.active)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          miner.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {miner.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderWithdrawals = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Manage Withdrawals</h3>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {withdrawals.map((withdrawal) => (
            <li key={withdrawal.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {withdrawal.users?.full_name || withdrawal.users?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${withdrawal.amount.toLocaleString()} USDT • {withdrawal.bank_name} • {withdrawal.account_number}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                      {withdrawal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'completed')}
                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'miners', name: 'Miners', icon: Package },
    { id: 'withdrawals', name: 'Withdrawals', icon: CreditCard },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'miners' && renderMiners()}
        {activeTab === 'withdrawals' && renderWithdrawals()}
      </div>

      {showCreateMiner && (
        <CreateMinerModal
          onClose={() => setShowCreateMiner(false)}
          onSuccess={() => {
            setShowCreateMiner(false)
            fetchMiners()
          }}
        />
      )}
    </div>
  )
}