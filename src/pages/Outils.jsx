import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const OUTILS = [
  {
    id: 'budget',
    emoji: '💶',
    title: 'Budget mensuel',
    desc: 'Estimez vos dépenses à Majorque',
    href: '/app/outils/budget',
    active: true,
  },
  {
    id: 'cout',
    emoji: '🏠',
    title: "Coût d'installation",
    desc: "Calculez votre budget d'installation",
    href: '/app/outils/cout',
    active: true,
  },
  {
    id: 'autonoma',
    emoji: '📊',
    title: 'Simulateur autónoma',
    desc: 'Calcul charges et net en poche',
    active: false,
  },
  {
    id: 'comparateur',
    emoji: '⚖️',
    title: 'Comparateur de statuts',
    desc: 'France AE vs Espagne autónomo',
    active: false,
  },
  {
    id: 'fiscal',
    emoji: '📅',
    title: 'Calendrier fiscal',
    desc: 'Échéances IVA, IRPF, cotización',
    active: false,
  },
]

export default function Outils() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Outils
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Simulateurs & calculateurs pour votre installation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {OUTILS.map(o => {
          if (o.active) {
            return (
              <Link key={o.id} to={o.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--foret)',
                  borderRadius: 'var(--radius)',
                  padding: '18px 14px',
                  color: '#fff',
                  minHeight: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{o.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-titre)', fontSize: 14, fontWeight: 600 }}>{o.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4, lineHeight: 1.4 }}>{o.desc}</div>
                </div>
              </Link>
            )
          }
          return (
            <div key={o.id} style={{
              background: 'var(--gris)',
              borderRadius: 'var(--radius)',
              padding: '18px 14px',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 10, right: 10,
                fontSize: 10, fontFamily: 'Inter, sans-serif',
                background: 'rgba(0,0,0,0.12)', color: '#666',
                padding: '2px 8px', borderRadius: 20, fontWeight: 600,
              }}>À venir</span>
              <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.5 }}>{o.emoji}</div>
              <div style={{ fontFamily: 'var(--font-titre)', fontSize: 14, fontWeight: 600, color: 'var(--texte-sec)' }}>{o.title}</div>
              <div style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 4, lineHeight: 1.4, opacity: 0.8 }}>{o.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
