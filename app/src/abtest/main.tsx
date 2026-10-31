import { createRoot } from 'react-dom/client'
import '@design/tokens.css'
import '@design/components.css'
import './abtest.css'
import App from './App'

// The A/B test site: a second entry point of the app, built on its own (vite.abtest.config.ts). It imports page 11's
// pieces from the app and uses neither the app's store nor its router.
createRoot(document.getElementById('root')!).render(<App />)
