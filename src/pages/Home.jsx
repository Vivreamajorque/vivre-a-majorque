import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

/* ── Wave underline SVG — identique carrousel ─────────── */
function Wave({ color }) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 8, marginTop: -3 }}>
      <path d="M0,5 C20,0 40,10 60,5 C80,0 100,10 120,5"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Titre section style carrousel ─────────────────────── */
function SectionHeading({ label, accent, color = 'terra' }) {
  const hex = color === 'terra' ? '#C76E4E' : '#5AADA5'
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{
        display: 'block',
        fontFamily: 'var(--font-titre)',
        fontStyle: 'italic', fontWeight: 300,
        fontSize: 15, color: 'var(--texte-sec)',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
      <span style={{ display: 'inline-block' }}>
        <span style={{
          fontFamily: 'var(--font-accent)',
          fontWeight: 700, fontSize: 28,
          color: hex, lineHeight: 1.05,
        }}>
          {accent}
        </span>
        <Wave color={hex} />
      </span>
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
    <Link to="/app/moi" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
      <div style={{
        background: '#fff',
        border: '1.5px solid rgba(126,200,192,0.35)',
        borderRadius: 16, padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(126,200,192,0.10)',
      }}>
        {/* Titre avec wave */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-titre)',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 13, color: 'var(--texte-sec)',
            }}>
              mon
            </span>
            <span style={{ display: 'inline-block' }}>
              <span style={{
                fontFamily: 'var(--font-accent)',
                fontWeight: 700, fontSize: 22,
                color: '#5AADA5', lineHeight: 1,
              }}>
                installation
              </span>
              <Wave color="#5AADA5" />
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-accent)',
            fontWeight: 700, fontSize: 26,
            color: '#5AADA5', marginTop: 4,
          }}>
            {pct}%
          </span>
        </div>

        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-sec)' }}>
          <span>{done}/{total} étapes validées</span>
          {next && <span style={{ color: 'var(--vert-dark)', fontWeight: 600 }}>→ {next.etape}</span>}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
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
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--terra)', marginTop: 10 }}>Lire →</p>
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
        <Link to="/app/actus" style={{ fontSize: 12, color: 'var(--terra)', fontWeight: 700 }}>
          Toutes →
        </Link>
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

/* ── Grille navigation ──────────────────────────────────── */
const NAV_CARDS = [
  {
    to: '/app/guides',
    icon: '📚', label: 'Guides', sub: '50+ fiches admin',
    accent: 'var(--vert-dark)', wave: '#5AADA5',
    bg: 'rgba(126,200,192,0.08)', border: 'rgba(126,200,192,0.25)',
  },
  {
    to: '/app/explorer',
    icon: '🌴', label: 'Explorer', sub: 'Lifestyle & sorties',
    accent: 'var(--terra)', wave: '#C76E4E',
    bg: 'rgba(199,110,78,0.08)', border: 'rgba(199,110,78,0.22)',
  },
  {
    to: '/app/moi',
    icon: '✅', label: 'Cockpit', sub: 'Mes étapes',
    accent: '#5A8A3A', wave: '#5A8A3A',
    bg: 'rgba(90,138,58,0.08)', border: 'rgba(90,138,58,0.22)',
  },
  {
    to: '/app/explorer/outils',
    icon: '🧮', label: 'Simulateurs', sub: 'Budget, autónoma…',
    accent: 'var(--gold)', wave: '#b07d2a',
    bg: 'rgba(176,125,42,0.08)', border: 'rgba(176,125,42,0.22)',
  },
]

/* ── Page Home ──────────────────────────────────────────── */
export default function Home() {
  const { profile } = useProfile()
  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 6), [actusData])

  return (
    <div className="page">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ paddingTop: 4 }}>
          {profile && (
            <span style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontSize: 14, color: 'var(--texte-sec)',
            }}>
              {profile.emoji} {profile.label}
            </span>
          )}
          {/* Titre principal style carrousel */}
          <div style={{ marginTop: 4 }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-titre)',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 22, color: 'var(--texte)',
              lineHeight: 1.2,
            }}>
              {profile ? 'Bonjour 🌴 — prêt à' : 'Tout ce qu\'il faut pour'}
            </span>
            <span style={{ display: 'inline-block' }}>
              <span style={{
                fontFamily: 'var(--font-accent)',
                fontWeight: 700, fontSize: 38,
                color: '#C76E4E', lineHeight: 1,
              }}>
                {profile ? 'avancer' : 'vraiment partir'}
              </span>
              <Wave color="#C76E4E" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Actus ──────────────────────────────────────── */}
      <ActuCarousel actus={actus} loading={actusLoading} />

      {/* ── Cockpit mini ───────────────────────────────── */}
      {profile && <CockpitMini profileNotion={profile.notion} profileId={profile.id} />}

      {/* ── Grille 2×2 ─────────────────────────────────── */}
      <div style={{ marginBottom: 6 }}>
        <p className="section-title">Accès rapide</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {NAV_CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: card.bg,
              border: `1.5px solid ${card.border}`,
              borderRadius: 16, padding: '16px 14px',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
              {/* Label avec wave */}
              <span style={{ display: 'inline-block', marginBottom: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-accent)',
                  fontWeight: 700, fontSize: 20,
                  color: card.wave, lineHeight: 1,
                }}>
                  {card.label}
                </span>
                <Wave color={card.wave} />
              </span>
              <div style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 12, color: 'var(--texte-sec)',
              }}>
                {card.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Annuaire CTA ───────────────────────────────── */}
      <Link to="/app/annuaire" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
        <div style={{
          background: 'rgba(176,125,42,0.07)',
          border: '1.5px solid rgba(176,125,42,0.25)',
          borderRadius: 14, padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <span style={{ display: 'inline-block', marginBottom: 2 }}>
              <span style={{
                fontFamily: 'var(--font-accent)',
                fontWeight: 700, fontSize: 18,
                color: '#b07d2a', lineHeight: 1,
              }}>
                Annuaire
              </span>
              <Wave color="#b07d2a" />
            </span>
            <div style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontSize: 13, color: 'var(--texte-sec)',
            }}>
              Pros francophones à Majorque
            </div>
          </div>
          <span style={{ fontSize: 24 }}>📍</span>
        </div>
      </Link>

    </div>
  )
}
