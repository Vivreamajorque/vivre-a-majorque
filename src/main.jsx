import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from './context/ProfileContext'
import { PremiumProvider } from './context/PremiumContext'
import App from './App'
import './index.css'

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
