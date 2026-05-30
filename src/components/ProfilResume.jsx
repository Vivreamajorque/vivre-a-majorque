import React from 'react'
import { getPainLabel } from '../hooks/useQuizData'

const INTENTION_LABELS = {
  vivre:    'Vivre & travailler',
  retraite: 'Retraite',
  remote:   'Télétravail',
  creer:    'Créer mon activité',
}

const FAMILLE_LABELS = {
  seul:    'Seul·e',
  couple:  'En couple',
  enfants: 'Famille',
}

const HORIZON_LABELS = {
  plus1an:    '+ 1 an',
  entre6et12: '6 – 12 mois',
  moins6:     '< 6 mois',
  deja:       'Déjà sur place',
}

const DOULEUR_LABELS = {
  admin:    'Démarches admin',
  fiscal:   'La fiscalité',
  logement: 'Trouver un logement',
  clients:  'Trouver des clients',
  solitude: "S'intégrer",
  tout:     'Tout à la fois',
}

export default function ProfilResume({ quiz, onEdit }) {
  if (!quiz) return null

  const cells = [
    { label: 'Projet',     val: INTENTION_LABELS[quiz.intention] },
    { label: 'Horizon',    val: HORIZON_LABELS[quiz.horizon] },
    { label: 'Situation',  val: FAMILLE_LABELS[quiz.famille] },
    { label: 'Inquiétude', val: DOULEUR_LABELS[quiz.douleur] },
  ].filter(c => c.val)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      border: 'var(--border)',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Grille 2×2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'var(--gris)',
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            background: '#fff',
            padding: '14px 14px 12px',
          }}>
            <p style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--texte-sec)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-corps)',
              marginBottom: 4,
            }}>
              {c.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--foret)',
              lineHeight: 1.2,
              fontWeight: 400,
            }}>
              {c.val}
            </p>
          </div>
        ))}
      </div>

      {/* Footer modifier */}
      <button
        onClick={onEdit}
        style={{
          width: '100%',
          padding: '11px 16px',
          background: 'var(--bg)',
          border: 'none',
          borderTop: '1px solid var(--gris)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--texte-sec)',
          fontFamily: 'var(--font-corps)',
          letterSpacing: '0.03em',
          cursor: 'pointer',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        ✏️ Modifier mon profil
      </button>
    </div>
  )
}
