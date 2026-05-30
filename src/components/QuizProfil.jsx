import React, { useState } from 'react'

/*
 * QuizProfil — 4 questions de personnalisation
 * Props :
 *   onComplete(answers) — appelé avec toutes les réponses
 *   onSkip()            — l'utilisateur passe
 *   prefill             — objet { horizon, ... } pour pré-remplir sans reposer la question
 *   inline              — si true, affichage page entière (pas de modale bottom-sheet)
 */

const QUESTIONS = [
  {
    id: 'intention',
    emoji: '🎯',
    question: 'Vous venez à Majorque pour…',
    options: [
      { value: 'vivre',    label: 'Vivre et travailler',     desc: 'Salarié, poste local ou remote' },
      { value: 'retraite', label: 'Prendre ma retraite',     desc: 'Vie tranquille, revenus français' },
      { value: 'remote',   label: 'Télétravailler',          desc: 'Employeur resté en France' },
      { value: 'creer',    label: 'Créer mon activité',      desc: 'Entrepreneur, freelance, indépendant' },
    ],
  },
  {
    id: 'famille',
    emoji: '👨‍👩‍👧',
    question: 'Vous êtes…',
    options: [
      { value: 'seul',    label: 'Seul·e',         desc: '' },
      { value: 'couple',  label: 'En couple',      desc: 'Sans enfants' },
      { value: 'enfants', label: 'Avec enfant(s)', desc: 'Famille à installer' },
    ],
  },
  {
    id: 'horizon',
    emoji: '📅',
    question: 'Votre horizon de déménagement ?',
    options: [
      { value: 'plus1an',    label: "Dans plus d'un an",    desc: 'Temps de bien préparer' },
      { value: 'entre6et12', label: 'Dans 6 à 12 mois',    desc: "C'est sérieux" },
      { value: 'moins6',     label: 'Dans moins de 6 mois', desc: "C'est urgent" },
      { value: 'deja',       label: 'Je suis déjà là',      desc: 'Régularisation en cours' },
    ],
  },
  {
    id: 'douleur',
    emoji: '💬',
    question: 'Votre plus grande inquiétude ?',
    options: [
      { value: 'admin',    label: 'Les démarches admin', desc: 'NIE, empadronamiento, SS…' },
      { value: 'fiscal',   label: 'La fiscalité',        desc: 'Impôts, autónoma, cotisations' },
      { value: 'logement', label: 'Trouver un logement', desc: 'Marché tendu, prix élevés' },
      { value: 'clients',  label: 'Trouver des clients', desc: 'Développer mon activité' },
      { value: 'solitude', label: "M'intégrer",          desc: "Communauté, réseau, ne pas me sentir seul·e" },
      { value: 'tout',     label: 'Tout à la fois',      desc: 'Un peu de tout ça' },
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
        border: `2px solid ${selected ? 'var(--vert)' : 'var(--gris)'}`,
        background: selected ? 'var(--vert-light)' : 'var(--bg-card)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 20, height: 20,
        borderRadius: 6,
        border: `2px solid ${selected ? 'var(--vert)' : 'var(--gris-mid)'}`,
        background: selected ? 'var(--vert)' : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && <span style={{ color: 'white', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontSize: 14, fontWeight: 600,
          color: selected ? 'var(--foret, #0F3D35)' : 'var(--texte)',
          lineHeight: 1.3,
          marginBottom: option.desc ? 2 : 0,
        }}>
          {option.label}
        </span>
        {option.desc && (
          <span style={{
            display: 'block',
            fontSize: 12, color: 'var(--texte-sec)',
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
function ProgressDots({ questions, currentStep, prefilled }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28, alignItems: 'center' }}>
      {questions.map((q, i) => {
        const isPrefilled = prefilled?.includes(q.id)
        const isDone = i < currentStep
        const isActive = i === currentStep
        return (
          <div key={q.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              height: 4, width: '100%',
              borderRadius: 4,
              background: isPrefilled ? 'var(--vert)' : isDone ? 'var(--vert)' : isActive ? 'var(--terra)' : 'var(--gris)',
              transition: 'background 0.3s',
            }} />
            <span style={{ fontSize: 9, color: isActive ? 'var(--terra)' : 'var(--texte-sec)', fontWeight: isActive ? 700 : 400 }}>
              {q.emoji}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Composant principal ─────────────────────── */
export default function QuizProfil({ onComplete, onSkip, prefill = {}, inline = false }) {
  // Questions à poser = toutes sauf celles pré-remplies
  const prefilledIds = Object.keys(prefill).filter(k => prefill[k])
  const questionsToAsk = QUESTIONS.filter(q => !prefilledIds.includes(q.id))

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({ ...prefill })
  const [animDir, setAnimDir] = useState('in')

  const q = questionsToAsk[step]
  const total = questionsToAsk.length
  const selected = q ? answers[q.id] : null
  const isLast = step === total - 1

  const goNext = () => {
    if (!selected) return
    if (isLast) {
      onComplete(answers)
      return
    }
    setAnimDir('out')
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimDir('in')
    }, 150)
  }

  const goBack = () => {
    if (step === 0) { onSkip(); return }
    setAnimDir('out')
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimDir('in')
    }, 150)
  }

  const handleSelect = (value) => {
    const updated = { ...answers, [q.id]: value }
    setAnswers(updated)
    // Auto-avancer après sélection sur mobile (sauf dernière question)
    if (!isLast) {
      setTimeout(() => {
        setAnimDir('out')
        setTimeout(() => {
          setStep(s => s + 1)
          setAnswers(updated)
          setAnimDir('in')
        }, 150)
      }, 300)
    }
  }

  // Si toutes les questions sont déjà pré-remplies → complétion directe
  if (total === 0) {
    setTimeout(() => onComplete(answers), 0)
    return null
  }

  const inner = (
    <div style={{
      background: 'var(--bg)',
      borderRadius: inline ? 0 : '24px 24px 0 0',
      padding: inline ? '24px 20px 40px' : '24px 20px 40px',
      width: '100%', maxWidth: 480,
      boxShadow: inline ? 'none' : '0 -12px 48px rgba(0,0,0,0.18)',
      maxHeight: inline ? 'none' : '92vh',
      overflowY: 'auto',
    }}>
      {/* Handle (modale uniquement) */}
      {!inline && (
        <div style={{
          width: 36, height: 4,
          background: 'var(--gris-mid)',
          borderRadius: 2,
          margin: '0 auto 20px',
        }} />
      )}

      {/* Dots progression */}
      <ProgressDots
        questions={QUESTIONS}
        currentStep={QUESTIONS.findIndex(q2 => q2.id === q?.id)}
        prefilled={prefilledIds}
      />

      {/* Question */}
      <div style={{
        opacity: animDir === 'out' ? 0 : 1,
        transform: animDir === 'out' ? 'translateX(-12px)' : 'translateX(0)',
        transition: 'all 0.15s ease',
      }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{q.emoji}</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontWeight: 700,
            color: 'var(--texte)', lineHeight: 1.3,
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
              border: '1.5px solid var(--gris)',
              borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              color: 'var(--texte-sec)',
              cursor: 'pointer',
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
            flex: 1,
            padding: '13px 0',
            background: selected ? 'var(--foret, #0F3D35)' : 'var(--gris)',
            color: selected ? '#fff' : 'var(--texte-sec)',
            border: 'none',
            borderRadius: 12,
            fontSize: 15, fontWeight: 700,
            cursor: selected ? 'pointer' : 'default',
            fontFamily: 'var(--font-corps)',
            transition: 'all 0.15s',
          }}
        >
          {isLast ? 'Personnaliser mon espace →' : 'Suivant →'}
        </button>
      </div>

      <button
        onClick={onSkip}
        style={{
          width: '100%', marginTop: 14,
          background: 'none', border: 'none',
          fontSize: 12, color: 'var(--texte-sec)',
          cursor: 'pointer', textDecoration: 'underline',
          fontFamily: 'var(--font-corps)',
        }}
      >
        Passer — je remplirai plus tard
      </button>
    </div>
  )

  if (inline) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '20px 20px 60px',
      }}>
        {inner}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(28,20,16,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
      `}</style>
      <div style={{ animation: 'slideUp 0.32s ease', width: '100%', display: 'flex', justifyContent: 'center' }}>
        {inner}
      </div>
    </div>
  )
}
