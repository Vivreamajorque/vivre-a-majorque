import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'
import { useQuizData } from '../hooks/useQuizData'

/*
 * Onboarding — 3 étapes :
 *   1. Prénom
 *   2. Email (optionnel)
 *   3. Profil → sélection d'un profil PRE-REMPLIT l'horizon du quiz et lance le quiz inline
 *
 * Le quiz (QuizProfil inline) devient la source unique du fléchage.
 * Le profil sélectionné en étape 3 = point d'entrée qui pré-remplit "horizon"
 * pour éviter de reposer la question plus tard dans Mon Espace.
 */

/* Mapping profil onboarding → valeur horizon quiz */
const PROFIL_TO_HORIZON = {
  reve:      'plus1an',
  installe:  'entre6et12',
  premiere:  'deja',
  confirme:  'deja',
}

/* ─── Composant quiz inline (allégé) ─────────── */
import QuizProfil from '../components/QuizProfil'

export default function Onboarding() {
  const { chooseProfile, savePrenom } = useProfile()
  const { saveQuiz } = useQuizData()
  const navigate = useNavigate()
  const [step, setStep]               = useState(1)
  const [inputPrenom, setInputPrenom] = useState('')
  const [inputEmail, setInputEmail]   = useState('')
  const [newsletter, setNewsletter]   = useState(false)
  const [emailError, setEmailError]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [selectedProfil, setSelectedProfil] = useState(null) // profil cliqué → pré-remplit quiz
  const [showQuiz, setShowQuiz] = useState(false)

  const handlePrenom = () => {
    if (!inputPrenom.trim()) return
    savePrenom(inputPrenom.trim())
    setStep(2)
  }

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleEmail = async () => {
    const email = inputEmail.trim()
    if (!email) { setEmailError('Ton adresse email est requise'); return }
    if (!isValidEmail(email)) { setEmailError('Adresse email invalide'); return }
    setEmailError('')
    setSubmitting(true)
    localStorage.setItem('vmaq_user', JSON.stringify({
      prenom: inputPrenom.trim(),
      email: email.toLowerCase(),
      newsletter,
      welcome: true,
      created_at: new Date().toISOString(),
    }))
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: inputPrenom.trim(), email, newsletter, welcome: true }),
      })
    } catch (_) { /* silencieux */ }
    setSubmitting(false)
    setStep(3)
  }

  const skipEmail = () => setStep(3)

  /* Clic sur un profil = pré-remplit horizon + lance quiz */
  const handleSelectProfil = (profil) => {
    setSelectedProfil(profil)
    // Sauver le profil de base immédiatement (fallback si quiz skippé)
    chooseProfile(profil.id)
    setShowQuiz(true)
  }

  /* Quiz complété → sauver + naviguer */
  const handleQuizComplete = (answers) => {
    const horizonFromProfil = PROFIL_TO_HORIZON[selectedProfil?.id] || answers.horizon || 'plus1an'
    // Fusionner : on garde l'horizon du profil sélectionné sauf si le quiz a une réponse explicite
    const merged = {
      horizon: answers.horizon || horizonFromProfil,
      ...answers,
    }
    saveQuiz(merged)
    navigate('/app')
  }

  /* Quiz skipé → naviguer directement */
  const handleQuizSkip = () => {
    // Sauver un profil minimal basé sur la sélection
    if (selectedProfil) {
      const horizon = PROFIL_TO_HORIZON[selectedProfil.id] || 'plus1an'
      saveQuiz({ horizon })
    }
    navigate('/app')
  }

  const dots = [1, 2, 3]

  if (showQuiz) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
        {/* Header discret avec le profil choisi */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'var(--bg)',
          padding: '16px 24px 12px',
          zIndex: 10,
          borderBottom: '1px solid var(--gris)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>{selectedProfil?.emoji}</span>
          <div>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'var(--font-corps)' }}>
              Profil : <strong style={{ color: 'var(--texte)' }}>{selectedProfil?.label}</strong>
            </p>
            <p style={{ fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'var(--font-corps)' }}>
              Quelques questions pour personnaliser votre espace
            </p>
          </div>
        </div>
        <div style={{ paddingTop: 80 }}>
          <QuizProfil
            onComplete={handleQuizComplete}
            onSkip={handleQuizSkip}
            prefill={{ horizon: PROFIL_TO_HORIZON[selectedProfil?.id] }}
            inline
          />
        </div>
      </div>
    )
  }

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

        {/* ── Step 3 : Profil → entrée dans le quiz ── */}
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
                L'appli s'adapte entièrement à ta situation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROFILS.map((p, i) => {
                const color = i % 2 === 0 ? TERRA : VERT
                return (
                  <button key={p.id} onClick={() => handleSelectProfil(p)} style={{
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
                        {p.desc}
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
