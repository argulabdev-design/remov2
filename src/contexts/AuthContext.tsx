import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from 'firebase/auth'
import { auth } from '../utils/firebase/client'
import { supabase } from '../utils/supabase/client'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth'


interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  balance: number
  total_invested: number
  total_earned: number
  created_at: string
  last_withdrawal: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.email === 'Admin@remo.com'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        fetchUserProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        // Create profile if it doesn't exist
        const user = auth.currentUser
        if (user) {
          await createUserProfile(user)
        }
        return
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          balance: data.balance || 0,
          total_invested: data.total_invested || 0,
          total_earned: data.total_earned || 0,
          created_at: data.created_at,
          last_withdrawal: data.last_withdrawal
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const createUserProfile = async (firebaseUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || '',
          balance: 0,
          total_invested: 0,
          total_earned: 0
        })

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        // Fetch the newly created profile
        await fetchUserProfile(firebaseUser.uid)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await firebaseUpdateProfile(userCredential.user, { displayName: fullName })
      
      // Create user profile in Supabase
      await createUserProfile(userCredential.user)
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'An error occurred during sign up';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try signing in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return { error: { ...error, message: errorMessage } }
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Profile will be fetched by the auth state change listener
      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'An error occurred during sign in';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      return { error: { ...error, message: errorMessage } }
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    await firebaseUpdateProfile(user, updates)
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}