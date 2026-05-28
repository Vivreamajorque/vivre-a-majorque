import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import AccompagnementBanner from '../components/AccompagnementBanner'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const OUTILS = [
  {
    id: 'budget',
    emoji: '💶',
    title: 'Budget mensuel',
    desc: 'Estimez vos dépenses à Majorque',
    href: '/app/outils/budget',
    active: true,
    bg: 'var(--vert-light)',
    border: '1px solid rgba(90,122,64,0.15)',
  },
  {
    id: 'cout',
    emoji: '🏠',
    title: "Coût d'installation",
    desc: "Calculez votre budget d'installation",
    href: '/app/outils/cout',
    active: true,
    bg: 'var(--ocre-light)',
    border: '1px solid rgba(196,122,90,0.15)',
  },
  {
    id: 'autonoma',
    emoji: '📊',
    title: 'Simulateur autónoma',
    desc: 'Calcul charges et net en poche',
    active: false,
    bg: 'var(--vert-light)',
    border: '1px solid rgba(90,122,64,0.15)',
  },
  {
    id: 'comparateur',
    emoji: '⚖️',
    title: 'Comparateur de statuts',
    desc: 'France AE vs Espagne autónomo',
    active: false,
    bg: 'var(--ocre-light)',
    border: '1px solid rgba(196,122,90,0.15)',
  },
  {
    id: 'fiscal',
    emoji: '📅',
    title: 'Calendrier fiscal',
    desc: 'Échéances IVA, IRPF, cotización',
    active: false,
    bg: 'var(--vert-light)',
    border: '1px solid rgba(90,122,64,0.15)',
  },
]

function ToolCard({ o, isPremium, onPaywall }) {
  if (o.active) {
    if (!isPremium) {
      // Active but paywall
      return (
        <div
          onClick={onPaywall}
          style={{
            background: o.bg, borderRadius: 14, padding: '18px 14px',
            border: o.border, minHeight: 110,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            cursor: 'pointer', position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute', top: 10, right: 10, fontSize: 16,
          }}>🔒</span>
          <div style={{ fontSize: 26, marginBottom: 8 }}>{o.emoji}</div>
          <div style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: 18, color: 'var(--foret)' }}>
            {o.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 4, lineHeight: 1.40 }}>
            {o.desc}
          </div>
          <div style={{ fontSize: 12, color: 'var(--foret)', marginTop: 6, fontWeight: 600 }}>
            Premium
          </div>
        </div>
      )
    }
    // Active + premium: accessible
    return (
      <Link to={o.href} style={{ textDecoration: 'none' }}>
        <div style={{
          background: o.bg, borderRadius: 14, padding: '18px 14px',
          border: o.border, minHeight: 110,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>{o.emoji}</div>
          <div style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: 18, color: 'var(--foret)' }}>
            {o.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 4, lineHeight: 1.40 }}>
            {o.desc}
          </div>
          <div style={{ fontSize: 13, color: 'var(--foret)', marginTop: 6, fontWeight: 600 }}>
            Ouvrir →
          </div>
        </div>
      </Link>
    )
  }
  // Coming soon
  return (
    <div style={{
      background: 'var(--gris)', borderRadius: 14, padding: '18px 14px',
      minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: 10, right: 10,
        fontSize: 12, background: 'rgba(0,0,0,0.10)', color: '#666',
        padding: '2px 8px', borderRadius: 20, fontWeight: 600,
      }}>À venir</span>
      <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.4 }}>{o.emoji}</div>
      <div style={{ fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--texte-sec)' }}>
        {o.title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 4, lineHeight: 1.40, opacity: 0.7 }}>
        {o.desc}
      </div>
    </div>
  )
}

export default function Outils() {
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 14 }}>Explorer</span></button>
        <PageHeading label="tes" title="Simulateurs" accentColor={VERT} traitColor={VERT} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)' }}>
          Simulateurs & calculateurs pour votre installation
        </p>
        {!isPremium && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'var(--vert-light)', borderRadius: 10,
            border: '1px solid rgba(90,122,64,0.2)',
            fontSize: 13, color: 'var(--foret)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>🔒</span>
            <span>
              Les outils sont réservés aux membres Premium.{' '}
              <span
                onClick={() => setShowPaywall(true)}
                style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              >
                Découvrir l'offre →
              </span>
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {OUTILS.map(o => (
          <ToolCard key={o.id} o={o} isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
        ))}
      </div>

      <AccompagnementBanner
        texte="Ces simulateurs vous donnent des chiffres — mais votre situation personnelle mérite un regard humain."
        cta="Parlez-en avec moi →"
        style={{ marginTop: 20 }}
      />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
