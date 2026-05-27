import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { PageHeading, AccentWord, TERRA, VERT } from '../components/WaveTitle'

export default function Onboarding() {
  const { setProfile } = useProfile()
  const navigate = useNavigate()

  const handleSelect = (p) => {
    setProfile(p)
    navigate('/app')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <PageHeading
            label="quel est"
            accent="ton profil ?"
            color={TERRA}
            labelSize={18}
            accentSize={40}
          />
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', fontSize: 16,
            color: 'var(--texte-sec)', marginTop: 12, lineHeight: 1.5,
          }}>
            L'appli s'adapte à où tu en es.
          </p>
        </div>

        {/* Cards profil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROFILS.map((p, i) => {
            const color = i % 2 === 0 ? TERRA : VERT
            return (
              <button key={p.id} onClick={() => handleSelect(p)} style={{
                background: '#fff',
                border: `1.5px solid ${color}35`,
                borderRadius: 16, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', textAlign: 'left',
                boxShadow: `0 2px 10px ${color}10`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 18px ${color}20` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 10px ${color}10` }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <AccentWord color={color} size={20}>{p.label}</AccentWord>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: 14,
                    color: 'var(--texte-sec)', display: 'block', marginTop: 2,
                  }}>
                    {p.description}
                  </span>
                </div>
                <span style={{ color, fontSize: 18, opacity: 0.6 }}>→</span>
              </button>
            )
          })}
        </div>

        <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 24, textAlign: 'center' }}>
          Tu pourras changer de profil à tout moment.
        </p>
      </div>
    </div>
  )
}
