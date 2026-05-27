import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

const TERRA = '#C76E4E'
const VERT  = '#5AADA5'

/* ── Wave SVG identique carrousel ──────────────────────── */
function Wave({ color }) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 8, marginTop: -3 }}>
      <path d="M0,5 C20,0 40,10 60,5 C80,0 100,10 120,5"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Mot Caveat + vague — le bloc de base ──────────────── */
function AccentWord({ children, color, size = 28 }) {
  return (
    <span style={{ display: 'inline-block' }}>
      <span style={{
        fontFamily: 'var(--font-accent)',
        fontWeight: 700,
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'block',
      }}>
        {children}
      </span>
      <Wave color={color} />
    </span>
  )
}

/* ── Titre 2 lignes : label Cormorant + mot Caveat+wave ─── */
function SectionTitle({ label, accent, color, size }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-titre)',
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 14, color: 'var(--texte-sec)',
        }}>
          {label}
        </span>
      )}
      <AccentWord color={color} size={size}>{accent}</AccentWord>
    </div>
  )
}

/* ── Jauge Cockpit ─────────────────────────────────────── */
function CockpitMini({ profileNotion, profileId }) {
  const { data, loading } = useNotionDB(NOTION_DB.cockpit)
  const steps = useMemo(() => (
    data.map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible === profileNotion)
      .sort((a, b) => a.ordre - b.ordre)
  ), [data, profileNotion])

  const [checked, setChecked] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`vmaq_done_${profileId}`) || '[]')) }
    catch { return new Set() }
  })
  React.useEffect(() => {
    try { setChecked(new Set(JSON.parse(localStorage.getItem(`vmaq_done_${profileId}`) || '[]'))) }
    catch {}
  }, [profileId])

  const total = steps.length
  const done  = steps.filter(s => checked.has(s.id)).length
  const pct   = total ? Math.round((done / total) * 100) : 0
  const next  = steps.find(s => !checked.has(s.id))
  if (loading) return null

  return (
    <Link to="/app/moi" style={{ textDecoration: 'none', display: 'block', marginBottom: 22 }}>
      <div style={{
        background: '#fff',
        border: `1.5px solid ${VERT}40`,
        borderRadius: 16, padding: '16px 18px',
        boxShadow: `0 2px 14px ${VERT}18`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontWeight: 300, fontSize: 13, color: 'var(--texte-sec)',
              display: 'block',
            }}>
              mon
            </span>
            {/* 2e mot = VERT (alternance 2) */}
            <AccentWord color={VERT} size={24}>installation</AccentWord>
          </div>
          <span style={{
            fontFamily: 'var(--font-accent)', fontWeight: 700,
            fontSize: 28, color: VERT, marginTop: 2,
          }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-sec)' }}>
          <span>{done}/{total} étapes validées</span>
          {next && <span style={{ color: VERT, fontWeight: 600 }}>→ {next.etape}</span>}
        </div>
      </div>
    </Link>
  )
}

/* ── Carte Actu ─────────────────────────────────────────── */
function ActuCard({ actu, index }) {
  const color = index % 2 === 0 ? TERRA : VERT
  return (
    <div style={{
      minWidth: 220, maxWidth: 220,
      background: '#fff',
      border: `1.5px solid ${color}30`,
      borderRadius: 16,
      flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: `0 2px 12px ${color}12`,
    }}>
      {/* Barre couleur top */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

      <div style={{ padding: '14px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Badge + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {actu.categorie ? (
            <span style={{
              fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: 13,
              color, lineHeight: 1,
            }}>
              {actu.categorie}
            </span>
          ) : <span />}
          {actu.date && (
            <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>
              {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Vague sous la catégorie */}
        {actu.categorie && <Wave color={color} />}

        {/* Titre */}
        <p style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          fontWeight: 600, fontSize: 14,
          color: 'var(--texte)', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {actu.title}
        </p>

        {/* Résumé */}
        {actu.resume && (
          <p style={{
            fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            margin: 0,
          }}>
            {actu.resume}
          </p>
        )}

        {/* Source — pas de lien sortant */}
        {actu.sourceDomain && (
          <div style={{
            marginTop: 'auto', paddingTop: 8,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-accent)', fontWeight: 700,
              fontSize: 12, color: 'var(--texte-sec)',
            }}>
              {actu.sourceDomain}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ActuCarousel({ actus, loading }) {
  if (loading) return <div className="spinner">Chargement…</div>
  if (!actus.length) return null
  return (
    <div style={{ marginBottom: 26 }}>
      {/* Titre section avec wave */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <AccentWord color={VERT} size={24}>Actus de la semaine</AccentWord>
        <Link to="/app/actus" style={{
          fontFamily: 'var(--font-accent)', fontWeight: 700,
          fontSize: 14, color: TERRA, textDecoration: 'none',
          paddingBottom: 6,
        }}>
          Toutes →
        </Link>
      </div>
      <div style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {actus.map((a, i) => <ActuCard key={a.id} actu={a} index={i} />)}
      </div>
    </div>
  )
}

/* ── Grille — alternance terra/vert/terra/vert ──────────── */
const NAV_CARDS = [
  {
    to: '/app/guides',
    icon: '📚', label: 'Admin, logement, santé…',
    accent: 'Guides',
    color: TERRA,  /* 3 = terra */
    bg: `${TERRA}10`, border: `${TERRA}30`,
  },
  {
    to: '/app/explorer',
    icon: '🌴', label: 'Lifestyle & sorties',
    accent: 'Explorer',
    color: VERT,   /* 4 = vert */
    bg: `${VERT}10`, border: `${VERT}30`,
  },
  {
    to: '/app/moi',
    icon: '✅', label: 'Mes étapes',
    accent: 'Cockpit',
    color: TERRA,  /* 5 = terra */
    bg: `${TERRA}10`, border: `${TERRA}30`,
  },
  {
    to: '/app/explorer/outils',
    icon: '🧮', label: 'Budget, autónoma…',
    accent: 'Simulateurs',
    color: VERT,   /* 6 = vert */
    bg: `${VERT}10`, border: `${VERT}30`,
  },
]

/* ── Page Home ──────────────────────────────────────────── */
export default function Home() {
  const { profile, prenom } = useProfile()
  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 6), [actusData])

  return (
    <div className="page">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        {profile && (
          <span style={{
            fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            fontSize: 14, color: 'var(--texte-sec)', display: 'block', marginBottom: 4,
          }}>
            {profile.emoji} {profile.label}
          </span>
        )}
        {/* Ligne 1 Cormorant + Ligne 2 Caveat TERRA (alternance 1) */}
        {profile ? (
          <AccentWord color={TERRA} size={40}>
            Bonjour {prenom || ''} 🌴
          </AccentWord>
        ) : (
          <>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontWeight: 300, fontSize: 22, color: 'var(--texte)', lineHeight: 1.2,
            }}>
              Tout ce qu'il faut pour
            </span>
            <AccentWord color={TERRA} size={40}>vraiment partir</AccentWord>
          </>
        )}
      </div>

      {/* ── Actus ──────────────────────────────────────── */}
      <ActuCarousel actus={actus} loading={actusLoading} />

      {/* ── Cockpit mini (VERT — alternance 2) ─────────── */}
      {profile && <CockpitMini profileNotion={profile.notion} profileId={profile.id} />}

      {/* ── Grille 2×2 (terra/vert/terra/vert) ─────────── */}
      <p className="section-title" style={{ marginBottom: 10 }}>Accès rapide</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {NAV_CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: card.bg, border: `1.5px solid ${card.border}`,
              borderRadius: 16, padding: '16px 14px',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
              <AccentWord color={card.color} size={21}>{card.accent}</AccentWord>
              <span style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 12, color: 'var(--texte-sec)', display: 'block', marginTop: 4,
              }}>
                {card.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
