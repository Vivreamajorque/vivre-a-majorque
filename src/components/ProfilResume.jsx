import React from 'react'
import { getPainLabel } from '../hooks/useQuizData'

const ETAPE_LABELS = {
  reve:    'En phase de rêve',
  prepare: 'En préparation active',
  bientot: 'Départ imminent',
  deja:    'Déjà installé·e',
}

const INTENTION_LABELS = {
  vivre:    'Vivre et travailler à Majorque',
  retraite: 'Retraite à Majorque',
  remote:   'Télétravail depuis Majorque',
  creer:    'Créer mon activité à Majorque',
}

const FAMILLE_LABELS = {
  seul:    'Seul·e',
  couple:  'En couple',
  enfants: 'Famille avec enfant(s)',
}

const HORIZON_LABELS = {
  plus1an:    'Horizon +1 an',
  entre6et12: 'Horizon 6–12 mois',
  moins6:     'Horizon < 6 mois',
  deja:       'Déjà sur place',
}

export default function ProfilResume({ quiz, onEdit }) {
  if (!quiz) return null

  const items = [
    { icon: '🧭', label: ETAPE_LABELS[quiz.etape] },
    { icon: '🎯', label: INTENTION_LABELS[quiz.intention] },
    { icon: '👨‍👩‍👧', label: FAMILLE_LABELS[quiz.famille] },
    { icon: '📅', label: HORIZON_LABELS[quiz.horizon] },
    { icon: '💬', label: `Inquiétude : ${getPainLabel(quiz.douleur)}` },
  ].filter(i => i.label)

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--gris)',
      borderRadius: 14,
      padding: '16px 16px 12px',
      marginBottom: 20,
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: 'var(--vert)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-corps)',
        }}>
          Mon profil personnalisé
        </span>
        <button
          onClick={onEdit}
          style={{
            background: 'none', border: 'none',
            fontSize: 12, color: 'var(--texte-sec)',
            cursor: 'pointer', textDecoration: 'underline',
            fontFamily: 'var(--font-corps)',
          }}
        >
          Modifier
        </button>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
            <span style={{
              fontSize: 13, color: 'var(--texte)',
              lineHeight: 1.4, fontFamily: 'var(--font-corps)',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
