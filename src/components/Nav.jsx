import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TERRA, VERT } from './WaveTitle'

const TABS = [
  { to: '/app',                         label: 'Accueil',  icon: '🏠', match: (p) => p === '/app' },
  { to: '/app/guides',                  label: 'Guides',   icon: '📚', match: (p) => p.startsWith('/app/guides') || p.startsWith('/app/guide/') },
  { to: '/app/explorer',                label: 'Outils',   icon: '🧮', match: (p) => p.startsWith('/app/explorer') || p.startsWith('/app/outils') || p.startsWith('/app/famille') },
  { to: '/app/moi',                     label: 'Cockpit',  icon: '📋', match: (p) => p.startsWith('/app/moi') },
  { to: '/app/premium',                 label: 'Premium',  icon: '💎', match: (p) => p.startsWith('/app/premium') },
]

const COLORS = [TERRA, VERT, TERRA, VERT, '#b07d2a']

export default function Nav() {
  const location = useLocation()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(240,234,224,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid #D4CCC2',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
      role="navigation"
      aria-label="Navigation principale"
    >
      {TABS.map((tab, i) => {
        const isActive = tab.match(location.pathname)
        const color = COLORS[i]
        return (
          <NavLink key={tab.to} to={tab.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '10px 0 10px',
            textDecoration: 'none', gap: 4, position: 'relative',
            minHeight: 62,
          }}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 32, height: 3,
                background: color,
                borderRadius: '0 0 3px 3px',
              }} />
            )}
            <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{tab.icon}</span>
            <span style={{
              fontFamily: isActive ? 'var(--font-display)' : 'var(--font-titre)',
              fontStyle: isActive ? 'normal' : 'italic',
              fontWeight: isActive ? 900 : 400,
              fontSize: 13,
              color: isActive ? color : 'var(--texte-sec)',
              letterSpacing: isActive ? '-0.01em' : '0',
              lineHeight: 1.2,
            }}>
              {tab.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
