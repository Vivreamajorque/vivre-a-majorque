import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Boutiques() {
  const navigate = useNavigate()

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

      <div style={{
        background: 'var(--ocre-light)',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(196,122,90,0.2)',
        padding: '48px 24px',
        textAlign: 'center',
        marginTop: 8,
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛍️</div>
        <p style={{ fontFamily: 'var(--font-titre)', fontSize: 20, color: 'var(--foret)', marginBottom: 12 }}>
          Prochainement
        </p>
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
          Notre sélection de boutiques, artisans et bons plans francophones à Majorque arrive bientôt.
        </p>
      </div>
    </div>
  )
}
