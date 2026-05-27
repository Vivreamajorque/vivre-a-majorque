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
      background: 'rgba(10,22,18,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(126,200,192,0.12)',
      display: 'flex', zIndex: 100,
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
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '10px 0 9px',
              textDecoration: 'none', gap: 3, position: 'relative',
            }}
          >
            {/* Halo actif */}
            {isActive && (
              <div style={{
                position: 'absolute', top: 6,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(126,200,192,0.12)',
              }} />
            )}
            <span style={{ fontSize: 19, position: 'relative', zIndex: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 400,
              color: isActive ? '#7EC8C0' : 'rgba(237,232,223,0.45)',
              letterSpacing: '0.02em', position: 'relative', zIndex: 1,
            }}>
              {tab.label}
            </span>
            {/* Trait actif */}
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 2,
                background: 'linear-gradient(90deg, #7EC8C0, #5AADA5)',
                borderRadius: '0 0 3px 3px',
              }} />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
