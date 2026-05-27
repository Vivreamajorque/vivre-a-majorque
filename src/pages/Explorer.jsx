import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const CARDS = [
  {
    to: '/app/explorer/annuaire',
    emoji: '👥',
    title: 'Annuaires',
    desc: 'Pros francophones par catégorie',
    bg: 'var(--foret)',
    color: '#fff',
    coming: false,
  },
  {
    to: '/app/explorer/boutiques',
    emoji: '🛍️',
    title: 'Boutiques',
    desc: 'Lifestyle & bons plans',
    bg: 'var(--terra)',
    color: '#fff',
    coming: false,
  },
  {
    to: '/app/explorer/outils',
    emoji: '🧮',
    title: 'Outils',
    desc: 'Simulateurs & calculateurs',
    bg: 'var(--vert)',
    color: '#fff',
    coming: false,
  },
  {
    to: '/app/home',
    emoji: '📰',
    title: 'Actus de la semaine',
    desc: 'Infos et nouveautés Majorque',
    bg: 'var(--gold)',
    color: '#fff',
    coming: false,
  },
  {
    to: null,
    emoji: '🤝',
    title: 'Accompagnement',
    desc: 'Suivi personnalisé',
    bg: 'var(--lin)',
    color: 'var(--foret)',
    coming: true,
  },
  {
    to: '/app/explorer/contact',
    emoji: '✉️',
    title: 'Contact',
    desc: 'Question, partenariat, annuaire',
    bg: 'var(--noir)',
    color: '#fff',
    coming: false,
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CARDS.map(card => {
          const inner = (
            <div style={{
              background: card.bg,
              borderRadius: 'var(--radius)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              minHeight: 110,
              opacity: card.coming ? 0.7 : 1,
            }}>
              {card.coming && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 10, background: 'rgba(255,255,255,0.35)',
                  color: card.color, padding: '2px 7px',
                  borderRadius: 20, fontWeight: 700,
                }}>À venir</span>
              )}
              <span style={{ fontSize: 28 }}>{card.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-titre)', fontSize: 15,
                color: card.color, fontWeight: 700, lineHeight: 1.2,
              }}>{card.title}</span>
              <span style={{ fontSize: 12, color: card.color, opacity: 0.85, lineHeight: 1.4 }}>
                {card.desc}
              </span>
            </div>
          )

          if (card.coming || !card.to) {
            return <div key={card.title} style={{ cursor: 'default' }}>{inner}</div>
          }
          return (
            <Link key={card.title} to={card.to} style={{ textDecoration: 'none' }}>
              {inner}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
