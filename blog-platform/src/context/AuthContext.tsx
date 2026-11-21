import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import {
  getAuthErrorMessage,
  listenToAuthChanges,
  logInWithEmail,
  logInWithGoogle,
  logOut,
  signUpWithEmail,
} from '../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean // true until Firebase tells us if someone is already logged in
  error: string
  signup: (email: string, password: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Firebase calls this on start (restoring the saved session) and on every login/logout.
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Runs an auth action. Returns true on success, false on error (the message is in `error`).
  async function run(action: () => Promise<unknown>): Promise<boolean> {
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(getAuthErrorMessage(err))
      return false
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signup: (email, password) => run(() => signUpWithEmail(email, password)),
    login: (email, password) => run(() => logInWithEmail(email, password)),
    loginWithGoogle: () => run(() => logInWithGoogle()),
    logout: async () => {
      await run(() => logOut())
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
