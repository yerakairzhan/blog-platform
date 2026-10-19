import { useEffect } from 'react'
import { useLocation } from 'react-router'

// Scrolls the window to the top every time the page (URL path) changes.
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
