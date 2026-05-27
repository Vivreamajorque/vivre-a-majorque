import React, { useState, useMemo } from 'react'
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
        <span style={{ fontSize: 12, color: 'var(--foret)', marginTop: 8, fontWeight: 500 }}>Lire →</span>
      )}
    </div>
  )
}

export default function Guides() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { data, loading } = useNotionDB(NOTION_DB.guides)
  const [selectedCat, setSelectedCat] = useState(null)

  const guides = useMemo(() => {
    return data
      .map(parseGuide)
      .filter(g => g.status === 'Publié')
  }, [data])

  // Build ordered category list with counts
  const categories = useMemo(() => {
    const byCategory = {}
    guides.forEach(g => {
      const cat = g.category || 'Autres'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })
    const result = []
    GUIDE_CATEGORIES.forEach(cat => {
      if (byCategory[cat]) result.push([cat, byCategory[cat]])
    })
    if (byCategory['Autres']) result.push(['Autres', byCategory['Autres']])
    return result
  }, [guides])

  // Guides for selected category
  const catGuides = useMemo(() => {
    if (!selectedCat) return []
    return guides.filter(g => (g.category || 'Autres') === selectedCat)
  }, [guides, selectedCat])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)' }}>Guides</h1>
        </div>
        <div className="spinner">Chargement des guides…</div>
      </div>
    )
  }

  // — Vue 2 : guides d'une catégorie —
  if (selectedCat) {
    return (
      <div className="page">
        <div className="page-header">
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
              color: 'var(--foret)', padding: 0, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Catégories</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{CAT_EMOJIS[selectedCat] || '📄'}</span>
            <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 22, color: 'var(--foret)', margin: 0 }}>
              {selectedCat}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 4 }}>
            {catGuides.length} guide{catGuides.length > 1 ? 's' : ''}
          </p>
        </div>

        {catGuides.length === 0 ? (
          <div className="empty">Aucun guide dans cette catégorie.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {catGuides.map(g => (
              <GuideCard key={g.id} guide={g} onClick={id => navigate(`/app/guide/${id}`)} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // — Vue 1 : grille des catégories —
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

      {categories.length === 0 ? (
        <div className="empty">Aucun guide disponible pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: '#fff',
                border: '1px solid var(--gris)',
                borderRadius: 'var(--radius)',
                padding: '18px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: 28 }}>{CAT_EMOJIS[cat] || '📄'}</span>
              <span style={{
                fontFamily: 'var(--font-titre)', fontSize: 14, color: 'var(--foret)',
                fontWeight: 600, lineHeight: 1.3,
              }}>{cat}</span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                {count} guide{count > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
