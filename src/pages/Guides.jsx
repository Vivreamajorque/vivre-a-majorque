import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { NOTION_DB, GUIDE_CATEGORIES } from '../config'

function GuideCard({ guide, onClick }) {
  const { canAccess } = usePremium()
  const accessible = canAccess(guide.access)

  return (
    <div
      onClick={() => accessible ? onClick(guide.id) : null}
      style={{
        background: '#fff',
        border: '1px solid var(--gris)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: 8,
        cursor: accessible ? 'pointer' : 'default',
        opacity: accessible ? 1 : 0.7,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        transition: 'box-shadow 0.15s',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {guide.category && (
            <span className="badge badge-gris" style={{ fontSize: 10 }}>{guide.category}</span>
          )}
          {guide.isPiege && (
            <span className="badge badge-ocre" style={{ fontSize: 10 }}>⚠️ Piège</span>
          )}
          {!accessible && (
            <span className="badge badge-miel" style={{ fontSize: 10 }}>💎 Premium</span>
          )}
        </div>
        <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--foret)', lineHeight: 1.4 }}>
          {guide.title}
        </p>
      </div>
      {accessible && (
        <span style={{ color: 'var(--vert)', fontSize: 18, marginTop: 2 }}>→</span>
      )}
      {!accessible && (
        <span style={{ color: 'var(--miel)', fontSize: 16, marginTop: 2 }}>🔒</span>
      )}
    </div>
  )
}

export default function Guides() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { data, loading } = useNotionDB(NOTION_DB.guides)

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Tous')
  const [profilFilter, setProfilFilter] = useState(true)

  const guides = useMemo(() => {
    return data
      .map(parseGuide)
      .filter(g => g.status === 'Publié')
      .filter(g => {
        if (profilFilter && profile) {
          const notionLabel = profile.notion
          if (g.situation.length > 0) {
            return g.situation.includes(notionLabel) || g.situation.includes('Les deux')
          }
        }
        return true
      })
      .filter(g => catFilter === 'Tous' || g.category === catFilter)
      .filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()))
  }, [data, search, catFilter, profilFilter, profile])

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 12 }}>
          Guides
        </h1>
        <input
          className="search-input"
          placeholder="Rechercher un guide…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <div className="filter-pills">
          <button className={`pill ${catFilter === 'Tous' ? 'active' : ''}`} onClick={() => setCatFilter('Tous')}>
            Tous
          </button>
          {GUIDE_CATEGORIES.map(c => (
            <button key={c} className={`pill ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
              {c}
            </button>
          ))}
        </div>
        {profile && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setProfilFilter(!profilFilter)}
              style={{
                fontSize: 12,
                color: profilFilter ? 'var(--vert-dark)' : 'var(--texte-sec)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500,
              }}
            >
              <span style={{ fontSize: 14 }}>{profilFilter ? '✅' : '⬜'}</span>
              Filtrer pour « {profile.label} »
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="spinner">Chargement des guides…</div>
      ) : guides.length === 0 ? (
        <div className="empty">Aucun guide trouvé.</div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12 }}>
            {guides.length} guide{guides.length > 1 ? 's' : ''}
          </p>
          {guides.map(g => (
            <GuideCard key={g.id} guide={g} onClick={id => navigate(`/app/guide/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
