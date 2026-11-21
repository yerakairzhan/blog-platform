import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Message } from './Message'

// Pages inside this route need a logged-in user, otherwise we go to /login.
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Message text="Checking login..." />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
