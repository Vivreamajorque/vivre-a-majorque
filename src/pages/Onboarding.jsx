import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'

export default function Onboarding() {
  const { chooseProfile, savePrenom } = useProfile()
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [inputPrenom, setInputPrenom] = useState('')

  const handlePrenom = () => {
    if (!inputPrenom.trim()) return
    savePrenom(inputPrenom.trim())
    setStep(2)
  }

  const handleSelect = (p) => {
    chooseProfile(p.id)
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

        {step === 1 && (
          <>
            <div style={{ marginBottom: 36 }}>
              <ContextLabel color={VERT} size={16}>comment tu</ContextLabel>
              <DisplayTitle size={42}>t'appelles ?</DisplayTitle>
              <Trait color={TERRA} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.5,
              }}>
                Pour une expérience personnalisée.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Ton prénom…"
                value={inputPrenom}
                onChange={e => setInputPrenom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePrenom()}
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px',
                  borderRadius: 14,
                  border: `1.5px solid ${inputPrenom.trim() ? TERRA : 'var(--gris)'}`,
                  background: '#fff',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 900, fontSize: 26,
                  color: 'var(--texte)',
                  outline: 'none',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                  transition: 'border-color 0.2s',
                }}
              />
              <button onClick={handlePrenom} disabled={!inputPrenom.trim()} style={{
                background: inputPrenom.trim() ? TERRA : 'var(--gris)',
                color: inputPrenom.trim() ? '#fff' : 'var(--texte-sec)',
                border: 'none', borderRadius: 14,
                padding: '14px',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: 18,
                cursor: inputPrenom.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 32 }}>
              <ContextLabel color={TERRA} size={16}>et ton projet,</ContextLabel>
              <DisplayTitle size={38}>où tu en es ?</DisplayTitle>
              <Trait color={VERT} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.5,
              }}>
                L'appli s'adapte à ta situation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROFILS.map((p, i) => {
                const color = i % 2 === 0 ? TERRA : VERT
                return (
                  <button key={p.id} onClick={() => handleSelect(p)} style={{
                    background: '#fff',
                    border: `1px solid ${color}30`,
                    borderRadius: 14, padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 6px rgba(28,20,16,0.06)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: 26 }}>{p.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display: 'block',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900, fontSize: 16,
                        color: 'var(--texte)', lineHeight: 1.2,
                      }}>
                        {p.label}
                      </span>
                      <div style={{ width: 20, height: 2, background: color, borderRadius: 1, margin: '4px 0' }} />
                      <span style={{
                        fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                        fontSize: 13, color: 'var(--texte-sec)',
                      }}>
                        {p.description}
                      </span>
                    </div>
                    <span style={{ color, fontSize: 16, opacity: 0.5 }}>→</span>
                  </button>
                )
              })}
            </div>

            <button onClick={() => setStep(1)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--texte-sec)', marginTop: 20,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            }}>
              ← Modifier mon prénom
            </button>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 3,
              borderRadius: 2,
              background: s === step ? TERRA : 'var(--gris)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
