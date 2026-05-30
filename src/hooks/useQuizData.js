import { useState, useCallback } from 'react'

const KEY = 'vmaq_quiz'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') }
  catch { return null }
}

export function useQuizData() {
  const [quiz, setQuiz] = useState(() => load())

  const saveQuiz = useCallback((answers) => {
    const data = { ...answers, completed_at: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(data))
    setQuiz(data)
    return data
  }, [])

  const resetQuiz = useCallback(() => {
    localStorage.removeItem(KEY)
    setQuiz(null)
  }, [])

  const hasQuiz = !!(quiz && quiz.completed_at)

  return { quiz, saveQuiz, resetQuiz, hasQuiz }
}

/* ─── Helpers d'interprétation ────────────────────
   Utilisés dans toute l'app pour personnaliser
─────────────────────────────────────────────────── */

export function isEntrepreneurProfile(quiz) {
  return quiz?.intention === 'creer'
}

export function isFamilyProfile(quiz) {
  return quiz?.famille === 'enfants'
}

export function isUrgent(quiz) {
  return quiz?.horizon === 'moins6' || quiz?.horizon === 'deja'
}

export function getRecommendedOffer(quiz) {
  if (!quiz) return 'cap'
  if (quiz.intention === 'creer') return 'eclaireur'
  if (quiz.intention === 'creer' && (quiz.horizon === 'moins6' || quiz.horizon === 'deja')) return 'integrale'
  if (quiz.famille === 'enfants') return 'cap'
  return 'cap'
}

export function getPainLabel(pain) {
  const map = {
    admin:    'les démarches administratives',
    fiscal:   'la fiscalité',
    logement: 'trouver un logement',
    clients:  'trouver des clients',
    solitude: 'me sentir seul·e là-bas',
    tout:     'tout à la fois',
  }
  return map[pain] || ''
}
