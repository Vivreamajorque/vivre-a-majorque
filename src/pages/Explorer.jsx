import React from 'react'
import { Link } from 'react-router-dom'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const CARDS = [
  {
    to: '/app/explorer/annuaire',
    emoji: '👥',
    title: 'Annuaires',
    desc: 'Pros francophones par catégorie',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/boutiques',
    emoji: '🛍️',
    title: 'Bons plans',
    desc: 'Itinéraires & adresses locales',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/outils',
    emoji: '🧮',
    title: 'Outils',
    desc: 'Simulateurs & calculateurs',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/actus',
    emoji: '📰',
    title: 'Actualités',
    desc: 'Infos locales, alertes et nouveautés',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/medias',
    emoji: '🎬',
    title: 'Médias',
    desc: 'YouTube, Instagram, TikTok',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/accompagnements',
    emoji: '🤝',
    title: 'Accompagnement',
    desc: 'Suivi personnalisé',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/contact',
    emoji: '✉️',
    title: 'Contact',
    desc: 'Question, partenariat, annuaire',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
]

export default function Explorer() {
  return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="découvre" title="Explorer" accentColor={TERRA} traitColor={TERRA} />
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
              border: `1px solid ${card.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              position: 'relative',
              minHeight: 110,
              opacity: card.coming ? 0.65 : 1,
            }}>
              {card.coming && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 10, background: 'rgba(0,0,0,0.08)',
                  color: 'var(--texte-sec)', padding: '2px 7px',
                  borderRadius: 20, fontWeight: 700,
                }}>{card.comingLabel || 'À venir'}</span>
              )}
              <span style={{ fontSize: 26 }}>{card.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: 18,
                color: 'var(--foret)', fontWeight: 700, lineHeight: 1.2,
              }}>{card.title}</span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4 }}>
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
