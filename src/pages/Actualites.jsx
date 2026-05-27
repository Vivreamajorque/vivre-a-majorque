import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const CAT_COLORS = {
  'Admin':       { bg: '#EBF3E4', border: 'rgba(90,122,64,0.25)',   text: '#2D5016' },
  'Fiscal':      { bg: '#FEF3E7', border: 'rgba(176,100,42,0.25)',  text: '#7a4510' },
  'Logement':    { bg: '#F5E8E0', border: 'rgba(196,122,90,0.25)',  text: '#7a3e22' },
  'Santé':       { bg: '#E8F4F0', border: 'rgba(60,160,120,0.25)',  text: '#1a5940' },
  'Voiture':     { bg: '#F0F0F0', border: 'rgba(100,100,100,0.2)',  text: '#444'    },
  'Famille':     { bg: '#F9E8F0', border: 'rgba(180,80,130,0.2)',   text: '#6a1840' },
  'Travail':     { bg: '#EAE4F5', border: 'rgba(110,80,180,0.25)',  text: '#3d2070' },
  'Événement':   { bg: '#FEE8E4', border: 'rgba(196,80,70,0.25)',   text: '#8a2010' },
  'Vie pratique':{ bg: '#E4F0F5', border: 'rgba(42,130,176,0.25)',  text: '#104a6a' },
}

const CAT_EMOJIS = {
  'Admin': '📋', 'Fiscal': '💶', 'Logement': '🏠', 'Santé': '🏥',
  'Voiture': '🚗', 'Famille': '👨‍👩‍👧', 'Travail': '💼',
  'Événement': '🎉', 'Vie pratique': '🌿',
}

function catStyle(cat) {
  return CAT_COLORS[cat] || { bg: 'var(--gris)', border: 'rgba(0,0,0,0.1)', text: 'var(--texte-sec)' }
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function ActuCard({ actu }) {
  const cs = catStyle(actu.categorie)
  const emoji = CAT_EMOJIS[actu.categorie] || '📰'

  const inner = (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 14,
      padding: '18px 16px',
      marginBottom: 10,
    }}>

      {/* Top row: badge catégorie + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        {actu.categorie ? (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text,
            letterSpacing: 0.2,
          }}>
            {emoji} {actu.categorie}
          </span>
        ) : <span />}
        {actu.date && (
          <span style={{ fontSize: 11, color: 'var(--texte-sec)', flexShrink: 0 }}>
            {formatDateShort(actu.date)}
          </span>
        )}
      </div>

      {/* Titre */}
      <p style={{
        fontFamily: 'var(--font-titre)',
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--foret)',
        lineHeight: 1.35,
        marginBottom: actu.resume ? 10 : 0,
      }}>
        {actu.title}
      </p>

      {/* Résumé complet */}
      {actu.resume && (
        <p style={{
          fontSize: 13,
          color: '#444',
          lineHeight: 1.65,
          marginBottom: (actu.tags?.length || actu.lien) ? 12 : 0,
        }}>
          {actu.resume}
        </p>
      )}

      {/* Tags */}
      {actu.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: actu.lien ? 12 : 0 }}>
          {actu.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 20,
              background: 'var(--gris)', color: 'var(--texte-sec)',
              fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Source */}
      {actu.lien && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 12,
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--texte-sec)', flexShrink: 0 }}>🔗 Source :</span>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--vert-dark, #2D5016)',
            textDecoration: 'underline',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {actu.sourceDomain || 'Lire l\'article →'}
          </span>
        </div>
      )}

    </div>
  )

  if (actu.lien) {
    return (
      <a href={actu.lien} target="_blank" rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </a>
    )
  }
  return inner
}

export default function Actualites() {
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.actus)
  const [activeCat, setActiveCat] = useState('Toutes')

  const actus = useMemo(() => {
    return data
      .map(parseActu)
      .filter(a => a.actif !== false)
      .sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      })
  }, [data])

  const categories = useMemo(() => {
    const seen = new Set()
    actus.forEach(a => { if (a.categorie) seen.add(a.categorie) })
    return ['Toutes', ...Array.from(seen)]
  }, [actus])

  const filtered = useMemo(() => {
    if (activeCat === 'Toutes') return actus
    return actus.filter(a => a.categorie === activeCat)
  }, [actus, activeCat])

  // Grouper par mois
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(a => {
      const key = a.date
        ? new Date(a.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : 'Sans date'
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [filtered])

  const groupKeys = Object.keys(grouped)

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <button
          onClick={() => navigate('/app/explorer')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--foret)', padding: 0, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 500,
          }}
        >
          ← <span>Explorer</span>
        </button>
        <PageHeading label="les dernières" accent="Actualités" color={TERRA} accentSize={34} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Infos locales, nouveautés et alertes importantes
        </p>
      </div>

      {/* Filtres catégorie */}
      {!loading && categories.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
          marginBottom: 20, scrollbarWidth: 'none',
        }}>
          {categories.map(cat => {
            const active = activeCat === cat
            const cs = catStyle(cat)
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  border: active
                    ? `1.5px solid ${cat === 'Toutes' ? 'var(--foret)' : cs.border}`
                    : '1.5px solid rgba(0,0,0,0.1)',
                  background: active
                    ? (cat === 'Toutes' ? 'var(--foret)' : cs.bg)
                    : 'white',
                  color: active
                    ? (cat === 'Toutes' ? 'white' : cs.text)
                    : 'var(--texte-sec)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {CAT_EMOJIS[cat] ? `${CAT_EMOJIS[cat]} ` : ''}{cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="spinner" style={{ marginTop: 40 }}>Chargement…</div>
      )}

      {/* Vide */}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--texte-sec)', fontSize: 13, marginTop: 40 }}>
          Aucune actualité pour le moment.
        </p>
      )}

      {/* Actus groupées par mois */}
      {!loading && groupKeys.map(monthKey => (
        <div key={monthKey} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: 'var(--foret)',
              textTransform: 'capitalize', letterSpacing: 0.3,
            }}>
              {monthKey}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--gris)' }} />
            <span style={{
              fontSize: 11, color: 'var(--texte-sec)',
              background: 'var(--gris)', padding: '2px 8px', borderRadius: 20,
            }}>
              {grouped[monthKey].length}
            </span>
          </div>
          {grouped[monthKey].map(actu => (
            <ActuCard key={actu.id} actu={actu} />
          ))}
        </div>
      ))}

    </div>
  )
}
