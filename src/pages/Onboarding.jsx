import React from 'react'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'

export default function Onboarding() {
  const { chooseProfile } = useProfile()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--lin)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      maxWidth: 420,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌴</div>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 28, color: 'var(--foret)', marginBottom: 10 }}>
          Vivre à Majorque
        </h1>
        <p style={{ fontSize: 15, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          Le guide des Français qui s'installent sur l'île.
          <br />Où en êtes-vous ?
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {PROFILS.map(p => (
          <button
            key={p.id}
            onClick={() => chooseProfile(p.id)}
            style={{
              background: '#fff',
              border: '1.5px solid var(--gris)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gris)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>{p.emoji}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--foret)', marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{p.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 24, textAlign: 'center' }}>
        Votre profil personnalise les guides et le cockpit d'installation.
        <br />Vous pourrez le modifier à tout moment.
      </p>
    </div>
  )
}
