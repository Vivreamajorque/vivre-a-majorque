import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TERRA, VERT } from './WaveTitle'
import { usePremium } from '../context/PremiumContext'

const FORET = '#0F3D35'
const GOLD  = '#b07d2a'

const TABS = [
  { to: '/app',          label: 'Accueil',  icon: '🏠', match: (p) => p === '/app' },
  { to: '/app/guides',   label: 'Guides',   icon: '📚', match: (p) => p.startsWith('/app/guides') || p.startsWith('/app/guide/') },
  { to: '/app/explorer', label: 'Outils',   icon: '🧮', match: (p) => p.startsWith('/app/explorer') || p.startsWith('/app/outils') || p.startsWith('/app/famille') },
  { to: '/app/moi',      label: 'Cockpit',  icon: '📋', match: (p) => p.startsWith('/app/moi') },
  { to: '/app/premium',  label: 'Premium',  icon: '💎', match: (p) => p.startsWith('/app/premium') },
]
const COLORS = [TERRA, VERT, TERRA, VERT, GOLD]

export default function Sidebar() {
  const location = useLocation()
  const { isPremium } = usePremium()

  return (
    <aside style={{
      width: 260, minHeight: '100vh',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 100,
      borderRight: '1px solid #EBEBEB',
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
          <img src="/logo_vivre_a_majorque.png" alt="Vivre à Majorque"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, color: FORET, lineHeight: 1.2 }}>
              Vivre à Majorque
            </p>
            <p style={{ fontSize: 13, color: '#AAA', fontFamily: 'var(--font-corps)' }}>
              L'app des francophones
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav role="navigation" aria-label="Navigation principale"
        style={{ flex: 1, padding: '10px 10px 0', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {TABS.map((tab, i) => {
          const isActive = tab.match(location.pathname)
          const color = COLORS[i]
          return (
            <NavLink key={tab.to} to={tab.to}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10,
                textDecoration: 'none',
                background: isActive ? `${color}10` : 'transparent',
                transition: 'background 0.1s',
              }}>
              <span style={{
                width: 30, height: 30, borderRadius: 7,
                background: isActive ? `${color}15` : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0, transition: 'background 0.1s',
              }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'var(--font-corps)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14, color: isActive ? color : '#555',
                transition: 'color 0.1s',
              }}>{tab.label}</span>
              {isActive && (
                <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: color }} />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* CTA Premium */}
      <div style={{ padding: '16px 10px 10px' }}>
        <div style={{ height: 1, background: '#F0F0F0', marginBottom: 12 }} />
        {isPremium ? (
          <div style={{ background: `${GOLD}0D`, border: `1px solid ${GOLD}25`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>💎</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: GOLD, fontFamily: 'var(--font-corps)' }}>Premium actif</p>
              <p style={{ fontSize: 13, color: '#AAA', fontFamily: 'var(--font-corps)' }}>Accès complet débloqué</p>
            </div>
          </div>
        ) : (
          <NavLink to="/app/premium" style={{ textDecoration: 'none' }}>
            <div style={{ background: `${GOLD}0A`, border: `1px solid ${GOLD}20`, borderRadius: 10, padding: '12px', cursor: 'pointer', transition: 'background 0.1s' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4, fontFamily: 'var(--font-corps)' }}>
                💎 Passer Premium
              </p>
              <p style={{ fontSize: 13, color: '#999', fontFamily: 'var(--font-corps)', lineHeight: 1.5 }}>
                9,90€/mois · 100+ guides<br/>simulateurs · cockpit complet
              </p>
            </div>
          </NavLink>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 20px 20px', borderTop: '1px solid #F0F0F0' }}>
        <p style={{ fontSize: 13, color: '#CCC', fontFamily: 'var(--font-corps)', lineHeight: 1.6 }}>
          Par Amely · Campos, Majorque<br/>
          <a href="https://www.instagram.com/amely_mallorca_raw/" target="_blank" rel="noopener noreferrer"
            style={{ color: '#CCC', textDecoration: 'none' }}>@amely_mallorca_raw</a>
        </p>
      </div>
    </aside>
  )
}
