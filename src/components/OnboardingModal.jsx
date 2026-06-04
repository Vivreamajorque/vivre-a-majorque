import { PREMIUM_STRIPE_LINK } from '../config'
import React, { useState } from 'react'

export default function OnboardingModal({ onSubmit, onDismiss }) {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [welcome, setWelcome] = useState(true)
  const [newsletter, setNewsletter] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!prenom.trim()) e.prenom = 'Votre prénom est requis'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Adresse email invalide'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    await onSubmit({ prenom, email, newsletter, welcome })
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(28,20,16,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: 'var(--bg)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px',
        width: '100%', maxWidth: 480,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.3s ease',
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0 }
            to   { transform: translateY(0);    opacity: 1 }
          }
        `}</style>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--gris-mid)', borderRadius: 2, margin: '0 auto 24px' }} />

        {/* Titre */}
        <p style={{
          fontFamily: 'var(--font-accent)', fontSize: 22,
          color: 'var(--terra)', marginBottom: 6,
        }}>
          Bienvenue 🌿
        </p>
        <h2 style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 22, color: 'var(--foret)', lineHeight: 1.3, marginBottom: 8,
        }}>
          Créez votre accès gratuit
        </h2>
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.55, marginBottom: 22 }}>
          Accès complet aux guides gratuits, suivi de votre installation, zéro spam.
        </p>

        {/* Champs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          <div>
            <input
              type="text"
              placeholder="Votre prénom"
              value={prenom}
              onChange={e => { setPrenom(e.target.value); setErrors(v => ({ ...v, prenom: null })) }}
              style={{
                width: '100%', padding: '13px 16px',
                border: `1.5px solid ${errors.prenom ? '#C74E4E' : 'var(--gris)'}`,
                borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-corps)',
                background: 'white', color: 'var(--texte)', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {errors.prenom && <p style={{ fontSize: 12, color: '#C74E4E', marginTop: 4 }}>{errors.prenom}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: null })) }}
              style={{
                width: '100%', padding: '13px 16px',
                border: `1.5px solid ${errors.email ? '#C74E4E' : 'var(--gris)'}`,
                borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-corps)',
                background: 'white', color: 'var(--texte)', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {errors.email && <p style={{ fontSize: 12, color: '#C74E4E', marginTop: 4 }}>{errors.email}</p>}
          </div>
        </div>

        {/* Consentements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {/* Email de bienvenue — pré-coché, requis */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
              background: 'var(--foret)', border: '2px solid var(--foret)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
              Recevoir un <strong style={{ color: 'var(--texte)' }}>email de bienvenue</strong> avec mes guides prioritaires selon mon profil
            </span>
          </label>

          {/* Newsletter — non pré-cochée */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
            onClick={() => setNewsletter(v => !v)}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
              background: newsletter ? 'var(--foret)' : 'white',
              border: `2px solid ${newsletter ? 'var(--foret)' : 'var(--gris-mid)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {newsletter && <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--texte)' }}>Lettres de l'île</strong> — la newsletter du mercredi, vie réelle à Majorque
              <span style={{ display: 'block', fontSize: 11, color: 'var(--gris-mid)', marginTop: 1 }}>
                Optionnel · 1 email/semaine · désabonnement en 1 clic
              </span>
            </span>
          </label>
        </div>

        {/* CTA principal */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? 'var(--gris)' : 'var(--foret)',
            color: 'white', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
            marginBottom: 10, transition: 'background 0.2s',
          }}
        >
          {loading ? 'Création en cours…' : 'Créer mon accès gratuit →'}
        </button>

        {/* CTA Premium */}
        <a
          href={PREMIUM_STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '13px',
            background: 'white',
            border: '1.5px solid var(--terra)',
            borderRadius: 14,
            fontSize: 14, fontWeight: 600,
            color: 'var(--terra)',
            textAlign: 'center',
            textDecoration: 'none',
            marginBottom: 14,
            boxSizing: 'border-box',
          }}
        >
          Accès Premium — 9,90€ le premier mois ✦
        </a>

        {/* Continuer sans compte — plus visible */}
        <button
          onClick={onDismiss}
          style={{
            width: '100%', background: 'none', border: 'none',
            fontSize: 14, color: 'var(--texte-sec)', cursor: 'pointer',
            padding: '6px 0', letterSpacing: '0.01em',
          }}
        >
          Continuer sans créer de compte →
        </button>

        {/* Mention légale */}
        <p style={{ fontSize: 10, color: 'var(--gris-mid)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          Données protégées · RGPD · LOPDGDD · Aucune vente à des tiers{'\n'}
          Responsable : Amely Attias — vivre@vivre-a-majorque.es
        </p>
      </div>
    </div>
  )
}
