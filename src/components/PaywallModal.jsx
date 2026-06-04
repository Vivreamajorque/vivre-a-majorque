import React, { useState, useEffect } from 'react'
import { usePremium } from '../context/PremiumContext'
import { track } from '@vercel/analytics'

// Stripe payment link avec allow_promotion_codes: true
const STRIPE_LINK = 'https://buy.stripe.com/eVqcN41CY8BX8By6jz6AM0I'

export function PaywallModal({ isOpen, onClose }) {
  const { activatePremium } = usePremium()
  const [view, setView] = useState('main')
  const [emailInput, setEmailInput] = useState('')

  // Track à chaque ouverture de la modale
  useEffect(() => {
    if (isOpen) track('paywall_opened')
  }, [isOpen])
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  async function handleActivate() {
    if (!emailInput.trim()) return
    setView('loading')
    setErrorMsg('')
    const result = await activatePremium(emailInput.trim())
    if (result.success) {
      setView('success')
    } else {
      setErrorMsg(result.error || 'Aucun abonnement actif trouvé pour cet email.')
      setView('error')
    }
  }

  function handleClose() {
    setView('main')
    setEmailInput('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(26,26,26,0.55)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, margin: '0 auto',
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px 40px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(60px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Handle bar */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'var(--gris)', margin: '0 auto 24px',
        }} />

        {view === 'main' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
              <h2 style={{
                fontFamily: 'var(--font-titre)',
                fontSize: 22, color: 'var(--foret)',
                marginBottom: 8,
              }}>Contenu Premium</h2>
              <p style={{ color: 'var(--texte-sec)', fontSize: 16, lineHeight: 1.50 }}>
                Accédez à l'intégralité des guides, simulateurs et ressources pour préparer votre installation à Majorque.
              </p>
            </div>

            {/* Offre */}
            <div style={{
              background: 'var(--vert-light)',
              border: '1px solid rgba(90,122,64,0.2)',
              borderRadius: 14, padding: '16px 20px',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', fontWeight: 600 }}>
                  Offre de lancement
                </span>
                <span style={{
                  background: 'var(--foret)', color: 'white',
                  fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                }}>LIMITÉ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--foret)' }}>9,90€</span>
                <span style={{ color: 'var(--texte-sec)', fontSize: 14 }}>/mois les 3 premiers mois</span>
              </div>
              <div style={{ color: 'var(--texte-sec)', fontSize: 13 }}>9,90€/mois pendant 3 mois · puis 14,90€/mois</div>

              {/* Code promo */}
              <div style={{
                marginTop: 12, padding: '8px 12px',
                background: 'white', borderRadius: 8,
                border: '1px dashed rgba(90,122,64,0.4)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14, color: 'var(--texte-sec)' }}>Code :</span>
                <code style={{
                  fontWeight: 700, color: 'var(--foret)', fontSize: 16, letterSpacing: 1,
                  fontFamily: 'monospace',
                }}>BIENVENUE3</code>
                <span style={{ fontSize: 12, color: 'var(--texte-sec)', marginLeft: 'auto' }}>
                  à saisir au paiement
                </span>
              </div>
            </div>

            {/* CTA principal */}
            <a
              href={STRIPE_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('premium_stripe_opened')}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: 'var(--foret)', color: 'white',
                padding: '14px 0', borderRadius: 12,
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                marginBottom: 12, letterSpacing: 0.3,
              }}
            >
              S'abonner →
            </a>

            {/* Déjà abonné */}
            <button
              onClick={() => setView('login')}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: 'white',
                border: '1.5px solid var(--foret)',
                borderRadius: 10,
                color: 'var(--foret)', fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer', padding: '12px 0',
              }}
            >
              J'ai déjà un abonnement →
            </button>
          </>
        )}

        {view === 'login' && (
          <>
            <button
              onClick={() => setView('main')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte-sec)', marginBottom: 16, fontSize: 16 }}
            >
              ← Retour
            </button>
            <h2 style={{
              fontFamily: 'var(--font-titre)', fontSize: 20, color: 'var(--foret)',
              marginBottom: 8,
            }}>Activer mon accès</h2>
            <p style={{ color: 'var(--texte-sec)', fontSize: 14, marginBottom: 20, lineHeight: 1.50 }}>
              Entrez l'email utilisé lors de votre abonnement.
            </p>
            <input
              type="email"
              placeholder="votre@email.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleActivate()}
              style={{
                width: '100%', padding: '12px 16px',
                border: '1.5px solid var(--gris)', borderRadius: 10,
                fontSize: 16, background: 'white', color: 'var(--foret)',
                outline: 'none', boxSizing: 'border-box', marginBottom: 14,
              }}
              autoFocus
            />
            <button
              onClick={handleActivate}
              disabled={!emailInput.trim()}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: emailInput.trim() ? 'var(--foret)' : 'var(--gris)',
                color: emailInput.trim() ? 'white' : 'var(--texte-sec)',
                fontWeight: 700, fontSize: 16, border: 'none', cursor: emailInput.trim() ? 'pointer' : 'default',
              }}
            >
              Activer mon accès →
            </button>
          </>
        )}

        {view === 'loading' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <p style={{ color: 'var(--texte-sec)', fontSize: 16 }}>Vérification en cours…</p>
          </div>
        )}

        {view === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 20, color: 'var(--foret)', marginBottom: 8 }}>
              Accès activé !
            </h2>
            <p style={{ color: 'var(--texte-sec)', fontSize: 16, marginBottom: 24, lineHeight: 1.50 }}>
              Bienvenue dans Vivre à Majorque Premium. Tout le contenu est maintenant débloqué.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 32px', borderRadius: 10,
                background: 'var(--foret)', color: 'white',
                fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
              }}
            >
              Découvrir le contenu →
            </button>
          </div>
        )}

        {view === 'error' && (
          <>
            <button
              onClick={() => setView('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte-sec)', marginBottom: 16, fontSize: 16 }}
            >
              ← Retour
            </button>
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 18, color: 'var(--foret)', marginBottom: 8 }}>
                Abonnement introuvable
              </h2>
              <p style={{ color: 'var(--texte-sec)', fontSize: 14, lineHeight: 1.50, marginBottom: 20 }}>
                {errorMsg}
              </p>
              <a
                href={STRIPE_LINK}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px', borderRadius: 10,
                  background: 'var(--foret)', color: 'white',
                  fontWeight: 700, fontSize: 16, textDecoration: 'none',
                }}
              >
                S'abonner maintenant →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
