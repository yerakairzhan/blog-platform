import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div>
      <h1>Profile</h1>

      <dl className="details">
        <dt>Email</dt>
        <dd>{user?.email}</dd>
        <dt>UID</dt>
        <dd>{user?.uid}</dd>
      </dl>

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
