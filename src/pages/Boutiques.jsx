import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'

/* ── Nouveauté mise en avant ──────────────────
   Mettre isNew: true sur UN SEUL élément à la fois.
   La nouveauté s'affiche dans le bandeau du haut.
────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'guides',
    emoji: '📖',
    titre: 'Mini guides',
    desc: 'Calas, gastronomie, Tramuntana, bien-être…',
    badge: null,
    badgePremium: true,
    color: VERT,
    bg: 'rgba(90,173,165,0.08)',
    border: 'rgba(90,173,165,0.3)',
    to: '/app/explorer/lifestyle',
    isNew: false,
  },
  {
    id: 'circuits',
    emoji: '🗺️',
    titre: 'Circuits',
    desc: 'Itinéraires personnalisés par Adeline',
    badge: null,
    badgePremium: false,
    color: TERRA,
    bg: 'rgba(199,110,78,0.08)',
    border: 'rgba(199,110,78,0.3)',
    to: '/app/explorer/circuits',
    isNew: true,
  },
  {
    id: 'livres',
    emoji: '📚',
    titre: 'Livres',
    desc: 'Guides de voyage, carnets d\'expat…',
    badge: 'Bientôt',
    badgePremium: false,
    color: '#7BA05B',
    bg: 'rgba(123,160,91,0.08)',
    border: 'rgba(123,160,91,0.25)',
    to: null,
    isNew: false,
  },
  {
    id: 'produits',
    emoji: '🧴',
    titre: 'Produits',
    desc: 'Épicerie fine, artisanat, care local',
    badge: 'Bientôt',
    badgePremium: false,
    color: '#b07d2a',
    bg: 'rgba(176,125,42,0.08)',
    border: 'rgba(176,125,42,0.25)',
    to: null,
    isNew: false,
  },
]

/* ── Encart Nouveauté ───────────────────────── */
function NouveauteCard({ cat, navigate }) {
  return (
    <div
      onClick={() => cat.to && navigate(cat.to)}
      style={{
        background: FORET,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 28,
        position: 'relative',
      }}
    >
      {/* Deco cercle */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(90,173,165,0.12)', pointerEvents: 'none',
      }} />

      <div style={{ padding: '20px 20px 18px', position: 'relative' }}>
        {/* Badge nouveauté */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(90,173,165,0.2)',
          border: '1px solid rgba(90,173,165,0.35)',
          borderRadius: 20, padding: '4px 12px',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#7EC8C0', letterSpacing: '0.08em', fontFamily: 'var(--font-corps)', textTransform: 'uppercase' }}>
            ✦ Nouveauté
          </span>
        </div>

        {/* Emoji + titre */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `${cat.color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>
            {cat.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 22, color: '#F7F2EB', fontWeight: 400,
              lineHeight: 1.1, marginBottom: 5,
            }}>
              {cat.titre}
            </p>
            <p style={{
              fontSize: 13, color: 'rgba(247,242,235,0.65)',
              lineHeight: 1.5,
            }}>
              {cat.desc}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#7EC8C0',
            fontFamily: 'var(--font-corps)',
          }}>
            Découvrir →
          </span>
          {cat.badgePremium && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: '#F7F2EB', background: 'rgba(176,125,42,0.35)',
              border: '1px solid rgba(176,125,42,0.5)',
              padding: '3px 10px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              💎 Premium
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Carte catégorie 2×2 ────────────────────── */
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
        borderRadius: 16,
        border: `1.5px solid ${cat.border}`,
        overflow: 'hidden',
        cursor: isComingSoon ? 'default' : 'pointer',
        opacity: isComingSoon ? 0.72 : 1,
        transition: 'transform 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { if (!isComingSoon) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Trait coloré haut */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}66)`,
      }} />

      <div style={{ padding: '16px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Emoji */}
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: cat.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, marginBottom: 10,
        }}>
          {cat.emoji}
        </div>

        {/* Titre */}
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 16, color: FORET, fontWeight: 400,
          lineHeight: 1.2, marginBottom: 5,
        }}>
          {cat.titre}
        </p>

        {/* Description */}
        <p style={{
          fontSize: 12, color: 'var(--texte-sec)',
          lineHeight: 1.5, flex: 1, marginBottom: 10,
        }}>
          {cat.desc}
        </p>

        {/* Footer badges + flèche */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {cat.badge && (
              <span style={{
                fontSize: 10, fontWeight: 800,
                color: cat.color, background: cat.bg,
                border: `1px solid ${cat.border}`,
                padding: '2px 7px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>
                {cat.badge}
              </span>
            )}
            {cat.badgePremium && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#b07d2a',
                background: 'rgba(176,125,42,0.1)',
                border: '1px solid rgba(176,125,42,0.25)',
                padding: '2px 7px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>
                💎
              </span>
            )}
          </div>
          {!isComingSoon && (
            <span style={{ color: cat.color, fontSize: 16, opacity: 0.7 }}>›</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page principale ────────────────────────── */
export default function Boutiques() {
  useSEO({
    title: "Boutique — Guides et ressources Majorque",
    description: "Mini guides lifestyle, circuits personnalisés et ressources pratiques pour vivre à Majorque. Calas hors-piste, gastronomie locale, fêtes de village, Tramuntana.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/boutiques",
  })
  const navigate = useNavigate()

  const nouveaute = CATEGORIES.find(c => c.isNew)
  const autresCats = CATEGORIES.filter(c => !c.isNew)

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 24 }}>
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
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          Guides interactifs, circuits personnalisés et ressources sélectionnées.
        </p>
      </div>

      {/* ── Nouveauté ── */}
      {nouveaute && (
        <>
          <SectionHead title="Nouveauté" />
          <NouveauteCard cat={nouveaute} navigate={navigate} />
        </>
      )}

      {/* ── Toutes les catégories en 2×2 ── */}
      <SectionHead title="Toutes les catégories" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}
