import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import AdminAccessCode from './components/Admin/AdminAccessCode'
import AdminDashboard from './components/Admin/AdminDashboard'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import Dashboard from './components/Dashboard/Dashboard'
import Miners from './components/Dashboard/Miners'
import NotificationModal from './components/Dashboard/NotificationModal'
import Profile from './components/Dashboard/Profile'
import Settings from './components/Dashboard/Settings'

function AppContent() {
  const { user, profile, loading, isAdmin } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAdminAccess, setShowAdminAccess] = useState(false)
  const [adminAccessGranted, setAdminAccessGranted] = useState(false)

  // Handle admin login flow
  React.useEffect(() => {
    if (isAdmin && !adminAccessGranted) {
      setShowAdminAccess(true)
    }
  }, [isAdmin, adminAccessGranted])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mining-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading REMO...</p>
        </div>
      </div>
    )
  }

  // Show admin access code screen
  if (showAdminAccess && isAdmin && !adminAccessGranted) {
    return (
      <AdminAccessCode
        onAccessGranted={() => {
          setAdminAccessGranted(true)
          setShowAdminAccess(false)
        }}
        onBack={() => {
          setShowAdminAccess(false)
          // This would sign out the admin user
        }}
      />
    )
  }

  // Show admin dashboard
  if (isAdmin && adminAccessGranted) {
    return <AdminDashboard />
  }

  // Show auth screens for non-authenticated users
  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthMode('login')} />
    )
  }

  // Main app for regular users
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'miners':
        return <Miners />
      case 'notifications':
        return <NotificationModal onClose={() => setActiveTab('dashboard')} />
      case 'profile':
        return <Profile />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App