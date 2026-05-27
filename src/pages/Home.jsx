import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

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
    try {
      setChecked(new Set(JSON.parse(localStorage.getItem(`vmaq_done_${profileId}`) || '[]')))
    } catch {}
  }, [profileId])

  const total = steps.length
  const done  = steps.filter(s => checked.has(s.id)).length
  const pct   = total ? Math.round((done / total) * 100) : 0
  const next  = steps.find(s => !checked.has(s.id))
  if (loading) return null

  return (
    <Link to="/app/moi" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(126,200,192,0.12) 0%, rgba(90,173,165,0.06) 100%)',
        border: '1px solid rgba(126,200,192,0.25)',
        borderRadius: 16, padding: '16px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{
            fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            fontSize: 17, color: 'var(--texte)', fontWeight: 400,
          }}>
            Mon installation
          </span>
          <span style={{
            fontFamily: 'var(--font-accent)', fontWeight: 700,
            fontSize: 20, color: '#7EC8C0',
          }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--texte-sec)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{done}/{total} étapes validées</span>
          {next && (
            <span style={{ color: '#7EC8C0', fontWeight: 600 }}>→ {next.etape}</span>
          )}
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
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14,
      padding: '14px 14px',
      flexShrink: 0,
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      backdropFilter: 'blur(8px)',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(126,200,192,0.35)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
    >
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
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {actu.title}
        </p>
        {actu.resume && (
          <p style={{
            fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {actu.resume}
          </p>
        )}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#7EC8C0', marginTop: 10 }}>Lire →</p>
    </div>
  )
}

function ActuCarousel({ actus, loading }) {
  const navigate = useNavigate()
  if (loading) return <div className="spinner">Chargement…</div>
  if (!actus.length) return null
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>Actus de la semaine</p>
        <Link to="/app/actus" style={{ fontSize: 12, color: '#7EC8C0', fontWeight: 600 }}>
          Toutes →
        </Link>
      </div>
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
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
    icon: '📚',
    label: 'Guides',
    sub: '50+ fiches admin',
    bg: 'linear-gradient(135deg, rgba(126,200,192,0.18) 0%, rgba(90,173,165,0.08) 100%)',
    border: 'rgba(126,200,192,0.3)',
    dot: '#7EC8C0',
  },
  {
    to: '/app/explorer',
    icon: '🌴',
    label: 'Explorer',
    sub: 'Lifestyle & sorties',
    bg: 'linear-gradient(135deg, rgba(199,110,78,0.18) 0%, rgba(181,96,58,0.08) 100%)',
    border: 'rgba(199,110,78,0.3)',
    dot: '#C76E4E',
  },
  {
    to: '/app/moi',
    icon: '✅',
    label: 'Cockpit',
    sub: 'Mes étapes',
    bg: 'linear-gradient(135deg, rgba(45,80,22,0.25) 0%, rgba(28,46,26,0.15) 100%)',
    border: 'rgba(90,140,50,0.3)',
    dot: '#8FBC5A',
  },
  {
    to: '/app/explorer/outils',
    icon: '🧮',
    label: 'Simulateurs',
    sub: 'Budget, autónoma…',
    bg: 'linear-gradient(135deg, rgba(176,125,42,0.18) 0%, rgba(140,95,28,0.08) 100%)',
    border: 'rgba(176,125,42,0.3)',
    dot: '#b07d2a',
  },
]

/* ── Page Home ──────────────────────────────────────────── */
export default function Home() {
  const { profile } = useProfile()
  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 6), [actusData])

  return (
    <div className="page" style={{ background: 'transparent' }}>

      {/* Halos décoratifs fixés */}
      <div style={{
        position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,173,165,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: 200, left: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,110,78,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header" style={{ background: 'transparent', paddingTop: 52 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge pill profil */}
          {profile && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(126,200,192,0.12)',
              border: '1px solid rgba(126,200,192,0.3)',
              borderRadius: 20, padding: '4px 12px', marginBottom: 10,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7EC8C0' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7EC8C0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {profile.emoji} {profile.label}
              </span>
            </div>
          )}
          {/* Titre */}
          <h1 style={{
            fontFamily: 'var(--font-titre)',
            fontStyle: 'italic', fontWeight: 300,
            fontSize: 32, color: 'var(--texte)', lineHeight: 1.2,
          }}>
            {profile ? `Bonjour 🌴` : 'Vivre à Majorque'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 4 }}>
            Tout ce qu'il faut pour <span style={{
              fontFamily: 'var(--font-accent)', fontWeight: 700,
              fontSize: 16, color: '#C76E4E',
            }}>vraiment partir.</span>
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Actus ──────────────────────────────────────── */}
        <ActuCarousel actus={actus} loading={actusLoading} />

        {/* ── Cockpit mini ───────────────────────────────── */}
        {profile && <CockpitMini profileNotion={profile.notion} profileId={profile.id} />}

        {/* ── Grille 2×2 ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {NAV_CARDS.map(card => (
            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 16,
                padding: '18px 16px',
                transition: 'transform 0.15s, opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.92' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                  fontSize: 17, fontWeight: 400, color: 'var(--texte)',
                  marginBottom: 4,
                }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--texte-sec)' }}>{card.sub}</div>
                {/* Dot couleur */}
                <div style={{
                  marginTop: 12, width: 24, height: 3, borderRadius: 2,
                  background: card.dot, opacity: 0.7,
                }} />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Annuaire CTA ───────────────────────────────── */}
        <Link to="/app/annuaire" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
          <div style={{
            background: 'rgba(176,125,42,0.10)',
            border: '1px solid rgba(176,125,42,0.25)',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 16, color: 'var(--texte)', marginBottom: 2 }}>
                Annuaire francophone
              </div>
              <div style={{ fontSize: 12, color: 'var(--texte-sec)' }}>Pros vérifiés à Majorque</div>
            </div>
            <span style={{ fontSize: 22 }}>📍</span>
          </div>
        </Link>

      </div>
    </div>
  )
}
