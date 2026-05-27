import React, { createContext, useContext, useState, useEffect } from 'react'
import { PROFILS } from '../config'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profileId, setProfileId] = useState(null)
  const [prenom, setPrenom]       = useState('')
  const [loaded, setLoaded]       = useState(false)

  useEffect(() => {
    const savedId     = localStorage.getItem('mq_profile')
    const savedPrenom = localStorage.getItem('mq_prenom')
    if (savedId)     setProfileId(savedId)
    if (savedPrenom) setPrenom(savedPrenom)
    setLoaded(true)
  }, [])

  const profile = PROFILS.find(p => p.id === profileId) || null

  function chooseProfile(id) {
    setProfileId(id)
    localStorage.setItem('mq_profile', id)
  }

  function savePrenom(nom) {
    const trimmed = nom.trim()
    setPrenom(trimmed)
    localStorage.setItem('mq_prenom', trimmed)
  }

  function resetProfile() {
    setProfileId(null)
    setPrenom('')
    localStorage.removeItem('mq_profile')
    localStorage.removeItem('mq_prenom')
  }

  return (
    <ProfileContext.Provider value={{ profileId, profile, prenom, chooseProfile, savePrenom, resetProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
