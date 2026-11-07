import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export function NavBar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Blog Platform
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/posts" end>
            Posts
          </NavLink>
          <NavLink to="/posts/new">New post</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/about">About</NavLink>
          {!loading && user && (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
