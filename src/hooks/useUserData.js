import { useState, useCallback } from 'react'

const KEY = 'vmaq_user'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') }
  catch { return null }
}

export function useUserData() {
  const [user, setUser] = useState(() => load())

  const saveUser = useCallback(({ prenom, email, newsletter }) => {
    const data = {
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      newsletter: !!newsletter,
      welcome: true,
      created_at: new Date().toISOString(),
    }
    localStorage.setItem(KEY, JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const dismiss = useCallback(() => {
    const data = { dismissed: true, created_at: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(data))
    setUser(data)
  }, [])

  const hasData = !!(user && (user.email || user.dismissed))

  return { user, saveUser, dismiss, hasData }
}
