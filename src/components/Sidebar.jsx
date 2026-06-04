import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TERRA, VERT } from './WaveTitle'
import { usePremium } from '../context/PremiumContext'

const TABS = [
  { to: '/app',          label: 'Accueil',  icon: '🏠', match: (p) => p === '/app' },
  { to: '/app/guides',   label: 'Guides',   icon: '📚', match: (p) => p.startsWith('/app/guides') || p.startsWith('/app/guide/') },
  { to: '/app/explorer', label: 'Outils',   icon: '🧮', match: (p) => p.startsWith('/app/explorer') || p.startsWith('/app/outils') || p.startsWith('/app/famille') },
  { to: '/app/moi',      label: 'Cockpit',  icon: '📋', match: (p) => p.startsWith('/app/moi') },
  { to: '/app/premium',  label: 'Premium',  icon: '💎', match: (p) => p.startsWith('/app/premium') },
]

const COLORS = [TERRA, VERT, TERRA, VERT, '#b07d2a']
const FORET = '#0F3D35'

export default function Sidebar() {
  const location = useLocation()
  const { isPremium } = usePremium()

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: FORET,
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0 24px',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Logo */}
      <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img
          src="/logo_vivre_a_majorque.png"
          alt="Vivre à Majorque"
          style={{ width: 120, height: 'auto', marginBottom: 10 }}
        />
        <p style={{
          fontFamily: 'var(--font-titre)',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'rgba(247,242,235,0.45)',
          lineHeight: 1.5,
        }}>
          L'app des francophones<br />à Majorque
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}
        role="navigation"
        aria-label="Navigation principale"
      >
        {TABS.map((tab, i) => {
          const isActive = tab.match(location.pathname)
          const color = COLORS[i]
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                background: isActive ? `${color}18` : 'transparent',
                border: isActive ? `1px solid ${color}30` : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
                {tab.icon}
              </span>
              <span style={{
                fontFamily: isActive ? 'var(--font-display)' : 'var(--font-corps)',
                fontWeight: isActive ? 700 : 400,
                fontSize: 14,
                color: isActive ? color : 'rgba(247,242,235,0.6)',
                letterSpacing: isActive ? '-0.01em' : '0',
                transition: 'color 0.15s',
              }}>
                {tab.label}
              </span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }} />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Badge Premium ou CTA */}
      <div style={{ padding: '0 12px 16px' }}>
        {isPremium ? (
          <div style={{
            background: 'rgba(176,125,42,0.15)',
            border: '1px solid rgba(176,125,42,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>💎</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#c9a84c', fontFamily: 'var(--font-corps)' }}>
              Compte Premium actif
            </span>
          </div>
        ) : (
          <NavLink to="/app/premium" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: 'rgba(199,110,78,0.15)',
              border: '1px solid rgba(199,110,78,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#E8956E', fontFamily: 'var(--font-corps)', marginBottom: 2, letterSpacing: '0.04em' }}>
                💎 PASSER PREMIUM
              </p>
              <p style={{ fontSize: 11, color: 'rgba(247,242,235,0.5)', fontFamily: 'var(--font-corps)' }}>
                9,90€/mois · résiliable
              </p>
            </div>
          </NavLink>
        )}
      </div>

      {/* Footer sidebar */}
      <div style={{
        padding: '16px 24px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{
          fontSize: 11,
          color: 'rgba(247,242,235,0.25)',
          fontFamily: 'var(--font-corps)',
          lineHeight: 1.5,
        }}>
          Par Amely — Campos, Majorque
        </p>
      </div>
    </aside>
  )
}
