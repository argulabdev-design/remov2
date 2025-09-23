// Korapay integration utilities
export interface KorapayConfig {
  key: string
  reference: string
  amount: number
  currency: string
  customer: {
    name: string
    email: string
  }
  notification_url?: string
  redirect_url?: string
  onClose?: () => void
  onSuccess?: (data: any) => void
  onFailed?: (data: any) => void
}

export const initializeKorapay = (config: KorapayConfig) => {
  if (typeof window !== 'undefined' && (window as any).Korapay) {
    (window as any).Korapay.initialize(config)
  } else {
    console.error('Korapay SDK not loaded')
    throw new Error('Korapay SDK not available')
  }
}

export const loadKorapayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).Korapay) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://korapay.com/korapay.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Korapay SDK'))
    
    document.head.appendChild(script)
  })
}

// Webhook handler types for backend integration
export interface KorapayWebhookData {
  event: string
  data: {
    reference: string
    amount: number
    currency: string
    status: string
    customer: {
      name: string
      email: string
    }
    created_at: string
    updated_at: string
  }
}

export const verifyKorapayWebhook = (payload: string, signature: string, secret: string): boolean => {
  // In a real implementation, you would verify the webhook signature
  // using the secret key provided by Korapay
  const crypto = require('crypto')
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return hash === signature
}