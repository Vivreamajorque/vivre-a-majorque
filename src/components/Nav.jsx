import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/app',          label: 'Accueil',  icon: '🏠', exact: true },
  { to: '/app/guides',   label: 'Guides',   icon: '📚' },
  { to: '/app/explorer', label: 'Explorer', icon: '🌴' },
  { to: '/app/moi',      label: 'Moi',      icon: '👤' },
]

export default function Nav() {
  const location = useLocation()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(250,250,248,0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid #EDE8DF',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const isActive = tab.exact
          ? location.pathname === tab.to
          : location.pathname.startsWith(tab.to)
        return (
          <NavLink key={tab.to} to={tab.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '10px 0 8px',
            textDecoration: 'none', gap: 3, position: 'relative',
          }}>
            {/* trait actif en haut */}
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 2.5,
                background: 'var(--terra)',
                borderRadius: '0 0 3px 3px',
              }} />
            )}
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontFamily: isActive ? 'var(--font-accent)' : 'var(--font-corps)',
              fontWeight: 700,
              fontSize: isActive ? 12 : 10,
              color: isActive ? 'var(--terra)' : 'var(--texte-sec)',
              letterSpacing: isActive ? '0.01em' : '0.02em',
            }}>
              {tab.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
