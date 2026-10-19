import { Link, NavLink } from 'react-router'

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Blog Platform
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            All posts
          </NavLink>
          <NavLink to="/posts/new">New post</NavLink>
        </nav>
      </div>
    </header>
  )
}
