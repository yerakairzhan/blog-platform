import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Message } from './Message'
import { NavBar } from './NavBar'
import { ScrollToTop } from './ScrollToTop'

// Every page is rendered inside <Outlet />. Suspense shows a message while a lazy page loads.
export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <main className="container">
        <Suspense fallback={<Message text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
