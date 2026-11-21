import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/index.css'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { registerServiceWorker } from './services/serviceWorker'
import { store } from './store'
import { dataInvalidated } from './store/actions'

// When the connection comes back, the open pages load their data again,
// so saved (offline) copies are replaced with fresh data.
window.addEventListener('online', () => store.dispatch(dataInvalidated()))

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
