import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseAnnuaire } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

function hasContact(pro) {
  return !!(pro.tel || pro.email || pro.maps)
}

function ProCard({ pro }) {
  const coming = !hasContact(pro)

  return (
    <div className="card" style={{ marginBottom: 8, opacity: coming ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--foret)', flex: 1, paddingRight: 8, lineHeight: 1.3 }}>
          {pro.nom}
        </p>
        {coming ? (
          <span style={{
            fontSize: 11, background: 'var(--gris)', color: 'var(--texte-sec)',
            padding: '2px 8px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap',
          }}>À venir</span>
        ) : (
          pro.ville && <span style={{ fontSize: 12, color: 'var(--texte-sec)', whiteSpace: 'nowrap' }}>📍 {pro.ville}</span>
        )}
      </div>
      {pro.description && (
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8, lineHeight: 1.5 }}>{pro.description}</p>
      )}
      {!coming && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {pro.tel && (
            <a href={`tel:${pro.tel}`} style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500 }}>📞 {pro.tel}</a>
          )}
          {pro.email && (
            <a href={`mailto:${pro.email}`} style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500 }}>✉️ {pro.email}</a>
          )}
          {pro.maps && (
            <a href={pro.maps} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>🗺️ Voir sur Maps</a>
          )}
        </div>
      )}
    </div>
  )
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 16, color: 'var(--texte-sec)', pointerEvents: 'none',
      }}>🔍</span>
      <input
        type="text"
        placeholder="Rechercher un professionnel…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px 10px 36px',
          border: '1px solid var(--gris)',
          borderRadius: 'var(--radius)',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          background: '#fff',
          color: 'var(--noir)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
            color: 'var(--texte-sec)', padding: 0,
          }}
        >×</button>
      )}
    </div>
  )
}

export default function Annuaire() {
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.annuaire)
  const [selectedCat, setSelectedCat] = useState(null)
  const [search, setSearch] = useState('')

  const pros = useMemo(() => data
    .map(parseAnnuaire)
    .filter(p => p.nom && p.statut !== 'Archivé'),
    [data]
  )

  // Search across all pros (bypasses category nav)
  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return pros.filter(p =>
      p.nom.toLowerCase().includes(q) ||
      p.metier.toLowerCase().includes(q) ||
      p.ville.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }, [pros, search])

  const categories = useMemo(() => {
    const catMap = {}
    pros.forEach(p => {
      const cat = p.metier || 'À venir'
      catMap[cat] = (catMap[cat] || 0) + 1
    })
    // Sort: "À venir" always last
    const entries = Object.entries(catMap).sort((a, b) => {
      if (a[0] === 'À venir') return 1
      if (b[0] === 'À venir') return -1
      return a[0].localeCompare(b[0])
    })
    return entries
  }, [pros])

  const filtered = useMemo(() => {
    if (!selectedCat) return []
    return pros.filter(p => (p.metier || 'À venir') === selectedCat)
  }, [pros, selectedCat])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/app/explorer')} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)', padding: 0,
          }}>←</button>
          <AccentWord color={TERRA} size={28}>Annuaires</AccentWord>
        </div>
        <div className="spinner">Chargement…</div>
      </div>
    )
  }

  // — Vue recherche —
  if (searchResults !== null) {
    return (
      <div className="page">
        <div className="page-header">
          <button onClick={() => navigate('/app/explorer')} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
            padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 24, color: "var(--texte)", lineHeight: 1.3, marginBottom: 8 }}>
            Annuaires
          </div>
          <SearchBar value={search} onChange={setSearch} />
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8 }}>
            {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
          </p>
        </div>
        {searchResults.length === 0 ? (
          <div className="empty">Aucun résultat pour « {search} »</div>
        ) : (
          searchResults.map(pro => <ProCard key={pro.id} pro={pro} />)
        )}
      </div>
    )
  }

  // — Vue catégorie —
  if (selectedCat) {
    return (
      <div className="page">
        <div className="page-header">
          <button onClick={() => setSelectedCat(null)} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
            padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Catégories</span></button>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 24, color: "var(--texte)", lineHeight: 1.3, marginBottom: 8 }}>
            {selectedCat}
          </div>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12 }}>
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
          </p>
          <SearchBar value={search} onChange={v => { setSearch(v); setSelectedCat(null) }} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty">Aucun résultat dans cette catégorie.</div>
        ) : (
          filtered.map(pro => <ProCard key={pro.id} pro={pro} />)
        )}
      </div>
    )
  }

  // — Vue grille catégories —
  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 24, color: "var(--texte)", lineHeight: 1.3, marginBottom: 8 }}>
          Annuaires
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {categories.length === 0 ? (
        <div className="empty">Aucun résultat pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categories.map(([cat, count]) => (
            <button key={cat} onClick={() => setSelectedCat(cat)} style={{
              background: cat === 'À venir' ? 'var(--gris)' : '#fff',
              border: '1px solid var(--gris)',
              borderRadius: 'var(--radius)',
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              opacity: cat === 'À venir' ? 0.7 : 1,
            }}>
              <span style={{
                fontFamily: 'var(--font-titre)', fontSize: 14, color: 'var(--foret)',
                fontWeight: 600, lineHeight: 1.3,
              }}>{cat}</span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                {count} entrée{count > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
