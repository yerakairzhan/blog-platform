import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import './styles/index.css'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { registerServiceWorker } from './services/serviceWorker'

// Cached data is "fresh" for 5 minutes (no new request), and removed from memory
// 10 minutes after the last page that used it was closed.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      // Always try the request, even when the browser says offline: the service worker may
      // still have a saved copy. Without this React Query pauses the request and shows loading.
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always', // publishing offline fails with an error instead of waiting forever
    },
  },
})

// When the connection comes back, load everything again so the saved copies are replaced.
onlineManager.subscribe((online) => {
  if (online) queryClient.invalidateQueries()
})

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
