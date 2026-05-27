import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
function ActuCard({ actu, navigate }) {
  const handleClick = () => {
    if (actu.lien) window.open(actu.lien, '_blank', 'noopener,noreferrer')
    else navigate('/app/actus')
  }
  return (
    <div onClick={handleClick} style={{
      minWidth: 210, maxWidth: 210,
      background: '#fff', border: '1px solid var(--gris)',
      borderRadius: 14, padding: '14px',
      flexShrink: 0, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {actu.categorie
            ? <span className="badge badge-vert" style={{ fontSize: 10 }}>{actu.categorie}</span>
            : <span />}
          {actu.date && (
            <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>
              {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--font-titre)', fontWeight: 600,
          fontSize: 14, color: 'var(--texte)', lineHeight: 1.4,
          marginBottom: actu.resume ? 6 : 0,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {actu.title}
        </p>
        {actu.resume && (
          <p style={{
            fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {actu.resume}
          </p>
        )}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: TERRA, marginTop: 10 }}>Lire →</p>
    </div>
  )
}

function ActuCarousel({ actus, loading }) {
  const navigate = useNavigate()
  if (loading) return <div className="spinner">Chargement…</div>
  if (!actus.length) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>Actus de la semaine</p>
        <Link to="/app/actus" style={{ fontSize: 12, color: TERRA, fontWeight: 700 }}>Toutes →</Link>
      </div>
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {actus.map(a => <ActuCard key={a.id} actu={a} navigate={navigate} />)}
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
        <span style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          fontWeight: 300, fontSize: 22, color: 'var(--texte)',
          display: 'block', lineHeight: 1.2,
        }}>
          {profile
            ? `Bonjour ${prenom ? prenom : ''} 🌴`
            : 'Tout ce qu\'il faut pour'}
        </span>
        <AccentWord color={TERRA} size={40}>
          {profile ? 'prêt à avancer ?' : 'vraiment partir'}
        </AccentWord>
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
