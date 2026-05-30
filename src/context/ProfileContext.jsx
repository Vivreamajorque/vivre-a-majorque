import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { PROFILS } from '../config'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profileId, setProfileId] = useState(null)
  const [prenom, setPrenom]       = useState('')
  const [loaded, setLoaded]       = useState(false)

  /* Lecture initiale */
  useEffect(() => {
    const savedId     = localStorage.getItem('mq_profile')
    const savedPrenom = localStorage.getItem('mq_prenom')
    if (savedId)     setProfileId(savedId)
    if (savedPrenom) setPrenom(savedPrenom)
    setLoaded(true)
  }, [])

  /*
   * Écoute les changements de mq_profile venant de l'extérieur
   * (notamment depuis saveQuiz dans useQuizData qui écrit directement
   * dans localStorage sans passer par chooseProfile).
   * StorageEvent ne se déclenche que sur les autres onglets —
   * on expose donc syncFromStorage pour appel manuel après saveQuiz.
   */
  const syncFromStorage = useCallback(() => {
    const id = localStorage.getItem('mq_profile')
    if (id && id !== profileId) setProfileId(id)
  }, [profileId])

  /* Écoute les autres onglets */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'mq_profile' && e.newValue) {
        setProfileId(e.newValue)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
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
    <ProfileContext.Provider value={{
      profileId, profile, prenom,
      chooseProfile, savePrenom, resetProfile,
      syncFromStorage, loaded,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
