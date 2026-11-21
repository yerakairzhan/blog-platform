import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { ConnectionNotice } from './ConnectionStatus'
import { Message } from './Message'
import { NavBar } from './NavBar'
import { ScrollToTop } from './ScrollToTop'
import { UpdateBanner } from './UpdateBanner'

// Every page is rendered inside <Outlet />. Suspense shows a message while a lazy page loads.
export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <ConnectionNotice />
      <main className="container">
        <Suspense fallback={<Message text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
      <UpdateBanner />
    </>
  )
}
