import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AudienceApp from './AudienceApp.tsx'
import { startListening } from './lib/displaySync'

// ?display = read-only audience window that mirrors the host window's state
const isDisplay = new URLSearchParams(window.location.search).has('display')
if (isDisplay) startListening()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDisplay ? <AudienceApp /> : <App />}
  </StrictMode>,
)
