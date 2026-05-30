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
    to: '/app/explorer/entreprendre',
    emoji: '🏢',
    title: 'Entreprendre',
    desc: 'Créer son activité à Majorque',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
  {
    to: '/app/guides',
    emoji: '📚',
    title: 'Guides',
    desc: '100+ fiches administratives',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/accompagnements',
    emoji: '🤝',
    title: 'Accompagnement',
    desc: 'Suivi personnalisé par Amely',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.15)',
    coming: false,
  },
  {
    to: '/app/explorer/contact',
    emoji: '✉️',
    title: 'Contact',
    desc: 'Question, partenariat, annuaire',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.15)',
    coming: false,
  },
]

export default function Explorer() {
  return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="découvre" title="Explorer" accentColor={TERRA} traitColor={TERRA} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginTop: 4 }}>
          Ressources pour votre vie à Majorque
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CARDS.map(card => {
          const inner = (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              padding: '18px 16px',
              border: '1px solid var(--gris)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              position: 'relative',
              minHeight: 110,
              opacity: card.coming ? 0.6 : 1,
            }}>
              {card.coming && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 11, background: 'var(--gris)',
                  color: 'var(--texte-sec)', padding: '2px 7px',
                  borderRadius: 20, fontWeight: 700,
                }}>{card.comingLabel || 'À venir'}</span>
              )}
              <span style={{ fontSize: 26 }}>{card.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-titre)',
                fontWeight: 600,
                fontSize: 'var(--fs-lg)',
                color: 'var(--foret)',
                lineHeight: 1.25,
              }}>{card.title}</span>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--texte-sec)', lineHeight: 1.40 }}>
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
