import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TERRA, VERT } from './WaveTitle'

const TABS = [
  { to: '/app',               label: 'Accueil',   icon: '🏠', exact: true },
  { to: '/app/guides',        label: 'Guides',    icon: '📚' },
  { to: '/app/explorer',      label: 'Explorer',  icon: '🌴' },
  { to: '/app/explorer/boutiques', label: 'Boutiques', icon: '🛍️' },
  { to: '/app/moi',           label: 'Moi',       icon: '👤' },
]

const COLORS = [TERRA, VERT, TERRA, VERT, TERRA]

export default function Nav() {
  const location = useLocation()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(247,242,235,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid #E8E2D9',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map((tab, i) => {
        const isActive = tab.exact
          ? location.pathname === tab.to
          : location.pathname.startsWith(tab.to)
        const color = COLORS[i]
        return (
          <NavLink key={tab.to} to={tab.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '10px 0 8px',
            textDecoration: 'none', gap: 2, position: 'relative',
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 2.5,
                background: color,
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{
              fontFamily: isActive ? 'var(--font-display)' : 'var(--font-titre)',
              fontStyle: isActive ? 'normal' : 'italic',
              fontWeight: isActive ? 900 : 400,
              fontSize: 10,
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
