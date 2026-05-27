import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/app', label: 'Accueil', icon: '🏠', exact: true },
  { to: '/app/guides', label: 'Guides', icon: '📚' },
  { to: '/app/explorer', label: 'Explorer', icon: '🌴' },
  { to: '/app/moi', label: 'Moi', icon: '👤' },
]

export default function Nav() {
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid var(--gris)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const isActive = tab.exact
          ? location.pathname === tab.to
          : location.pathname.startsWith(tab.to)
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 0 8px',
              textDecoration: 'none',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--vert-dark)' : 'var(--texte-sec)',
              letterSpacing: '0.01em',
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom) + 0px)',
                width: 32,
                height: 2,
                background: 'var(--vert)',
                borderRadius: 1,
              }} />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
