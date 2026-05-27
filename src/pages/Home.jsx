import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

function CockpitMini({ profileNotion }) {
  const { data, loading } = useNotionDB(NOTION_DB.cockpit)
  const steps = useMemo(() => {
    return data
      .map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible === profileNotion)
      .sort((a, b) => a.ordre - b.ordre)
  }, [data, profileNotion])
  const total = steps.length
  const done = steps.filter(s => s.statut === '✅ Validé').length
  const pct = total ? Math.round((done / total) * 100) : 0
  const next = steps.find(s => s.statut === '⬜ À faire' || s.statut === '🔄 En cours')
  if (loading) return null
  return (
    <Link to="/app/moi" style={{ textDecoration: 'none' }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>
            Mon installation
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--vert-dark)' }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          {done}/{total} étapes validées
          {next && (
            <span style={{ marginLeft: 8, color: 'var(--vert-dark)', fontWeight: 500 }}>
              → {next.etape}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ActuCarousel({ actus, loading }) {
  if (loading) return (
    <div style={{ paddingBottom: 20 }}>
      <div className="spinner">Chargement…</div>
    </div>
  )
  if (!actus.length) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="section-title" style={{ marginBottom: 10 }}>Actus de la semaine</p>
      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {actus.map(actu => {
          const card = (
            <div style={{
              minWidth: 220,
              maxWidth: 220,
              background: '#fff',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gris)',
              padding: '14px 14px',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                {actu.categorie ? (
                  <span className="badge badge-vert" style={{ fontSize: 10 }}>{actu.categorie}</span>
                ) : <span />}
                {actu.date && (
                  <span style={{ fontSize: 11, color: 'var(--texte-sec)', whiteSpace: 'nowrap' }}>
                    {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--foret)', lineHeight: 1.4, marginBottom: actu.accroche ? 6 : 0,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {actu.title}
              </p>
              {actu.accroche && (
                <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {actu.accroche}
                </p>
              )}
              {actu.lien && (
                <p style={{ fontSize: 11, color: 'var(--vert-dark)', marginTop: 8 }}>Lire →</p>
              )}
            </div>
          )
          if (actu.lien) {
            return (
              <a key={actu.id} href={actu.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {card}
              </a>
            )
          }
          return <div key={actu.id}>{card}</div>
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const { profile } = useProfile()
  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 6), [actusData])

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 26, color: 'var(--foret)' }}>
              {profile ? 'Bonjour 🌴' : 'Vivre à Majorque'}
            </h1>
            {profile && (
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 2 }}>{profile.emoji} {profile.label}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actus carousel en haut */}
      <ActuCarousel actus={actus} loading={actusLoading} />

      {/* Cockpit mini */}
      {profile && <CockpitMini profileNotion={profile.notion} />}

      {/* Grille 2x2 navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <Link to="/app/guides" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--foret)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            color: '#fff',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500 }}>Guides</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Admin, logement, santé…</div>
          </div>
        </Link>
        <Link to="/app/explorer" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--terra)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            color: '#fff',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🌴</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500 }}>Explorer</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Annuaires, boutiques…</div>
          </div>
        </Link>
        <Link to="/app/moi" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--lin)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            border: '1px solid var(--gris)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500, color: 'var(--foret)' }}>Cockpit</div>
            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>Mes étapes</div>
          </div>
        </Link>
        <Link to="/app/explorer/outils" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--gris)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            border: '1px solid var(--gris)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🧮</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500, color: 'var(--foret)' }}>Simulateurs</div>
            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>Budget, installation…</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
