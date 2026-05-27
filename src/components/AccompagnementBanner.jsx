import React from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * AccompagnementBanner — encart discret renvoyant vers la page Accompagnements.
 * Props :
 *   texte  : string — phrase principale (contextualisée)
 *   cta    : string — texte du lien (défaut : "Voir les accompagnements →")
 *   style  : object — surcharge style conteneur
 */
export default function AccompagnementBanner({ texte, cta = 'Voir les accompagnements →', style = {} }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/app/explorer/accompagnements')}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: 'var(--lin, #F5F0E8)',
        borderLeft: '3px solid var(--vert, #7EC8C0)',
        borderRadius: '0 12px 12px 0',
        padding: '14px 16px',
        marginTop: 24,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'opacity 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>🧭</span>
      <div>
        <p style={{
          fontSize: 13,
          color: 'var(--foret, #2D5016)',
          lineHeight: 1.45,
          marginBottom: 4,
        }}>
          {texte}
        </p>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--vert, #7EC8C0)',
          textDecoration: 'underline',
        }}>
          {cta}
        </span>
      </div>
    </div>
  )
}
