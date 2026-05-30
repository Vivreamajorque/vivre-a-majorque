import { useState, useCallback } from 'react'

const KEY = 'vmaq_quiz'

/*
 * Mapping horizon quiz → profileId (source unique de vérité)
 * L'onboarding pré-remplit "horizon" avant de lancer le quiz —
 * c'est donc le quiz qui détermine TOUT le fléchage, pas l'onboarding.
 */
export const HORIZON_TO_PROFILE = {
  plus1an:    'reve',       // Je rêve — plus d'un an
  entre6et12: 'installe',   // Je m'installe — 6-12 mois
  moins6:     'installe',   // Je m'installe — urgent
  deja:       'premiere',   // 1ère année — déjà là
}

/* Rétro-compatibilité ancienne clé "etape" */
export const ETAPE_TO_PROFILE = {
  reve:     'reve',
  prepare:  'installe',
  bientot:  'installe',
  deja:     'premiere',
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') }
  catch { return null }
}

function deriveProfile(answers) {
  // Priorité : horizon (quiz v2) > etape (rétro-compat)
  if (answers?.horizon) return HORIZON_TO_PROFILE[answers.horizon] || 'reve'
  if (answers?.etape)   return ETAPE_TO_PROFILE[answers.etape]   || 'reve'
  return 'reve'
}

export function useQuizData() {
  const [quiz, setQuiz] = useState(() => load())

  const saveQuiz = useCallback((answers) => {
    const data = { ...answers, completed_at: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(data))
    setQuiz(data)
    // Le profil découle entièrement du quiz — source unique
    const profileId = deriveProfile(answers)
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

/* ─── Catégories de guides suggérées depuis quiz ─── */
export function getSuggestedGuideCategories(quiz) {
  if (!quiz) return ['Administratif']
  const { intention, famille, douleur, horizon } = quiz
  const cats = new Set(['Administratif'])
  if (intention === 'creer')    { cats.add('Travail'); cats.add('Argent') }
  if (intention === 'remote')   cats.add('Travail')
  if (intention === 'retraite') { cats.add('Santé'); cats.add('Argent') }
  if (famille === 'enfants')    cats.add('Famille')
  if (douleur === 'logement')   cats.add('Logement')
  if (douleur === 'fiscal')     cats.add('Argent')
  if (douleur === 'clients')    { cats.add('Travail'); cats.add('Argent') }
  if (horizon === 'deja' || horizon === 'moins6') { cats.add('Logement'); cats.add('Voiture') }
  return [...cats]
}

/* ─── Outils suggérés ────────────────────────── */
export function getSuggestedTools(quiz) {
  if (!quiz) return []
  const tools = []
  if (quiz.intention === 'creer') {
    tools.push({ id: 'autonoma', label: 'Simulateur autónoma', href: '/app/outils/autonoma', emoji: '📊' })
    tools.push({ id: 'statuts', label: 'Comparateur statuts', href: '/app/outils/statuts', emoji: '⚖️' })
  }
  tools.push({ id: 'cout', label: "Coût d'installation", href: '/app/outils/cout', emoji: '🏠' })
  if (quiz.intention !== 'retraite') {
    tools.push({ id: 'budget', label: 'Budget mensuel', href: '/app/outils/budget', emoji: '💶' })
  }
  if (quiz.horizon === 'deja' || quiz.horizon === 'moins6') {
    tools.push({ id: 'fiscal', label: 'Calendrier fiscal', href: '/app/outils/fiscal', emoji: '📅' })
  }
  return tools.slice(0, 3)
}

/* ─── Label profil dérivé du quiz ─────────────── */
export function getProfileLabelFromQuiz(quiz) {
  if (!quiz) return null
  const { horizon, intention } = quiz
  if (horizon === 'deja') return { label: '1ère année à Majorque', emoji: '🏡' }
  if (horizon === 'moins6') return { label: 'Installation imminente', emoji: '📦' }
  if (horizon === 'entre6et12') return { label: 'Projet concret', emoji: '🎯' }
  if (intention === 'retraite') return { label: 'Projet retraite', emoji: '🌅' }
  return { label: 'Je rêve de Majorque', emoji: '🌅' }
}
