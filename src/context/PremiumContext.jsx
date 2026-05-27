import React, { createContext, useContext, useState, useEffect } from 'react'
import { OWNER_EMAIL } from '../config'

const PremiumContext = createContext(null)

export function PremiumProvider({ children }) {
  const [email, setEmail] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mq_email')
    if (saved) {
      setEmail(saved)
      checkPremium(saved)
    }
    const premiumFlag = localStorage.getItem('mq_premium')
    if (premiumFlag === 'true') setIsPremium(true)
  }, [])

  function checkPremium(e) {
    const normalized = (e || '').trim().toLowerCase()
    if (normalized === OWNER_EMAIL.toLowerCase()) {
      setIsOwner(true)
      setIsPremium(true)
      localStorage.setItem('mq_premium', 'true')
      return true
    }
    return isPremium
  }

  function saveEmail(e) {
    setEmail(e)
    localStorage.setItem('mq_email', e)
    return checkPremium(e)
  }

  function activatePremium() {
    setIsPremium(true)
    localStorage.setItem('mq_premium', 'true')
  }

  function canAccess(accessLevel) {
    if (!accessLevel || accessLevel === '🟢 Public') return true
    return isPremium
  }

  return (
    <PremiumContext.Provider value={{ email, isPremium, isOwner, canAccess, saveEmail, activatePremium }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  return useContext(PremiumContext)
}
