import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

const IDLE_TIMEOUT = 60 * 60 * 1000 // 1 minute in milliseconds

// Custom event for session timeout
const SESSION_TIMEOUT_EVENT = 'session_timeout'

export function useIdleTimeout() {
  const timeoutId = useRef<number | undefined>(undefined)
  const resetAuth = useAuthStore((state) => state.auth.reset)

  const handleTimeout = () => {
    resetAuth()
    localStorage.clear() // Clear all localStorage data
    toast.error('Session expired due to inactivity!')

    // Dispatch a custom event that will be handled by the router
    window.dispatchEvent(new CustomEvent(SESSION_TIMEOUT_EVENT))
  }

  const resetTimer = () => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      handleTimeout()
      return
    }

    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current)
    }
    timeoutId.current = window.setTimeout(handleTimeout, IDLE_TIMEOUT)
  }

  useEffect(() => {
    // Initial check for user data
    const userData = localStorage.getItem('user')
    if (!userData) {
      handleTimeout()
      return
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Set up initial timer
    resetTimer()

    // Add event listeners for user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer)
    })

    // Cleanup
    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current)
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [])
}
