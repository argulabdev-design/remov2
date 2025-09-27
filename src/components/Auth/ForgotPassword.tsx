import React, { useState } from 'react'
import { ArrowLeft, MessageCircle, ExternalLink } from 'lucide-react'

interface ForgotPasswordProps {
  onBack: () => void
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const telegramHelpUrl = 'https://t.me/remo_support'

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Request Received
            </h2>
            
            <p className="text-gray-600 mb-6">
              For security reasons, password resets are handled manually by our support team.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Next Steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 text-left space-y-2">
                <li>1. Contact our Telegram support</li>
                <li>2. Provide your registered email: <strong>{email}</strong></li>
                <li>3. Verify your identity</li>
                <li>4. Receive your new password</li>
              </ol>
            </div>
            
            <a
              href={telegramHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Telegram Support
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
            
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll help you reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Manual Password Reset</p>
                <p className="text-yellow-700">
                  For security, password resets are handled by our support team via Telegram.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Request Password Reset
          </button>
        </form>
      </div>
    </div>
  )
}