import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const PremiumContext = createContext(null)

const TOKEN_KEY = 'vmaq_premium_token'
const EMAIL_KEY = 'vmaq_premium_email'

function parseToken(token) {
  try {
    const [encoded] = token.split('.')
    const fixed = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(fixed))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false)
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const savedEmail = localStorage.getItem(EMAIL_KEY)
    if (token && savedEmail) {
      const payload = parseToken(token)
      if (payload) {
        setIsPremium(true)
        setRole(payload.role)
        setEmail(payload.email)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
      }
    }
    setLoading(false)
  }, [])

  const activatePremium = useCallback(async (emailInput) => {
    try {
      const res = await fetch('/api/check-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      })
      const data = await res.json()
      if (data.premium && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(EMAIL_KEY, emailInput.toLowerCase().trim())
        setIsPremium(true)
        setRole(data.role)
        setEmail(emailInput.toLowerCase().trim())
        return { success: true, role: data.role }
      }
      return { success: false }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setIsPremium(false)
    setRole(null)
    setEmail(null)
  }, [])

  const canAccess = useCallback((accessLevel) => {
    if (!accessLevel || accessLevel === '🟢 Public') return true
    return isPremium
  }, [isPremium])

  return (
    <PremiumContext.Provider value={{ isPremium, role, email, loading, activatePremium, logout, canAccess }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  return useContext(PremiumContext)
}
