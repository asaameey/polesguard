'use client'

import { useEffect } from 'react'

export function ErrorHandlerClient() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[v0] Unhandled promise rejection:', event.reason)
      event.preventDefault()
    }

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('[v0] Uncaught error:', event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}
