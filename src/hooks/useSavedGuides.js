import { useState, useCallback } from 'react'

/*
 * Les guides sauvegardés sont stockés localement.
 * On utilise une clé FIXE indépendante de l'email Premium —
 * l'email est null pour les utilisateurs gratuits, ce qui cassait
 * la persistance entre sessions.
 */
const STORAGE_KEY = 'vmaq_saved_guides'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function persist(guides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guides))
}

export function useSavedGuides() {
  const [saved, setSaved] = useState(() => load())

  const toggle = useCallback((guide) => {
    setSaved(prev => {
      const exists = prev.some(g => g.id === guide.id)
      const next = exists
        ? prev.filter(g => g.id !== guide.id)
        : [...prev, {
            id: guide.id,
            title: guide.title,
            category: guide.category || '',
            savedAt: Date.now(),
          }]
      persist(next)
      return next
    })
  }, [])

  const isSaved = useCallback((id) => saved.some(g => g.id === id), [saved])

  return { saved, toggle, isSaved }
}
