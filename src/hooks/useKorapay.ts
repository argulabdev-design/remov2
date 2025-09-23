import { useEffect, useState } from 'react'
import { loadKorapayScript, initializeKorapay, KorapayConfig } from '../utils/korapay'

export const useKorapay = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadScript = async () => {
      if (typeof window !== 'undefined' && (window as any).Korapay) {
        setIsLoaded(true)
        return
      }

      setIsLoading(true)
      try {
        await loadKorapayScript()
        setIsLoaded(true)
        setError(null)
      } catch (err) {
        setError('Failed to load Korapay SDK')
        console.error('Korapay loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadScript()
  }, [])

  const initializePayment = (config: KorapayConfig) => {
    if (!isLoaded) {
      throw new Error('Korapay SDK not loaded yet')
    }

    try {
      initializeKorapay(config)
    } catch (err) {
      console.error('Payment initialization error:', err)
      throw err
    }
  }

  return {
    isLoaded,
    isLoading,
    error,
    initializePayment
  }
}