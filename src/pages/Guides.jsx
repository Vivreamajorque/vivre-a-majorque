import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { NOTION_DB, GUIDE_CATEGORIES } from '../config'

const CAT_EMOJIS = {
  'Administratif': '📋',
  'Logement': '🏠',
  'Travail': '💼',
  'Santé': '🏥',
  'Famille': '👨‍👩‍👧',
  'Argent': '💶',
  'Voiture': '🚗',
  'Animaux': '🐾',
  'Déménagement': '📦',
  'Vie pratique': '🌿',
}

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
        padding: '14px 12px',
        cursor: accessible ? 'pointer' : 'default',
        position: 'relative',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {!accessible && (
        <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 14 }}>🔒</span>
      )}
      {guide.isPiege && (
        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10,
          background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
          ⚠️ Piège
        </span>
      )}
      <p style={{
        fontWeight: 500,
        fontSize: 13,
        color: accessible ? 'var(--foret)' : 'var(--texte-sec)',
        lineHeight: 1.4,
        marginTop: guide.isPiege ? 18 : 0,
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {guide.title}
      </p>
      {accessible && (
        <span style={{ fontSize: 12, color: 'var(--vert-dark)', marginTop: 8, fontWeight: 500 }}>Lire →</span>
      )}
    </div>
  )
}

export default function Guides() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { data, loading } = useNotionDB(NOTION_DB.guides)

  const guides = useMemo(() => {
    return data
      .map(parseGuide)
      .filter(g => g.status === 'Publié')
  }, [data])

  const grouped = useMemo(() => {
    const byCategory = {}
    guides.forEach(g => {
      const cat = g.category || 'Autres'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(g)
    })
    const result = []
    GUIDE_CATEGORIES.forEach(cat => {
      if (byCategory[cat] && byCategory[cat].length > 0) {
        result.push({ cat, guides: byCategory[cat] })
      }
    })
    if (byCategory['Autres'] && byCategory['Autres'].length > 0) {
      result.push({ cat: 'Autres', guides: byCategory['Autres'] })
    }
    return result
  }, [guides])

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)' }}>
          Guides
        </h1>
        {profile && (
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 4 }}>
            {profile.emoji} {profile.label}
          </p>
        )}
      </div>

      {loading ? (
        <div className="spinner">Chargement des guides…</div>
      ) : grouped.length === 0 ? (
        <div className="empty">Aucun guide disponible pour le moment.</div>
      ) : (
        grouped.map(({ cat, guides: catGuides }) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{CAT_EMOJIS[cat] || '📄'}</span>
              <p style={{
                fontFamily: 'var(--font-titre)', fontSize: 16,
                color: 'var(--foret)', fontWeight: 600, margin: 0,
              }}>{cat}</p>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)', marginLeft: 4 }}>
                {catGuides.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {catGuides.map(g => (
                <GuideCard key={g.id} guide={g} onClick={id => navigate(`/app/guide/${id}`)} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
