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

function ActuCard({ actu }) {
  const content = (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span className="badge badge-vert" style={{ fontSize: 10 }}>{actu.categorie || 'Actu'}</span>
        {actu.date && (
          <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>
            {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--foret)', marginBottom: actu.accroche ? 6 : 0 }}>
        {actu.title}
      </p>
      {actu.accroche && (
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>{actu.accroche}</p>
      )}
    </div>
  )

  if (actu.lien) {
    return <a href={actu.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>
  }
  return content
}

export default function Home() {
  const { profile } = useProfile()
  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)

  const actus = useMemo(() => {
    return actusData.map(parseActu).slice(0, 5)
  }, [actusData])

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 26, color: 'var(--foret)' }}>
              {profile ? `Bonjour 🌴` : 'Vivre à Majorque'}
            </h1>
            {profile && (
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 2 }}>{profile.emoji} {profile.label}</p>
            )}
          </div>

        </div>
      </div>

      {profile && <CockpitMini profileNotion={profile.notion} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <Link to="/app/guides" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--vert)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            color: '#fff',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500 }}>Guides</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Admin, logement, santé…</div>
          </div>
        </Link>
        <Link to="/app/explorer" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--ocre)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            color: '#fff',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🌴</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500 }}>Explorer</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Lieux, pros, outils</div>
          </div>
        </Link>
        <Link to="/app/moi" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--miel-light)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            border: '1px solid var(--gris)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500, color: 'var(--foret)' }}>Cockpit</div>
            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>Mes étapes</div>
          </div>
        </Link>
        <Link to="/app/explorer?tab=outils" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--vert-light)',
            borderRadius: 'var(--radius)',
            padding: '18px 16px',
            border: '1px solid var(--gris)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🧮</div>
            <div style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 500, color: 'var(--foret)' }}>Simulateurs</div>
            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>Budget, autónoma…</div>
          </div>
        </Link>
      </div>

      <div>
        <p className="section-title">Actus de la semaine</p>
        {actusLoading ? (
          <div className="spinner">Chargement…</div>
        ) : actus.length > 0 ? (
          actus.map(a => <ActuCard key={a.id} actu={a} />)
        ) : (
          <div className="empty">Aucune actu pour le moment.</div>
        )}
      </div>
    </div>
  )
}
