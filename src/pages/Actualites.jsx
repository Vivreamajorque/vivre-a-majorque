import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

const CAT_COLORS = {
  'Admin':       { bg: '#EBF3E4', border: 'rgba(90,122,64,0.2)',  text: '#2D5016' },
  'Visa':        { bg: '#EBF3E4', border: 'rgba(90,122,64,0.2)',  text: '#2D5016' },
  'Logement':    { bg: '#F5E8E0', border: 'rgba(196,122,90,0.2)', text: '#7a3e22' },
  'Emploi':      { bg: '#F5E8E0', border: 'rgba(196,122,90,0.2)', text: '#7a3e22' },
  'Lifestyle':   { bg: '#FEF9E7', border: 'rgba(176,125,42,0.2)', text: '#7a6010' },
  'Nouveauté':   { bg: '#EBF3E4', border: 'rgba(45,80,22,0.2)',   text: '#2D5016' },
  'Application': { bg: '#EBF3E4', border: 'rgba(45,80,22,0.2)',   text: '#2D5016' },
  'Alerte':      { bg: '#FEE8E4', border: 'rgba(196,80,70,0.2)',  text: '#8a2010' },
}
function catStyle(cat) {
  return CAT_COLORS[cat] || { bg: 'var(--gris)', border: 'rgba(0,0,0,0.1)', text: 'var(--texte-sec)' }
}

function ActuCard({ actu }) {
  const cs = catStyle(actu.categorie)
  const dateStr = actu.date
    ? new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const inner = (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 'var(--radius)',
      padding: '18px 16px',
      marginBottom: 12,
    }}>
      {/* Header : catégorie + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {actu.categorie ? (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text,
          }}>
            {actu.categorie}
          </span>
        ) : <span />}
        {dateStr && (
          <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>{dateStr}</span>
        )}
      </div>

      {/* Titre */}
      <p style={{
        fontFamily: 'var(--font-titre)', fontSize: 16, fontWeight: 700,
        color: 'var(--foret)', lineHeight: 1.4, marginBottom: actu.accroche ? 8 : 0,
      }}>
        {actu.title}
      </p>

      {/* Accroche complète */}
      {actu.accroche && (
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.6, marginBottom: actu.lien ? 12 : 0 }}>
          {actu.accroche}
        </p>
      )}

      {/* Lien externe */}
      {actu.lien && (
        <span style={{
          display: 'inline-block', fontSize: 13, fontWeight: 600,
          color: 'var(--vert-dark)', textDecoration: 'none',
        }}>
          En savoir plus →
        </span>
      )}
    </div>
  )

  if (actu.lien) {
    return (
      <a href={actu.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </a>
    )
  }
  return inner
}

export default function Actualites() {
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => data.map(parseActu), [data])

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: 'var(--foret)', padding: 0, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Accueil</span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Actualités
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 16 }}>
          Infos locales, nouveautés de l'appli et alertes importantes
        </p>
      </div>

      {loading && (
        <div className="spinner" style={{ marginTop: 40 }}>Chargement…</div>
      )}

      {!loading && actus.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--texte-sec)', fontSize: 13, marginTop: 40 }}>
          Aucune actualité pour le moment.
        </p>
      )}

      {actus.map(actu => (
        <ActuCard key={actu.id} actu={actu} />
      ))}
    </div>
  )
}
