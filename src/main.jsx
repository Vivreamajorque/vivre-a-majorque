import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from './context/ProfileContext'
import { PremiumProvider } from './context/PremiumContext'
import { inject } from '@vercel/analytics'
import App from './App'
import './index.css'

/* Vercel Analytics — privacy-first, sans cookies, RGPD OK */
inject()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <PremiumProvider>
          <App />
        </PremiumProvider>
      </ProfileProvider>
    </BrowserRouter>
  </React.StrictMode>
)
