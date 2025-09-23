import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../utils/supabase/client'

interface EmailVerificationProps {
  email: string
  onBack: () => void
}

export default function EmailVerification({ email, onBack }: EmailVerificationProps) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResendEmail = async () => {
    setResending(true)
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      setResent(true)
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mining-50 to-mining-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-mining-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              Click the link in your email to verify your account and complete registration.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              Don't see the email? Check your spam folder or wait a few minutes.
            </div>
          </div>

          <div className="pt-4 border-t">
            {resent ? (
              <p className="text-green-600 text-sm text-center">
                Verification email sent successfully!
              </p>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-mining-700 bg-mining-50 hover:bg-mining-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500 disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend verification email'}
              </button>
            )}
          </div>

          <button
            onClick={onBack}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mining-500"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}