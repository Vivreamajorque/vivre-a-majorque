import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead, TERRA, VERT } from '../components/WaveTitle'

const FORET = '#0F3D35'

const CATEGORIES = [
  {
    id: 'guides',
    emoji: '📖',
    titre: 'Mini guides thématiques',
    desc: 'Calas secrètes, gastronomie locale, Tramuntana, bien-être… Des guides interactifs pour vivre Majorque comme un initié.',
    badge: null,
    badgePremium: true,
    color: VERT,
    bg: 'rgba(90,173,165,0.08)',
    border: 'rgba(90,173,165,0.3)',
    to: '/app/explorer/lifestyle',
  },
  {
    id: 'circuits',
    emoji: '🗺️',
    titre: 'Circuits Majorque',
    desc: 'Itinéraires personnalisés par Adeline (@mallorcacherie) — française installée depuis 8 ans, elle connaît l\'île comme sa poche.',
    badge: null,
    badgePremium: false,
    color: TERRA,
    bg: 'rgba(199,110,78,0.08)',
    border: 'rgba(199,110,78,0.3)',
    to: '/app/explorer/circuits',
  },
  {
    id: 'livres',
    emoji: '📚',
    titre: 'Livres',
    desc: 'Guides de voyage, livres pratiques et carnets d\'expat sélectionnés pour votre installation à Majorque.',
    badge: 'Bientôt !',
    badgePremium: false,
    color: '#7BA05B',
    bg: 'rgba(123,160,91,0.08)',
    border: 'rgba(123,160,91,0.25)',
    to: null,
  },
  {
    id: 'produits',
    emoji: '🧴',
    titre: 'Produits',
    desc: 'Sélection de produits locaux majorquins — épicerie fine, artisanat, care. Un coin boutique curatée.',
    badge: 'Bientôt !',
    badgePremium: false,
    color: '#b07d2a',
    bg: 'rgba(176,125,42,0.08)',
    border: 'rgba(176,125,42,0.25)',
    to: null,
  },
]

export default function Boutiques() {
  const navigate = useNavigate()

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 28 }}>
        <button onClick={() => navigate('/app/explorer')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: VERT, fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', marginBottom: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Explorer
        </button>

        <p style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 18, color: TERRA,
          lineHeight: 1, marginBottom: 4,
        }}>
          curatée pour vous
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 36, color: FORET,
          lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px',
        }}>
          Boutique
        </h1>
        <div style={{ width: 36, height: 3, background: TERRA, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          Guides interactifs, circuits personnalisés et ressources sélectionnées pour vivre Majorque autrement.
        </p>
      </div>

      {/* ── Catégories ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ cat, navigate }) {
  const isComingSoon = !!cat.badge
  const handleClick = () => {
    if (!isComingSoon && cat.to) navigate(cat.to)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background: '#fff',
        borderRadius: 18,
        border: `1.5px solid ${cat.border}`,
        overflow: 'hidden',
        cursor: isComingSoon ? 'default' : 'pointer',
        opacity: isComingSoon ? 0.75 : 1,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (!isComingSoon) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Bandeau coloré en haut */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
      }} />

      <div style={{
        display: 'flex', alignItems: 'flex-start',
        gap: 16, padding: '18px 18px 16px',
      }}>
        {/* Icône */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: cat.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
        }}>
          {cat.emoji}
        </div>

        {/* Texte */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 18, color: FORET, fontWeight: 400,
              lineHeight: 1,
            }}>
              {cat.titre}
            </p>
            {cat.badge && (
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: cat.color,
                background: cat.bg,
                border: `1px solid ${cat.border}`,
                padding: '3px 9px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
                letterSpacing: '0.03em',
                flexShrink: 0,
              }}>
                {cat.badge}
              </span>
            )}
            {cat.badgePremium && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: '#b07d2a',
                background: 'rgba(176,125,42,0.1)',
                border: '1px solid rgba(176,125,42,0.25)',
                padding: '3px 9px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
                flexShrink: 0,
              }}>
                💎 Premium
              </span>
            )}
          </div>
          <p style={{
            fontSize: 13, color: 'var(--texte-sec)',
            lineHeight: 1.55,
          }}>
            {cat.desc}
          </p>
        </div>

        {/* Flèche */}
        {!isComingSoon && (
          <span style={{
            color: cat.color, fontSize: 20,
            flexShrink: 0, marginTop: 4, opacity: 0.8,
          }}>
            ›
          </span>
        )}
      </div>
    </div>
  )
}
