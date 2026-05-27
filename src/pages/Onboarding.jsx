import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { PageHeading, AccentWord, TERRA, VERT, Wave } from '../components/WaveTitle'

export default function Onboarding() {
  const { chooseProfile, savePrenom } = useProfile()
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)   // 1 = prénom, 2 = profil
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

        {/* ── Étape 1 : prénom ── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <PageHeading
                label="comment tu"
                accent="t'appelles ?"
                color={TERRA}
                labelSize={18}
                accentSize={40}
              />
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: 16,
                color: 'var(--texte-sec)', marginTop: 12, lineHeight: 1.5,
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
                  width: '100%', padding: '14px 18px',
                  borderRadius: 14,
                  border: `1.5px solid ${inputPrenom.trim() ? TERRA : 'var(--gris)'}`,
                  background: '#fff',
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 700, fontSize: 22,
                  color: 'var(--texte)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  textAlign: 'center',
                }}
              />
              <button
                onClick={handlePrenom}
                disabled={!inputPrenom.trim()}
                style={{
                  background: inputPrenom.trim() ? TERRA : 'var(--gris)',
                  color: inputPrenom.trim() ? '#fff' : 'var(--texte-sec)',
                  border: 'none', borderRadius: 14,
                  padding: '14px', cursor: inputPrenom.trim() ? 'pointer' : 'default',
                  fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 20,
                  transition: 'background 0.2s',
                  boxShadow: inputPrenom.trim() ? `0 4px 16px ${TERRA}30` : 'none',
                }}
              >
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : profil ── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <PageHeading
                label="et ton projet,"
                accent="où tu en es ?"
                color={VERT}
                labelSize={18}
                accentSize={38}
              />
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: 16,
                color: 'var(--texte-sec)', marginTop: 12, lineHeight: 1.5,
              }}>
                L'appli s'adapte à ta situation.
              </p>
            </div>

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
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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

            <button onClick={() => setStep(1)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--texte-sec)', marginTop: 20,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            }}>
              ← Modifier mon prénom
            </button>
          </>
        )}

        {/* Indicateur étapes */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 8,
              borderRadius: 4,
              background: s === step ? TERRA : 'var(--gris)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

      </div>
    </div>
  )
}
