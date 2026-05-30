import { useState, useCallback } from 'react'

const KEY = 'vmaq_quiz'

/* Mapping Q1 onboarding → profileId Notion */
export const ETAPE_TO_PROFILE = {
  reve:    'reve',
  prepare: 'installe',
  bientot: 'installe',
  deja:    'premiere',
}

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
    // Synchronise automatiquement le profileId depuis la Q1 quiz
    const profileId = ETAPE_TO_PROFILE[answers.etape] || 'reve'
    localStorage.setItem('mq_profile', profileId)
    return data
  }, [])

  const resetQuiz = useCallback(() => {
    localStorage.removeItem(KEY)
    setQuiz(null)
  }, [])

  const hasQuiz = !!(quiz && quiz.completed_at)

  return { quiz, saveQuiz, resetQuiz, hasQuiz }
}

/* ─── Helpers d'interprétation ─────────────────── */

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
  const { intention, famille, horizon, douleur } = quiz
  const urgent = horizon === 'moins6' || horizon === 'deja'
  if (intention === 'creer') {
    if (urgent && famille !== 'seul') return 'integrale'
    return 'eclaireur'
  }
  if (intention === 'remote') return 'cap'
  if (intention === 'retraite') return 'visio'
  if (famille === 'enfants') return 'cap'
  if (urgent && douleur === 'tout') return 'integrale'
  return 'cap'
}

export function getPainLabel(pain) {
  const map = {
    admin:    'les démarches administratives',
    fiscal:   'la fiscalité',
    logement: 'trouver un logement',
    clients:  'trouver des clients',
    solitude: "s'intégrer",
    tout:     'tout à la fois',
  }
  return map[pain] || ''
}

/* ─── Catégories de guides suggérées ─────────── */
export function getSuggestedGuideCategories(quiz) {
  if (!quiz) return ['Administratif']
  const { intention, famille, douleur, etape } = quiz
  const cats = new Set(['Administratif'])
  if (intention === 'creer')    { cats.add('Travail'); cats.add('Argent') }
  if (intention === 'remote')   cats.add('Travail')
  if (intention === 'retraite') { cats.add('Santé'); cats.add('Argent') }
  if (famille === 'enfants')    cats.add('Famille')
  if (douleur === 'logement')   cats.add('Logement')
  if (douleur === 'fiscal')     cats.add('Argent')
  if (etape === 'deja' || etape === 'bientot') { cats.add('Logement'); cats.add('Voiture') }
  return [...cats]
}

/* ─── Outils suggérés ────────────────────────── */
export function getSuggestedTools(quiz) {
  if (!quiz) return []
  const tools = []
  if (quiz.intention === 'creer') {
    tools.push({ id: 'autonoma', label: 'Simulateur autónoma', href: '/app/outils/autonoma', emoji: '📊' })
  }
  tools.push({ id: 'cout', label: "Coût d'installation", href: '/app/outils/cout', emoji: '🏠' })
  if (quiz.intention !== 'retraite') {
    tools.push({ id: 'budget', label: 'Budget mensuel', href: '/app/outils/budget', emoji: '💶' })
  }
  return tools
}
