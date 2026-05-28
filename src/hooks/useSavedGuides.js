import { useState, useCallback } from 'react'

function storageKey(email) {
  return `vmaq_saved_${(email || 'guest').toLowerCase().trim()}`
}

function load(email) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(email)) || '[]')
  } catch {
    return []
  }
}

function save(email, guides) {
  localStorage.setItem(storageKey(email), JSON.stringify(guides))
}

export function useSavedGuides(email) {
  const [saved, setSaved] = useState(() => load(email))

  const toggle = useCallback((guide) => {
    setSaved(prev => {
      const exists = prev.some(g => g.id === guide.id)
      const next = exists
        ? prev.filter(g => g.id !== guide.id)
        : [...prev, { id: guide.id, title: guide.title, category: guide.category, savedAt: Date.now() }]
      save(email, next)
      return next
    })
  }, [email])

  const isSaved = useCallback((id) => saved.some(g => g.id === id), [saved])

  return { saved, toggle, isSaved }
}
