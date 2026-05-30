import React from 'react'

/*
 * Affiché quand l'API Notion est inaccessible.
 * Compact et non intrusif — ne bloque pas toute la page.
 */
export default function NotionError({ message, retry }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 14px',
      background: 'rgba(199,78,78,0.05)',
      border: '1px solid rgba(199,78,78,0.2)',
      borderRadius: 12,
      margin: '12px 0',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: '#7A1A1A', fontWeight: 600, marginBottom: 2 }}>
          Contenu temporairement indisponible
        </p>
        <p style={{ fontSize: 12, color: '#8A4040', lineHeight: 1.5 }}>
          Vérifiez votre connexion et réessayez.
          {message && ` (${message})`}
        </p>
        {retry && (
          <button
            onClick={retry}
            style={{
              marginTop: 8, background: 'none', border: 'none',
              color: '#C74E4E', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', padding: 0, textDecoration: 'underline',
              fontFamily: 'var(--font-corps)',
            }}
          >
            Réessayer →
          </button>
        )}
      </div>
    </div>
  )
}
