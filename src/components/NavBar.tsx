import { Link, NavLink } from 'react-router'

export function NavBar() {
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
          <NavLink to="/login">Login</NavLink>
        </nav>
      </div>
    </header>
  )
}
