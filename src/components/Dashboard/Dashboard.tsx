import React, { useState, useEffect } from 'react'
import { Clock, TrendingUp, Wallet, Award, ArrowRight, Package } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'
import WithdrawalModal from './WithdrawalModal'

interface UserMiner {
  id: string
  purchase_date: string
  end_date: string
  last_drop: string | null
  total_earned: number
  drops_received: number
  active: boolean
  miners: {
    name: string
    price: number
    duration_days: number
    daily_return: number
  }
}

export default function Dashboard() {
  const { profile, refreshProfile, user } = useAuth()
  const [userMiners, setUserMiners] = useState<UserMiner[]>([])
  const [showWithdrawal, setShowWithdrawal] = useState(false)
  const [nextDrop, setNextDrop] = useState<Date | null>(null)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [timeUntilWithdrawal, setTimeUntilWithdrawal] = useState('')

  useEffect(() => {
    fetchUserMiners()
    checkWithdrawalEligibility()
  }, [profile])

  useEffect(() => {
    const timer = setInterval(() => {
      updateCountdowns()
    }, 1000)

    return () => clearInterval(timer)
  }, [userMiners, profile])

  const fetchUserMiners = async () => {
    if (!user?.uid) return

    try {
      const { data, error } = await supabase
        .from('user_miners')
        .select(`
          *,
          miners (
            name,
            price,
            duration_days,
            daily_return
          )
        `)
        .eq('user_id', user.uid)
        .eq('active', true)
        .order('purchase_date', { ascending: false })

      if (!error && data) {
        setUserMiners(data)
        calculateNextDrop(data)
      }
    } catch (error) {
      console.error('Error fetching user miners:', error)
    }
  }

  const calculateNextDrop = (miners: UserMiner[]) => {
    if (miners.length === 0) return

    const now = new Date()
    let earliestDrop: Date | null = null

    miners.forEach(miner => {
      const endDate = new Date(miner.end_date)
      if (now >= endDate) return // Miner has ended

      let nextDropTime: Date

      if (miner.last_drop) {
        // Calculate next drop (12 hours after last drop)
        nextDropTime = new Date(new Date(miner.last_drop).getTime() + 12 * 60 * 60 * 1000)
      } else {
        // First drop is 12 hours after purchase
        nextDropTime = new Date(new Date(miner.purchase_date).getTime() + 12 * 60 * 60 * 1000)
      }

      if (!earliestDrop || nextDropTime < earliestDrop) {
        earliestDrop = nextDropTime
      }
    })

    setNextDrop(earliestDrop)
  }

  const checkWithdrawalEligibility = () => {
    if (!profile) return

    const accountAge = new Date().getTime() - new Date(profile.created_at || new Date()).getTime()
    const fortyEightHours = 48 * 60 * 60 * 1000

    setCanWithdraw(accountAge >= fortyEightHours)
  }

  const updateCountdowns = () => {
    if (!profile) return

    // Update withdrawal countdown
    const accountCreated = new Date(profile.created_at || new Date()).getTime()
    const fortyEightHours = 48 * 60 * 60 * 1000
    const eligibleTime = accountCreated + fortyEightHours
    const now = new Date().getTime()

    if (now < eligibleTime) {
      const timeLeft = eligibleTime - now
      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      setTimeUntilWithdrawal(`${hours}h ${minutes}m`)
    } else {
      setTimeUntilWithdrawal('')
      setCanWithdraw(true)
    }
  }

  const getNextDropCountdown = () => {
    if (!nextDrop) return ''

    const now = new Date().getTime()
    const dropTime = nextDrop.getTime()
    
    if (now >= dropTime) return 'Processing...'

    const timeLeft = dropTime - now
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getMinerProgress = (miner: UserMiner) => {
    const totalDrops = miner.miners.duration_days * 2 // 2 drops per day
    const progress = (miner.drops_received / totalDrops) * 100
    return Math.min(progress, 100)
  }

  const getTotalPotentialEarnings = () => {
    return userMiners.reduce((total, miner) => {
      const totalPossibleEarnings = miner.miners.price * 1.9 // 190%
      return total + totalPossibleEarnings
    }, 0)
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p className="text-2xl font-bold text-gray-900">₦{profile.balance?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-mining-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">₦{profile.total_invested?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">₦{profile.total_earned?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Next Drop</p>
              <p className="text-lg font-bold text-gray-900">
                {nextDrop ? getNextDropCountdown() : 'No active miners'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Withdraw Funds</h3>
            <p className="text-sm text-gray-500 mt-1">
              {canWithdraw 
                ? 'You can now withdraw your earnings' 
                : `Withdrawals available in ${timeUntilWithdrawal}`}
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawal(true)}
            disabled={!canWithdraw || profile.balance === 0}
            disabled={!canWithdraw || (profile?.balance || 0) === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Withdraw
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        {!canWithdraw && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm">
              New accounts must wait 48 hours before their first withdrawal for security purposes.
            </p>
          </div>
        )}
      </div>

      {/* Active Miners */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Miners</h3>
          <p className="text-sm text-gray-500 mt-1">Track your mining progress</p>
        </div>
        
        {userMiners.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Miners</h4>
              <p className="text-sm">Purchase your first miner to start earning!</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-6">
              {userMiners.map((miner) => (
                <div key={miner.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{miner.miners.name}</h4>
                    <span className="text-sm text-gray-500">
                      ₦{miner.miners.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {miner.drops_received}/{miner.miners.duration_days * 2} drops
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-mining-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getMinerProgress(miner)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Earned: ₦{miner.total_earned.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      Ends: {new Date(miner.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showWithdrawal && (
        <WithdrawalModal
          onClose={() => setShowWithdrawal(false)}
          onSuccess={() => {
            setShowWithdrawal(false)
            refreshProfile()
          }}
        />
      )}
    </div>
  )
}