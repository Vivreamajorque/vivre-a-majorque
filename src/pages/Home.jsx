import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait, SectionAccent } from '../components/WaveTitle'

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
        background: '#fff', borderRadius: 16,
        border: `1px solid ${VERT}30`,
        padding: '16px 18px',
        boxShadow: `0 2px 12px ${VERT}10`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <ContextLabel color={VERT} size={13}>mon</ContextLabel>
            <DisplayTitle size={22}>installation</DisplayTitle>
            <Trait color={VERT} width={28} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 28, color: VERT,
          }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--texte-sec)', fontFamily: 'var(--font-titre)', fontStyle: 'italic' }}>
          <span>{done}/{total} étapes validées</span>
          {next && <span style={{ color: VERT }}>→ {next.etape}</span>}
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
      minWidth: 224, maxWidth: 224,
      background: '#fff',
      border: `1px solid ${color}28`,
      borderRadius: 16,
      flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: `0 2px 10px rgba(28,20,16,0.06)`,
    }}>
      {/* Barre top */}
      <div style={{ height: 3, background: color }} />

      <div style={{ padding: '14px 16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Catégorie + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {actu.categorie ? (
            <div>
              <span style={{
                fontFamily: 'var(--font-accent)',
                fontWeight: 700, fontSize: 16, color,
              }}>
                {actu.categorie}
              </span>
              <div style={{ width: 24, height: 2.5, background: color, borderRadius: 2, marginTop: 2 }} />
            </div>
          ) : <span />}
          {actu.date && (
            <span style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontSize: 12, color: 'var(--texte-sec)',
            }}>
              {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Titre */}
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 16, color: 'var(--texte)', lineHeight: 1.40,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {actu.title}
        </p>

        {/* Résumé */}
        {actu.resume && (
          <p style={{
            fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.50,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            margin: 0,
          }}>
            {actu.resume}
          </p>
        )}

        {/* Source */}
        {actu.sourceDomain && (
          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
            <span style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
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
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <ContextLabel color={TERRA} size={12}>cette semaine</ContextLabel>
          <DisplayTitle size={22}>Actus</DisplayTitle>
          <Trait color={VERT} width={28} />
        </div>
        <Link to="/app/actus" style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          fontSize: 14, color: TERRA, paddingBottom: 4,
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

/* ── Grille navigation ──────────────────────────────────── */
const NAV_CARDS = [
  { to: '/app/guides',         icon: '📚', context: '100+ fiches admin', title: 'Guides',      color: TERRA },
  { to: '/app/explorer',       icon: '🌴', context: 'lifestyle & sorties',    title: 'Explorer',    color: VERT  },
  { to: '/app/moi',            icon: '✅', context: 'mes étapes',             title: 'Cockpit',     color: TERRA },
  { to: '/app/explorer/outils',icon: '🧮', context: 'budget, autónoma…',      title: 'Simulateurs', color: VERT  },
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
        {profile ? (
          <div>
            <ContextLabel color={VERT} size={14}>bienvenue,</ContextLabel>
            <DisplayTitle size={38}>{prenom || 'Bonjour'}</DisplayTitle>
            <AccentWord color={TERRA} size={22}>{profile.emoji} {profile.label}</AccentWord>
            <Trait color={TERRA} width={40} />
          </div>
        ) : (
          <div>
            {/* 3 couleurs : vert / encre / terra */}
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-titre)',
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 18, color: VERT,
              lineHeight: 1.25, marginBottom: 2,
            }}>
              l'appli pour
            </span>
            <DisplayTitle size={38}>s'installer</DisplayTitle>
            <AccentWord color={TERRA} size={38}>à Majorque</AccentWord>
            <Trait color={TERRA} width={40} />
          </div>
        )}
      </div>

      {/* ── Actus ──────────────────────────────────────── */}
      <ActuCarousel actus={actus} loading={actusLoading} />

      {/* ── Cockpit mini ───────────────────────────────── */}
      {profile && <CockpitMini profileNotion={profile.notion} profileId={profile.id} />}

      {/* ── Grille 2×2 ─────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <ContextLabel color={TERRA} size={12}>accès rapide</ContextLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {NAV_CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              border: `1px solid ${card.color}28`,
              borderRadius: 16, padding: '16px 14px',
              transition: 'transform 0.15s',
              boxShadow: '0 1px 6px rgba(28,20,16,0.05)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
              <DisplayTitle size={18}>{card.title}</DisplayTitle>
              <Trait color={card.color} width={24} />
              <span style={{
                display: 'block', marginTop: 6,
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 13, color: 'var(--texte-sec)',
              }}>
                {card.context}
              </span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
