import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { ConnectionIndicator } from './ConnectionStatus'

export function NavBar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Blog Platform
        </Link>
        <ConnectionIndicator />
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        {/* On small screens the links are hidden until the Menu button is pressed. */}
        <nav
          id="main-nav"
          className={menuOpen ? 'nav nav-open' : 'nav'}
          onClick={(event) => {
            // close the menu after tapping a link
            if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
          }}
        >
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
