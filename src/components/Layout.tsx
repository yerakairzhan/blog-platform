import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { Icon } from './Icon'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              ✒
            </span>
            Inkwell
          </Link>
          <nav className={styles.nav} aria-label="Main">
            <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              Feed
            </NavLink>
            <NavLink to="/posts/new" className="btn btn-primary">
              <Icon name="pen" size={16} />
              Write
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <p>
            Inkwell is a community reading room. Stories and comments come from{' '}
            <a href="https://dummyjson.com" target="_blank" rel="noreferrer">
              DummyJSON
            </a>
            . Your posts, likes and comments are saved in this browser.
          </p>
        </div>
      </footer>

      {/* Scrolls to the top on navigation and restores the position on Back. */}
      <ScrollRestoration />
    </div>
  )
}
