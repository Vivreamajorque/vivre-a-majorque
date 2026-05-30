import React, { useState } from 'react'
import { track } from '@vercel/analytics'

/*
 * QuizProfil — 4 questions de personnalisation
 *
 * Props :
 *   onComplete(answers)  — appelé avec toutes les réponses
 *   onSkip()             — l'utilisateur passe
 *   initialAnswers       — réponses existantes (mode édition) : toutes les
 *                          questions sont posées, cochées d'avance
 *   prefill              — valeurs injectées silencieusement (onboarding) :
 *                          les questions prefillées sont SAUTÉES
 *   inline               — true = pleine page, false = bottom-sheet modale
 */

const VERT  = '#5AADA5'
const TERRA = '#C76E4E'
const FORET = '#0F3D35'

const QUESTIONS = [
  {
    id: 'horizon',
    emoji: '📅',
    question: 'Où en êtes-vous dans votre projet ?',
    options: [
      { value: 'plus1an',    label: "Je rêve encore",         desc: "Plus d'un an avant de me lancer" },
      { value: 'entre6et12', label: 'Je prépare',             desc: 'Déménagement dans 6 à 12 mois' },
      { value: 'moins6',     label: "Je m'installe bientôt",  desc: 'Moins de 6 mois, c\'est imminent' },
      { value: 'deja',       label: 'Je suis déjà là',        desc: 'Régularisation et intégration en cours' },
    ],
  },
  {
    id: 'intention',
    emoji: '🎯',
    question: 'Vous venez à Majorque pour…',
    options: [
      { value: 'vivre',    label: 'Vivre et travailler',    desc: 'Salarié, poste local ou remote' },
      { value: 'retraite', label: 'Prendre ma retraite',    desc: 'Vie tranquille, revenus français' },
      { value: 'remote',   label: 'Télétravailler',         desc: 'Employeur resté en France' },
      { value: 'creer',    label: 'Créer mon activité',     desc: 'Entrepreneur, freelance, indépendant' },
    ],
  },
  {
    id: 'famille',
    emoji: '👨‍👩‍👧',
    question: 'Vous êtes…',
    options: [
      { value: 'seul',    label: 'Seul·e',         desc: '' },
      { value: 'couple',  label: 'En couple',      desc: 'Sans enfants' },
      { value: 'enfants', label: 'Famille',         desc: 'Avec enfant(s) à installer' },
    ],
  },
  {
    id: 'douleur',
    emoji: '💬',
    question: 'Votre plus grande inquiétude ?',
    options: [
      { value: 'admin',    label: 'Les démarches admin',  desc: 'NIE, empadronamiento, SS…' },
      { value: 'fiscal',   label: 'La fiscalité',         desc: 'Impôts, autónoma, cotisations' },
      { value: 'logement', label: 'Trouver un logement',  desc: 'Marché tendu, prix élevés' },
      { value: 'clients',  label: 'Trouver des clients',  desc: 'Développer mon activité' },
      { value: 'solitude', label: "M'intégrer",           desc: "Communauté, réseau, liens sociaux" },
      { value: 'tout',     label: 'Tout à la fois',       desc: 'Un peu de tout ça' },
    ],
  },
]

/* ─── Option ──────────────────────────────────── */
function Option({ option, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: 12,
        border: `2px solid ${selected ? VERT : '#D4CCC2'}`,
        background: selected ? 'rgba(90,173,165,0.08)' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 22, height: 22,
        borderRadius: 6,
        border: `2px solid ${selected ? VERT : '#C8C0B4'}`,
        background: selected ? VERT : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontSize: 14, fontWeight: 600,
          color: selected ? FORET : '#1C1410',
          lineHeight: 1.3,
          marginBottom: option.desc ? 2 : 0,
        }}>
          {option.label}
        </span>
        {option.desc && (
          <span style={{
            display: 'block',
            fontSize: 12, color: '#7A7068',
            lineHeight: 1.35,
          }}>
            {option.desc}
          </span>
        )}
      </div>
    </button>
  )
}

/* ─── Barre de progression ────────────────────── */
function ProgressBar({ step, total, questions }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', gap: 5, marginBottom: 10,
      }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? VERT : i === step ? TERRA : '#E0D9CF',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#7A7068', fontFamily: 'var(--font-corps)' }}>
          Question {step + 1} sur {total}
        </span>
        <span style={{ fontSize: 12, color: VERT, fontWeight: 700, fontFamily: 'var(--font-corps)' }}>
          {Math.round((step / total) * 100)}%
        </span>
      </div>
    </div>
  )
}

/* ─── Composant principal ─────────────────────── */
export default function QuizProfil({
  onComplete,
  onSkip,
  initialAnswers = null,  // mode édition : réponses existantes, toutes questions posées
  prefill = {},           // mode onboarding : valeurs silencieuses, questions masquées
  inline = false,
}) {
  /*
   * Mode édition (initialAnswers) : toutes les questions sont posées,
   *   pré-cochées avec les réponses existantes. L'utilisateur peut modifier.
   * Mode onboarding (prefill) : les questions déjà couvertes par prefill
   *   sont sautées. Le reste est posé normalement.
   */
  const isEditMode = !!initialAnswers

  const prefilledIds = isEditMode
    ? []  // édition = on repose tout
    : Object.keys(prefill).filter(k => prefill[k])

  const questionsToAsk = QUESTIONS.filter(q => !prefilledIds.includes(q.id))

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState(
    isEditMode ? { ...initialAnswers } : { ...prefill }
  )
  const [animDir, setAnimDir] = useState('in')

  const q = questionsToAsk[step]
  const total = questionsToAsk.length
  const selected = q ? answers[q.id] : null
  const isLast = step === total - 1

  /* Si plus rien à poser → complétion directe */
  if (total === 0) {
    setTimeout(() => onComplete(answers), 0)
    return null
  }

  const goNext = () => {
    if (!selected) return
    if (isLast) {
      track('quiz_completed', { horizon: answers.horizon || '', intention: answers.intention || '' })
      onComplete(answers)
      return
    }
    setAnimDir('out')
    setTimeout(() => { setStep(s => s + 1); setAnimDir('in') }, 150)
  }

  const goBack = () => {
    if (step === 0) { onSkip(); return }
    setAnimDir('out')
    setTimeout(() => { setStep(s => s - 1); setAnimDir('in') }, 150)
  }

  const handleSelect = (value) => {
    const updated = { ...answers, [q.id]: value }
    setAnswers(updated)
    /* Auto-avance sur mobile (sauf dernière question) */
    if (!isLast) {
      setTimeout(() => {
        setAnimDir('out')
        setTimeout(() => { setStep(s => s + 1); setAnimDir('in') }, 150)
      }, 280)
    }
  }

  const inner = (
    <div style={{
      background: 'var(--bg, #F0EAE0)',
      borderRadius: inline ? 0 : '24px 24px 0 0',
      padding: '24px 20px 40px',
      width: '100%', maxWidth: 480,
      boxShadow: inline ? 'none' : '0 -12px 48px rgba(0,0,0,0.18)',
      maxHeight: inline ? 'none' : '92vh',
      overflowY: 'auto',
    }}>
      {/* Handle modale */}
      {!inline && (
        <div style={{
          width: 36, height: 4, background: '#D4CCC2',
          borderRadius: 2, margin: '0 auto 20px',
        }} />
      )}

      {/* En-tête mode édition */}
      {isEditMode && step === 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E0D9CF' }}>
          <p style={{
            fontFamily: 'var(--font-display, "Playfair Display", serif)',
            fontStyle: 'italic', fontSize: 22,
            color: FORET, marginBottom: 4,
          }}>
            Mettre à jour mon profil
          </p>
          <p style={{ fontSize: 13, color: '#7A7068', lineHeight: 1.5 }}>
            Votre situation a évolué ? Modifiez vos réponses — guides, cockpit et recommandations s'adaptent immédiatement.
          </p>
        </div>
      )}

      {/* Progress */}
      <ProgressBar step={step} total={total} questions={questionsToAsk} />

      {/* Question */}
      <div style={{
        opacity: animDir === 'out' ? 0 : 1,
        transform: animDir === 'out' ? 'translateX(-12px)' : 'translateX(0)',
        transition: 'all 0.15s ease',
      }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 30, display: 'block', marginBottom: 8 }}>{q.emoji}</span>
          <h2 style={{
            fontFamily: 'var(--font-display, "Playfair Display", serif)',
            fontStyle: 'italic', fontSize: 20, fontWeight: 400,
            color: '#1C1410', lineHeight: 1.3,
          }}>
            {q.question}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {q.options.map(opt => (
            <Option
              key={opt.value}
              option={opt}
              selected={answers[q.id] === opt.value}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10 }}>
        {step > 0 && (
          <button
            onClick={goBack}
            style={{
              padding: '13px 18px',
              background: 'transparent',
              border: '1.5px solid #D4CCC2',
              borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              color: '#7A7068', cursor: 'pointer',
              fontFamily: 'var(--font-corps)',
            }}
          >
            ←
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!selected}
          style={{
            flex: 1, padding: '14px 0',
            background: selected ? FORET : '#E0D9CF',
            color: selected ? '#fff' : '#7A7068',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700,
            cursor: selected ? 'pointer' : 'default',
            fontFamily: 'var(--font-corps)',
            transition: 'all 0.15s',
            letterSpacing: '0.01em',
          }}
        >
          {isLast
            ? (isEditMode ? 'Enregistrer les modifications →' : 'Personnaliser mon espace →')
            : 'Suivant →'
          }
        </button>
      </div>

      <button
        onClick={onSkip}
        style={{
          width: '100%', marginTop: 14,
          background: 'none', border: 'none',
          fontSize: 12, color: '#7A7068',
          cursor: 'pointer', textDecoration: 'underline',
          fontFamily: 'var(--font-corps)',
        }}
      >
        {isEditMode ? 'Annuler' : 'Passer — je remplirai plus tard'}
      </button>
    </div>
  )

  if (inline) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 60px' }}>
        {inner}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(28,20,16,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ animation: 'slideUp 0.32s ease', width: '100%', display: 'flex', justifyContent: 'center' }}>
        {inner}
      </div>
    </div>
  )
}
