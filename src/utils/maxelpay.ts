import CryptoJS from 'crypto-js'

export interface MaxelPayPayload {
  orderID: string
  amount: string
  currency: string
  timestamp: string
  userName: string
  siteName: string
  userEmail: string
  redirectUrl: string
  websiteUrl: string
  cancelUrl: string
  webhookUrl: string
}

export interface MaxelPayConfig {
  environment: 'stg' | 'prod'
  apiKey: string
  secretKey: string
}

const MAXELPAY_CONFIG: MaxelPayConfig = {
  environment: 'prod',
  apiKey: 'bDRE5NEdcQ6QLKKqRAoFA0Y2CtpR1mHQ',
  secretKey: 'uoN1zghqzXf3HzuZYfRu6G8wWvALSsQ6'
}

function encryptPayload(payload: MaxelPayPayload, secretKey: string): { data: string } {
  const iv = secretKey.substring(0, 16)
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), secretKey, {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  return {
    data: encrypted.toString()
  }
}

export async function createMaxelPayOrder(
  amount: number,
  userEmail: string,
  userName: string,
  orderId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const baseUrl = window.location.origin
    
    const payload: MaxelPayPayload = {
      orderID: orderId,
      amount: amount.toString(),
      currency: 'USD',
      timestamp,
      userName,
      siteName: 'REMO Mining',
      userEmail,
      redirectUrl: `${baseUrl}/deposit/success?order=${orderId}`,
      websiteUrl: baseUrl,
      cancelUrl: `${baseUrl}/deposit/cancel?order=${orderId}`,
      webhookUrl: `${baseUrl}/api/maxelpay/webhook`
    }

    const encryptedPayload = encryptPayload(payload, MAXELPAY_CONFIG.secretKey)
    const endpoint = `https://api.maxelpay.com/v1/${MAXELPAY_CONFIG.environment}/merchant/order/checkout`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MAXELPAY_CONFIG.apiKey
      },
      body: JSON.stringify(encryptedPayload)
    })

    const result = await response.json()
    
    if (response.ok) {
      return { success: true, data: result }
    } else {
      return { success: false, error: result.message || 'Payment initialization failed' }
    }
  } catch (error) {
    console.error('MaxelPay API Error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

export function generateOrderId(): string {
  return `REMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}