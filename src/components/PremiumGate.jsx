import React from 'react'
import { usePremium } from '../context/PremiumContext'
import { PREMIUM_PRICE, PREMIUM_STRIPE_LINK } from '../config'
import { useNavigate } from 'react-router-dom'

export default function PremiumGate({ children, accessLevel }) {
  const { canAccess } = usePremium()

  if (canAccess(accessLevel)) return children

  return (
    <div style={{
      background: 'linear-gradient(to bottom, transparent, var(--lin))',
      position: 'relative',
    }}>
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', maxHeight: 120, overflow: 'hidden', opacity: 0.5 }}>
        {children}
      </div>
      <div style={{
        background: '#fff',
        border: '1px solid var(--gris)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        textAlign: 'center',
        margin: '12px 0',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
        <h4 style={{ fontFamily: 'var(--font-titre)', fontSize: 17, marginBottom: 6 }}>
          Contenu Premium
        </h4>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 16 }}>
          Accédez à 35+ guides détaillés pour {PREMIUM_PRICE}
        </p>
        <a
          href={PREMIUM_STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ocre"
          style={{ display: 'inline-flex', fontSize: 14, padding: '10px 20px', borderRadius: 8, background: 'var(--ocre)', color: '#fff', textDecoration: 'none', fontWeight: 500 }}
        >
          Devenir Premium
        </a>
        <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 10 }}>
          Déjà Premium ? <a href="/app/moi" style={{ color: 'var(--vert-dark)' }}>Connectez-vous</a>
        </p>
      </div>
    </div>
  )
}
