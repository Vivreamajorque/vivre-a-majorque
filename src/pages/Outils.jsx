import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import AccompagnementBanner from '../components/AccompagnementBanner'
import { PageHeading, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'

const OUTILS = [
  {
    id: 'budget',
    emoji: '💶',
    title: 'Budget mensuel',
    desc: 'Estimez vos dépenses à Majorque',
    href: '/app/outils/budget',
    active: true,
    color: VERT,
    bg: 'rgba(90,173,165,0.10)',
    border: `1.5px solid rgba(90,173,165,0.25)`,
  },
  {
    id: 'cout',
    emoji: '🏠',
    title: "Coût d'installation",
    desc: "Calculez votre budget de départ",
    href: '/app/outils/cout',
    active: true,
    freeAccess: true,
    color: TERRA,
    bg: 'rgba(199,110,78,0.10)',
    border: `1.5px solid rgba(199,110,78,0.25)`,
  },
  {
    id: 'autonoma',
    emoji: '📊',
    title: 'Simulateur autónomo',
    desc: 'France AE vs Espagne — net en poche',
    href: '/app/outils/autonoma',
    active: true,
    freeAccess: true,
    color: VERT,
    bg: 'rgba(90,173,165,0.10)',
    border: `1.5px solid rgba(90,173,165,0.25)`,
  },
  {
    id: 'fiscal',
    emoji: '📅',
    title: 'Calendrier fiscal',
    desc: 'Particuliers · Autónomos · Sociétés',
    href: '/app/outils/fiscal',
    active: true,
    freeAccess: true,
    color: '#b07d2a',
    bg: 'rgba(176,125,42,0.10)',
    border: `1.5px solid rgba(176,125,42,0.25)`,
  },
]

function ToolCard({ o, isPremium, onPaywall }) {
  const navigate = useNavigate()

  const isLocked = o.active && !isPremium && !o.freeAccess

  const inner = (
    <div style={{
      background: isLocked ? '#F7F2EB' : o.bg,
      borderRadius: 16,
      border: isLocked ? '1.5px solid #D4CCC2' : o.border,
      padding: '18px 16px',
      minHeight: 130,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.15s',
    }}>
      {/* Trait coloré haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isLocked ? '#D4CCC2' : o.color,
        borderRadius: '16px 16px 0 0',
      }} />

      {isLocked && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 12, fontWeight: 800,
          color: '#b07d2a', background: 'rgba(176,125,42,0.12)',
          padding: '2px 8px', borderRadius: 20,
          fontFamily: 'var(--font-corps)',
        }}>Premium</span>
      )}

      <div>
        <div style={{ fontSize: 28, marginBottom: 10, marginTop: 8 }}>{o.emoji}</div>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 16, color: isLocked ? 'var(--texte-sec)' : FORET,
          lineHeight: 1.2, marginBottom: 5,
        }}>
          {o.title}
        </p>
        <p style={{
          fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.45,
        }}>
          {o.desc}
        </p>
      </div>

      <div style={{
        marginTop: 12,
        fontSize: 12, fontWeight: 700,
        color: isLocked ? '#b07d2a' : o.color,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {isLocked ? 'Débloquer →' : 'Ouvrir →'}
      </div>
    </div>
  )

  if (isLocked) {
    return <div onClick={onPaywall}>{inner}</div>
  }

  if (o.active) {
    return <Link to={o.href} style={{ textDecoration: 'none' }}>{inner}</Link>
  }

  return (
    <div style={{
      background: '#F7F2EB', borderRadius: 16,
      border: '1.5px solid #D4CCC2',
      padding: '18px 16px', minHeight: 130,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', opacity: 0.6,
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: 10, right: 10,
        fontSize: 11, fontWeight: 700,
        color: '#8A7F74', background: '#E0D9CF',
        padding: '2px 8px', borderRadius: 20,
        fontFamily: 'var(--font-corps)',
      }}>Bientôt</span>
      <div>
        <div style={{ fontSize: 28, marginBottom: 10, marginTop: 8, opacity: 0.4 }}>{o.emoji}</div>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--texte-sec)', lineHeight: 1.2, marginBottom: 5 }}>
          {o.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.45, opacity: 0.7 }}>
          {o.desc}
        </p>
      </div>
    </div>
  )
}

export default function Outils() {
  useSEO({
    title: "Outils et simulateurs pour s'installer à Majorque",
    description: "Simulateurs gratuits : budget mensuel, coût installation, autónomo vs auto-entrepreneur, calendrier fiscal. Pour les Français à Majorque.",
    url: 'https://vivre-a-majorque.vercel.app/app/explorer/outils',
  })
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--vert)', padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-corps)',
        }}>
          ← Explorer
        </button>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          tes
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Simulateurs & outils
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 10 }} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
          Calculez, simulez et planifiez votre installation à Majorque.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {OUTILS.map(o => (
          <ToolCard key={o.id} o={o} isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
        ))}
      </div>

      <AccompagnementBanner
        texte="Ces simulateurs donnent des chiffres — votre situation mérite un regard humain."
        cta="Parler avec Amely →"
        style={{ marginTop: 20 }}
      />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
