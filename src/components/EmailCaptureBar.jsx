import React, { useState } from 'react'
import { track } from '@vercel/analytics'

const FORET = '#0F3D35'
const VERT  = '#5AADA5'
const TERRA = '#C76E4E'

/*
 * Bannière de capture email — affichée dans Mon Espace
 * pour les utilisateurs qui ont skippé l'email à l'onboarding.
 * Dismissable avec localStorage pour ne pas réapparaître.
 */
export default function EmailCaptureBar({ prenom }) {
  const DISMISS_KEY = 'vmaq_email_bar_dismissed'
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  )
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  if (dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
    track('email_bar_dismissed')
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = async () => {
    if (!isValid) { setError('Email invalide'); return }
    setLoading(true)
    setError('')

    localStorage.setItem('vmaq_user', JSON.stringify({
      prenom: prenom || '',
      email: email.trim().toLowerCase(),
      newsletter: true,
      welcome: true,
      created_at: new Date().toISOString(),
    }))

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: prenom || '', email: email.trim(), newsletter: true }),
      })
      track('email_captured', { source: 'email_bar' })
    } catch (_) {}

    setLoading(false)
    setSubmitted(true)

    // Masquer après 3 secondes
    setTimeout(() => {
      localStorage.setItem(DISMISS_KEY, 'true')
      setDismissed(true)
    }, 3000)
  }

  if (submitted) {
    return (
      <div style={{
        background: `${VERT}12`,
        border: `1.5px solid ${VERT}35`,
        borderRadius: 16, padding: '16px 18px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 2 }}>
            C'est noté !
          </p>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
            Vous recevrez vos ressources par email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: FORET,
      borderRadius: 18, padding: '18px 18px',
      marginBottom: 24,
      position: 'relative',
    }}>
      {/* Bouton fermer */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: 'rgba(255,255,255,0.7)', fontSize: 14,
          width: 26, height: 26, borderRadius: '50%',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-corps)',
        }}
        aria-label="Fermer"
      >
        ×
      </button>

      <p style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 17, color: '#F7F2EB', marginBottom: 6,
        paddingRight: 30,
      }}>
        Restez dans la boucle
      </p>
      <p style={{
        fontSize: 12, color: 'rgba(247,242,235,0.65)',
        lineHeight: 1.5, marginBottom: 14,
      }}>
        Guides prioritaires, alertes deadlines, nouveautés exclusives.
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1, padding: '11px 14px',
            borderRadius: 12, border: 'none',
            background: 'rgba(255,255,255,0.12)',
            color: '#F7F2EB', fontSize: 14,
            fontFamily: 'var(--font-corps)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
          style={{
            padding: '11px 16px',
            background: VERT, color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700,
            cursor: email.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-corps)',
            whiteSpace: 'nowrap',
            opacity: !email.trim() ? 0.6 : 1,
          }}
        >
          {loading ? '…' : 'Recevoir →'}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 13, color: '#F0A0A0', marginTop: 6 }}>{error}</p>
      )}
    </div>
  )
}
