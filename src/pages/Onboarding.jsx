import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'

export default function Onboarding() {
  const { chooseProfile, savePrenom } = useProfile()
  const navigate = useNavigate()
  const [step, setStep]               = useState(1)
  const [inputPrenom, setInputPrenom] = useState('')
  const [inputEmail, setInputEmail]   = useState('')
  const [newsletter, setNewsletter]   = useState(false)
  const [emailError, setEmailError]   = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const handlePrenom = () => {
    if (!inputPrenom.trim()) return
    savePrenom(inputPrenom.trim())
    setStep(2)
  }

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleEmail = async () => {
    const email = inputEmail.trim()
    if (!email) { setEmailError('Ton adresse email est requise') ; return }
    if (!isValidEmail(email)) { setEmailError('Adresse email invalide') ; return }
    setEmailError('')
    setSubmitting(true)
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: inputPrenom.trim(), email, newsletter, welcome: true }),
      })
    } catch (_) { /* silencieux — on continue même si l'API échoue */ }
    setSubmitting(false)
    setStep(3)
  }

  const skipEmail = () => {
    setStep(3)
  }

  const handleSelect = (p) => {
    chooseProfile(p.id)
    navigate('/app')
  }

  const dots = [1, 2, 3]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── Step 1 : Prénom ── */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: 36 }}>
              <ContextLabel color={VERT} size={16}>entrez</ContextLabel>
              <DisplayTitle size={42}>votre prénom</DisplayTitle>
              <Trait color={TERRA} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.50,
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
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900, fontSize: 26,
                  color: 'var(--texte)',
                  outline: 'none', textAlign: 'center',
                  letterSpacing: '-0.01em', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <button onClick={handlePrenom} disabled={!inputPrenom.trim()} style={{
                background: inputPrenom.trim() ? TERRA : 'var(--gris)',
                color: inputPrenom.trim() ? '#fff' : 'var(--texte-sec)',
                border: 'none', borderRadius: 14,
                padding: '14px',
                fontFamily: 'var(--font-titre)',
                fontStyle: 'italic', fontSize: 18,
                cursor: inputPrenom.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2 : Email ── */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 32 }}>
              <ContextLabel color={TERRA} size={16}>presque !</ContextLabel>
              <DisplayTitle size={38}>ton email</DisplayTitle>
              <Trait color={VERT} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 15, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.55,
              }}>
                Pour recevoir tes guides prioritaires et suivre ton installation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={inputEmail}
                  onChange={e => { setInputEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleEmail()}
                  autoFocus
                  style={{
                    width: '100%', padding: '15px 18px',
                    borderRadius: 14,
                    border: `1.5px solid ${emailError ? '#C74E4E' : inputEmail.trim() ? VERT : 'var(--gris)'}`,
                    background: '#fff',
                    fontFamily: 'var(--font-corps)',
                    fontSize: 17, color: 'var(--texte)',
                    outline: 'none', textAlign: 'center',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                />
                {emailError && (
                  <p style={{ fontSize: 12, color: '#C74E4E', marginTop: 5, textAlign: 'center' }}>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Opt-in newsletter */}
              <label
                onClick={() => setNewsletter(v => !v)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  cursor: 'pointer', padding: '4px 0',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  background: newsletter ? VERT : 'white',
                  border: `2px solid ${newsletter ? VERT : 'var(--gris)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {newsletter && <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--foret)' }}>Newsletter mensuelle</strong> — nouveaux guides, alertes utiles
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--texte-sec)', marginTop: 1, opacity: 0.7 }}>
                    Optionnel · 1 email/mois max · désabonnement en 1 clic
                  </span>
                </span>
              </label>

              <button
                onClick={handleEmail}
                disabled={submitting || !inputEmail.trim()}
                style={{
                  background: (!submitting && inputEmail.trim()) ? VERT : 'var(--gris)',
                  color: (!submitting && inputEmail.trim()) ? '#fff' : 'var(--texte-sec)',
                  border: 'none', borderRadius: 14, padding: '14px',
                  fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 18,
                  cursor: (!submitting && inputEmail.trim()) ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Envoi…' : 'Créer mon accès →'}
              </button>

              <button
                onClick={skipEmail}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: 'var(--texte-sec)',
                  fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                  textDecoration: 'underline', padding: '2px 0',
                  textAlign: 'center',
                }}
              >
                Continuer sans email
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 : Profil ── */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 32 }}>
              <ContextLabel color={TERRA} size={16}>et ton projet,</ContextLabel>
              <DisplayTitle size={38}>où tu en es ?</DisplayTitle>
              <Trait color={VERT} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.50,
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
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900, fontSize: 16,
                        color: 'var(--texte)', lineHeight: 1.25,
                      }}>
                        {p.label}
                      </span>
                      <div style={{ width: 20, height: 2, background: color, borderRadius: 1, margin: '4px 0' }} />
                      <span style={{
                        fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                        fontSize: 14, color: 'var(--texte-sec)',
                      }}>
                        {p.description}
                      </span>
                    </div>
                    <span style={{ color, fontSize: 16, opacity: 0.5 }}>→</span>
                  </button>
                )
              })}
            </div>

            <button onClick={() => setStep(2)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--texte-sec)', marginTop: 20,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            }}>
              ← Modifier mon email
            </button>
          </>
        )}

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {dots.map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 3,
              borderRadius: 2,
              background: s === step ? TERRA : s < step ? VERT : 'var(--gris)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
