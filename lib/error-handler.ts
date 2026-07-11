export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[v0] Unhandled promise rejection:', event.reason)
    // Prevent the default browser behavior of showing the error
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[v0] Uncaught error:', event.error)
  })
}
