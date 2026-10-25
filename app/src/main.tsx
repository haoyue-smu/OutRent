import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@design/tokens.css'
import '@design/components.css'
import '@design/direction.css'
import './shell/shell.css'
import App from './App'

// On a computer the phone frame keeps its 393 × 852 size and shrinks only when the window is shorter than it.
const fitZoom = () => document.documentElement.style.setProperty('--fit-zoom', String(Math.min(1, (window.innerHeight - 32) / 852)))
fitZoom()
addEventListener('resize', fitZoom)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
