import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export function useAuthGate(reason = 'Sign in with Google to continue.') {
  const { user, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const requireAuth = useCallback((action) => {
    if (loading) return false
    if (!user) {
      setIsOpen(true)
      return false
    }
    if (typeof action === 'function') action()
    return true
  }, [loading, user])

  const authGateModal = (
    <AuthModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      reason={reason}
    />
  )

  return { requireAuth, authGateModal, isAuthenticated: !!user }
}