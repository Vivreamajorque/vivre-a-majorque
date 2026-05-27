import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseAnnuaire } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

function ProCard({ pro }) {
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--foret)', flex: 1, paddingRight: 8, lineHeight: 1.3 }}>{pro.nom}</p>
        {pro.ville && <span style={{ fontSize: 12, color: 'var(--texte-sec)', whiteSpace: 'nowrap' }}>📍 {pro.ville}</span>}
      </div>
      {pro.description && (
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8, lineHeight: 1.5 }}>{pro.description}</p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {pro.tel && (
          <a href={`tel:${pro.tel}`} style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500 }}>📞 {pro.tel}</a>
        )}
        {pro.email && (
          <a href={`mailto:${pro.email}`} style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500 }}>✉️ {pro.email}</a>
        )}
        {pro.site && (
          <a href={pro.site} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500 }}>🌐 Site</a>
        )}
        {pro.instagram && (
          <a href={pro.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--terra)', fontWeight: 500 }}>📷 Instagram</a>
        )}
        {pro.maps && (
          <a href={pro.maps} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>🗺️ Maps</a>
        )}
      </div>
    </div>
  )
}

export default function Annuaire() {
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.annuaire)
  const [selectedCat, setSelectedCat] = useState(null)

  // Only show active entries with a name
  const pros = useMemo(() => data
    .map(parseAnnuaire)
    .filter(p => p.nom && p.statut !== 'Archivé'),
    [data]
  )

  const categories = useMemo(() => {
    const catMap = {}
    pros.forEach(p => {
      const cat = p.metier || 'Autres'
      catMap[cat] = (catMap[cat] || 0) + 1
    })
    return Object.entries(catMap).sort((a, b) => a[0].localeCompare(b[0]))
  }, [pros])

  const filtered = useMemo(() => {
    if (!selectedCat) return []
    return pros.filter(p => (p.metier || 'Autres') === selectedCat)
  }, [pros, selectedCat])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/app/explorer')} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)', padding: 0,
          }}>←</button>
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 22, color: 'var(--foret)', margin: 0 }}>Annuaires</h1>
        </div>
        <div className="spinner">Chargement…</div>
      </div>
    )
  }

  if (selectedCat) {
    return (
      <div className="page">
        <div className="page-header">
          <button onClick={() => setSelectedCat(null)} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
            padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Catégories</span></button>
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 22, color: 'var(--foret)', marginBottom: 4 }}>
            {selectedCat}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="empty">Aucun résultat dans cette catégorie.</div>
        ) : (
          filtered.map(pro => <ProCard key={pro.id} pro={pro} />)
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Annuaires
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Professionnels francophones à Majorque
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="empty">Aucun résultat pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categories.map(([cat, count]) => (
            <button key={cat} onClick={() => setSelectedCat(cat)} style={{
              background: '#fff',
              border: '1px solid var(--gris)',
              borderRadius: 'var(--radius)',
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
