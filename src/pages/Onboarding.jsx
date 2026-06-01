import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { PROFILS } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'
import { useQuizData } from '../hooks/useQuizData'
import { track } from '@vercel/analytics'
import QuizProfil from '../components/QuizProfil'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'

const PROFIL_TO_HORIZON = {
  reve:      'plus1an',
  installe:  'entre6et12',
  premiere:  'deja',
  confirme:  'deja',
}

/* Ce que reçoit l'utilisateur selon son profil — affiché dans le step email */
const PROFIL_PROMESSES = {
  reve:     ['Le guide "Partir vivre à Majorque" offert', 'Alertes sur les nouveaux guides admin', 'Accès prioritaire aux accompagnements'],
  installe: ['Check-list d\'installation complète par email', 'Alertes deadlines NIE, empadronamiento, SS', 'Accès prioritaire aux accompagnements'],
  premiere: ['Récapitulatif fiscal autónomo du trimestre', 'Alertes Hacienda & SS à ne pas rater', 'Accès prioritaire aux accompagnements'],
  confirme: ['Ressources lifestyle exclusives', 'Infos communauté francophone Majorque', 'Accès prioritaire aux accompagnements'],
}

export default function Onboarding() {
  useSEO({
    title: "Bienvenue — Vivre à Majorque",
    description: "Créez votre profil pour accéder aux guides et outils personnalisés pour votre installation à Majorque.",
    url: "https://vivre-a-majorque.vercel.app/onboarding",
    robots: "noindex, nofollow",
  })
  const { chooseProfile, savePrenom } = useProfile()
  const { saveQuiz } = useQuizData()
  const navigate = useNavigate()

  const [step, setStep]               = useState(1)
  const [inputPrenom, setInputPrenom] = useState('')
  const [inputEmail, setInputEmail]   = useState('')
  const [newsletter, setNewsletter]   = useState(true) // coché par défaut
  const [emailError, setEmailError]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [selectedProfil, setSelectedProfil] = useState(null)
  const [showQuiz, setShowQuiz]       = useState(false)

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
        body: JSON.stringify({
          prenom: inputPrenom.trim(),
          email,
          newsletter,
          welcome: true,
          profil: selectedProfil?.id || '',
        }),
      })
      track('email_captured', { newsletter: String(newsletter) })
    } catch (_) { /* silencieux */ }

    setSubmitting(false)
    setStep(3)
  }

  /* Skip discret — on sauvegarde quand même le prénom */
  const skipEmail = () => {
    track('email_skipped')
    setStep(3)
  }

  const handleSelectProfil = (profil) => {
    setSelectedProfil(profil)
    chooseProfile(profil.id)
    setShowQuiz(true)
  }

  const handleQuizComplete = (answers) => {
    const horizonFromProfil = PROFIL_TO_HORIZON[selectedProfil?.id] || answers.horizon || 'plus1an'
    const merged = { horizon: answers.horizon || horizonFromProfil, ...answers }
    saveQuiz(merged)
    navigate('/app')
  }

  const handleQuizSkip = () => {
    if (selectedProfil) {
      const horizon = PROFIL_TO_HORIZON[selectedProfil.id] || 'plus1an'
      saveQuiz({ horizon })
    }
    navigate('/app')
  }

  const dots = [1, 2, 3]
  const promesses = selectedProfil ? (PROFIL_PROMESSES[selectedProfil.id] || PROFIL_PROMESSES.reve) : PROFIL_PROMESSES.reve

  /* ── Mode quiz inline ── */
  if (showQuiz) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'var(--bg)', padding: '16px 24px 12px',
          zIndex: 10, borderBottom: '1px solid var(--gris)',
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
              <ContextLabel color={VERT} size={16}>bienvenue sur</ContextLabel>
              <DisplayTitle size={38}>Vivre à Majorque</DisplayTitle>
              <Trait color={TERRA} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.55,
              }}>
                L'app des francophones qui s'installent à Majorque. Commençons par votre prénom.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Votre prénom…"
                value={inputPrenom}
                onChange={e => setInputPrenom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePrenom()}
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px',
                  borderRadius: 14,
                  border: `1.5px solid ${inputPrenom.trim() ? TERRA : 'var(--gris)'}`,
                  background: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26,
                  color: 'var(--texte)', outline: 'none', textAlign: 'center',
                  letterSpacing: '-0.01em', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <button onClick={handlePrenom} disabled={!inputPrenom.trim()} style={{
                background: inputPrenom.trim() ? TERRA : 'var(--gris)',
                color: inputPrenom.trim() ? '#fff' : 'var(--texte-sec)',
                border: 'none', borderRadius: 14, padding: '14px',
                fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 18,
                cursor: inputPrenom.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2 : Email — proposition de valeur forte ── */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <ContextLabel color={TERRA} size={16}>
                {inputPrenom ? `${inputPrenom},` : 'et'}
              </ContextLabel>
              <DisplayTitle size={34}>restez informé·e</DisplayTitle>
              <Trait color={VERT} width={44} />
            </div>

            {/* Ce que tu reçois — la vraie valeur */}
            <div style={{
              background: FORET,
              borderRadius: 16, padding: '16px 18px',
              marginBottom: 20,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: 'rgba(90,173,165,0.9)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                fontFamily: 'var(--font-corps)', marginBottom: 12,
              }}>
                Ce que vous recevez gratuitement
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {promesses.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: VERT, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'rgba(247,242,235,0.88)', lineHeight: 1.45 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={inputEmail}
                  onChange={e => { setInputEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleEmail()}
                  autoFocus
                  style={{
                    width: '100%', padding: '15px 18px',
                    borderRadius: 14,
                    border: `1.5px solid ${emailError ? '#C74E4E' : inputEmail.trim() ? VERT : 'var(--gris)'}`,
                    background: '#fff', fontFamily: 'var(--font-corps)',
                    fontSize: 17, color: 'var(--texte)', outline: 'none', textAlign: 'center',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                />
                {emailError && (
                  <p style={{ fontSize: 12, color: '#C74E4E', marginTop: 5, textAlign: 'center' }}>
                    {emailError}
                  </p>
                )}
              </div>

              <button
                onClick={handleEmail}
                disabled={submitting || !inputEmail.trim()}
                style={{
                  background: (!submitting && inputEmail.trim()) ? FORET : 'var(--gris)',
                  color: (!submitting && inputEmail.trim()) ? '#fff' : 'var(--texte-sec)',
                  border: 'none', borderRadius: 14, padding: '15px',
                  fontFamily: 'var(--font-corps)', fontSize: 15, fontWeight: 700,
                  cursor: (!submitting && inputEmail.trim()) ? 'pointer' : 'default',
                  transition: 'background 0.2s', letterSpacing: '0.01em',
                }}
              >
                {submitting ? 'Envoi…' : `Recevoir mes ressources gratuites →`}
              </button>

              <p style={{ fontSize: 11, color: 'var(--texte-sec)', textAlign: 'center', lineHeight: 1.5 }}>
                Désabonnement en 1 clic · Aucun spam · RGPD
              </p>

              {/* Skip très discret */}
              <button
                onClick={skipEmail}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--texte-sec)', opacity: 0.6,
                  fontFamily: 'var(--font-corps)',
                  textDecoration: 'none', padding: '4px 0',
                  textAlign: 'center',
                }}
              >
                Passer cette étape
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 : Profil ── */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 32 }}>
              <ContextLabel color={TERRA} size={16}>et votre projet,</ContextLabel>
              <DisplayTitle size={38}>où en êtes-vous ?</DisplayTitle>
              <Trait color={VERT} width={44} />
              <p style={{
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 16, color: 'var(--texte-sec)', marginTop: 14, lineHeight: 1.50,
              }}>
                L'app s'adapte entièrement à votre situation.
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
                        display: 'block', fontFamily: 'var(--font-display)',
                        fontWeight: 900, fontSize: 16, color: 'var(--texte)', lineHeight: 1.25,
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
              fontSize: 13, color: 'var(--texte-sec)', marginTop: 20,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: 'var(--font-corps)',
            }}>
              ← Retour
            </button>
          </>
        )}

        {/* Dots de progression */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {dots.map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 3, borderRadius: 2,
              background: s === step ? TERRA : s < step ? VERT : 'var(--gris)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
