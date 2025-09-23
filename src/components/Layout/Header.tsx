import React, { useState, useEffect } from 'react'
import { Bell, User, LogOut, Pickaxe, Plus, Wallet } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase/client'
import NotificationModal from '../Dashboard/NotificationModal'
import TopUpModal from '../Dashboard/TopUpModal'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications()
      
      // Subscribe to real-time notifications
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchUnreadNotifications()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchUnreadNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false)

      if (!error) {
        setUnreadCount(data.length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-mining-500 to-mining-600 rounded-lg flex items-center justify-center mr-3">
                <Pickaxe className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">REMO</h1>
            </div>

            {/* Right side menu */}
            <div className="flex items-center space-x-4">
              {/* Balance */}
              {profile && (
                <div className="hidden sm:flex items-center bg-mining-50 px-3 py-1 rounded-lg">
                  <Wallet className="h-4 w-4 text-mining-600 mr-2" />
                  <span className="text-sm font-medium text-mining-900">
                    ₦{profile.balance.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Top Up Button */}
              <button
                onClick={() => setShowTopUp(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:block">Top Up</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5" />
                  {profile && (
                    <span className="hidden sm:block text-sm font-medium">
                      {profile.full_name || profile.email}
                    </span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{profile?.full_name}</div>
                      <div className="text-gray-500">{profile?.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close menus */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modals */}
      {showNotifications && (
        <NotificationModal
          onClose={() => {
            setShowNotifications(false)
            fetchUnreadNotifications()
          }}
        />
      )}

      {showTopUp && (
        <TopUpModal onClose={() => setShowTopUp(false)} />
      )}
    </>
  )
}