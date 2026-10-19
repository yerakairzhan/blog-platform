import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global styles first, so component CSS modules (imported via App) can override them.
import './index.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element in index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
