import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseLifestyle } from '../hooks/useNotion'
import { NOTION_DB } from '../config'

export default function Boutiques() {
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.lifestyle)

  const items = useMemo(() => {
    return data.map(parseLifestyle).filter(l => l.status === 'Publié')
  }, [data])

  const categories = useMemo(() => {
    const cats = [...new Set(items.map(l => l.category).filter(Boolean))].sort()
    return cats
  }, [items])

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Boutiques
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Lifestyle & bons plans à Majorque
        </p>
      </div>

      {loading ? (
        <div className="spinner">Chargement…</div>
      ) : items.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--gris)',
          padding: '40px 24px',
          textAlign: 'center',
          marginTop: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 18, color: 'var(--foret)', marginBottom: 8 }}>
            Bientôt disponible
          </p>
          <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
            Notre sélection de boutiques et bons plans francophones à Majorque est en cours de préparation.
          </p>
        </div>
      ) : (
        <div>
          {categories.length > 0 ? (
            categories.map(cat => {
              const catItems = items.filter(l => l.category === cat)
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <p className="section-title">{cat}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {catItems.map(item => (
                      <div key={item.id} style={{
                        background: '#fff',
                        border: '1px solid var(--gris)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 12px',
                        position: 'relative',
                      }}>
                        {item.access !== '🟢 Public' && (
                          <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 13 }}>💎</span>
                        )}
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--foret)', lineHeight: 1.4, marginBottom: 4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.title}
                        </p>
                        {item.zone.length > 0 && (
                          <p style={{ fontSize: 11, color: 'var(--texte-sec)' }}>📍 {item.zone.join(', ')}</p>
                        )}
                        {item.lien && item.access === '🟢 Public' && (
                          <a href={item.lien} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: 'var(--vert-dark)', marginTop: 6, display: 'inline-block' }}>
                            Voir →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            items.map(item => (
              <div key={item.id} className="card" style={{ marginBottom: 8 }}>
                <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--foret)' }}>{item.title}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
