import React from 'react'
import { Link } from 'react-router-dom'

const CARDS = [
  {
    to: '/app/explorer/annuaire',
    emoji: '👥',
    title: 'Annuaires',
    desc: 'Pros francophones par catégorie',
    bg: 'var(--foret)',
    color: '#fff',
  },
  {
    to: '/app/explorer/boutiques',
    emoji: '🛍️',
    title: 'Boutiques',
    desc: 'Lifestyle & bons plans',
    bg: 'var(--terra)',
    color: '#fff',
  },
  {
    to: '/app/explorer/outils',
    emoji: '🧮',
    title: 'Outils',
    desc: 'Simulateurs & calculateurs',
    bg: 'var(--vert)',
    color: '#fff',
  },
]

export default function Explorer() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)' }}>
          Explorer
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 4 }}>
          Ressources pour votre vie à Majorque
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: card.bg,
              borderRadius: 'var(--radius)',
              padding: '22px 16px 18px',
              color: card.color,
              minHeight: 130,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>{card.emoji}</div>
              <div style={{ fontFamily: 'var(--font-titre)', fontSize: 16, fontWeight: 600 }}>{card.title}</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
