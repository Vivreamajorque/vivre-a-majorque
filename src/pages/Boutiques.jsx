import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Boutiques() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 500,
        }}>
          ← <span>Explorer</span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Bons plans
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Nos coups de cœur pour vivre Majorque autrement
        </p>
      </div>

      {/* Carte Mallorca Chérie */}
      <a
        href="https://mallorcacherie.netlify.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{
          background: 'white',
          border: '1.5px solid rgba(90,122,64,0.2)',
          borderRadius: 16,
          padding: '20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: 'var(--vert-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            🌺
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-titre)', fontSize: 17,
              fontWeight: 700, color: 'var(--foret)', marginBottom: 5,
            }}>
              Mallorca Chérie
            </p>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
              Adelina, française installée depuis 8 ans. Itinéraires personnalisés & adresses locales authentiques pour découvrir ou redécouvrir l'île.
            </p>
          </div>
          <span style={{ fontSize: 18, color: 'var(--foret)', flexShrink: 0 }}>→</span>
        </div>
      </a>

      {/* Séparateur */}
      <div style={{ height: 12 }} />

      {/* Carte Ressources Lifestyle */}
      <div
        onClick={() => navigate('/app/explorer/lifestyle')}
        style={{
          background: 'white',
          border: '1.5px solid rgba(90,122,64,0.2)',
          borderRadius: 16,
          padding: '20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: 'var(--vert-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🌿
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-titre)', fontSize: 17,
            fontWeight: 700, color: 'var(--foret)', marginBottom: 5,
          }}>
            Ressources Lifestyle
          </p>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
            8 dossiers complets pour vivre Majorque comme un initié — plages secrètes, gastronomie, nature, bien-être.
          </p>
        </div>
        <span style={{ fontSize: 18, color: 'var(--foret)', flexShrink: 0 }}>→</span>
      </div>
    </div>
  )
}