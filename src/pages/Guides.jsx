import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
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

// 30 % free per category = first 30% guides are public, rest are locked for freemium users
// Access_Level 🟢 Public = always free
// 💎 Premium / 🚀 Éclaireur = premium only
// This function applies the 30/70 rule: within a category, sort by access level
// (public first), then the first 30% are shown free even if premium

function applyFreemiumRule(guides) {
  const total = guides.length
  const freeCount = Math.max(1, Math.ceil(total * 0.30))
  return guides.map((g, i) => ({
    ...g,
    freemiumFree: i < freeCount, // first 30% always accessible
  }))
}

function GuideCard({ guide, onOpen, onPaywall }) {
  const { canAccess } = usePremium()
  const accessible = guide.freemiumFree || canAccess(guide.access)

  return (
    <div
      onClick={() => accessible ? onOpen(guide.id) : onPaywall()}
      style={{
        background: accessible ? 'white' : 'var(--gris)',
        border: `1px solid ${accessible ? 'var(--gris)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: 12,
        padding: '14px 12px',
        cursor: 'pointer',
        position: 'relative',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'box-shadow 0.15s',
      }}
    >
      {!accessible && (
        <span style={{
          position: 'absolute', top: 8, right: 8, fontSize: 13,
          color: 'var(--texte-sec)',
        }}>🔒</span>
      )}
      <p style={{
        fontWeight: 500,
        fontSize: 13,
        color: accessible ? 'var(--foret)' : 'var(--texte-sec)',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {guide.title}
      </p>
      {accessible && (
        <span style={{ fontSize: 12, color: 'var(--foret)', marginTop: 8, fontWeight: 600 }}>Lire →</span>
      )}
      {!accessible && (
        <span style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 8 }}>Premium</span>
      )}
    </div>
  )
}

export default function Guides() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { data, loading } = useNotionDB(NOTION_DB.guides)
  const [selectedCat, setSelectedCat] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const guides = useMemo(() => {
    return data
      .map(parseGuide)
      .filter(g => g.status === 'Publié')
  }, [data])

  // Build ordered category list with counts (free + total)
  const categories = useMemo(() => {
    const byCategory = {}
    guides.forEach(g => {
      const cat = g.category || 'Autres'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(g)
    })
    const result = []
    GUIDE_CATEGORIES.forEach(cat => {
      if (byCategory[cat]) {
        const total = byCategory[cat].length
        const freeCount = Math.max(1, Math.ceil(total * 0.30))
        result.push({ cat, total, freeCount })
      }
    })
    if (byCategory['Autres']) {
      const total = byCategory['Autres'].length
      const freeCount = Math.max(1, Math.ceil(total * 0.30))
      result.push({ cat: 'Autres', total, freeCount })
    }
    return result
  }, [guides])

  // Guides for selected category with 30/70 rule applied
  const catGuides = useMemo(() => {
    if (!selectedCat) return []
    const filtered = guides.filter(g => (g.category || 'Autres') === selectedCat)
    // Sort: public first, then premium
    const sorted = [
      ...filtered.filter(g => g.access === '🟢 Public'),
      ...filtered.filter(g => g.access !== '🟢 Public'),
    ]
    return applyFreemiumRule(sorted)
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
    const lockedCount = catGuides.filter(g => !g.freemiumFree && g.access !== '🟢 Public').length
    return (
      <div className="page">
        <div className="page-header">
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
              color: 'var(--foret)', padding: 0, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← <span style={{ fontSize: 13 }}>Catégories</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{CAT_EMOJIS[selectedCat] || '📄'}</span>
            <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 22, color: 'var(--foret)', margin: 0 }}>
              {selectedCat}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginTop: 4 }}>
            {catGuides.length} guide{catGuides.length > 1 ? 's' : ''}
            {lockedCount > 0 && (
              <span
                onClick={() => setShowPaywall(true)}
                style={{
                  marginLeft: 8, color: 'var(--foret)', cursor: 'pointer',
                  textDecoration: 'underline', fontWeight: 500,
                }}
              >
                · {lockedCount} en Premium →
              </span>
            )}
          </p>
        </div>

        {catGuides.length === 0 ? (
          <div className="empty">Aucun guide dans cette catégorie.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {catGuides.map(g => (
              <GuideCard
                key={g.id}
                guide={g}
                onOpen={id => navigate(`/app/guide/${id}`)}
                onPaywall={() => setShowPaywall(true)}
              />
            ))}
          </div>
        )}

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
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
          {categories.map(({ cat, total, freeCount }) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: 'white',
                border: '1px solid var(--gris)',
                borderRadius: 14,
                padding: '18px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: 26 }}>{CAT_EMOJIS[cat] || '📄'}</span>
              <span style={{
                fontFamily: 'var(--font-titre)', fontSize: 14, color: 'var(--foret)',
                fontWeight: 600, lineHeight: 1.3,
              }}>{cat}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>
                  {freeCount} gratuit{freeCount > 1 ? 's' : ''}
                </span>
                {total - freeCount > 0 && (
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 20,
                    background: 'var(--vert-light)', color: 'var(--foret)', fontWeight: 600,
                  }}>
                    +{total - freeCount} Premium
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
