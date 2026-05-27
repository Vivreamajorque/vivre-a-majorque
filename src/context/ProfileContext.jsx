import React, { createContext, useContext, useState, useEffect } from 'react'
import { PROFILS } from '../config'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profileId, setProfileId] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mq_profile')
    if (saved) setProfileId(saved)
    setLoaded(true)
  }, [])

  const profile = PROFILS.find(p => p.id === profileId) || null

  function chooseProfile(id) {
    setProfileId(id)
    localStorage.setItem('mq_profile', id)
  }

  function resetProfile() {
    setProfileId(null)
    localStorage.removeItem('mq_profile')
  }

  return (
    <ProfileContext.Provider value={{ profileId, profile, chooseProfile, resetProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
