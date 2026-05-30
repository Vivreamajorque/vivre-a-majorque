import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '@vercel/analytics'

const FORET = '#0F3D35'
const VERT  = '#5AADA5'
const TERRA = '#C76E4E'

/*
 * AccompagnementBanner — deux modes :
 *
 * mode="soft"  (défaut) : encart discret → page accompagnements
 * mode="hard"           : carte Éclaireur directement vers Stripe
 *
 * Le mode "hard" est utilisé dans les guides admin/fiscal/travail
 * où l'intent d'achat est le plus fort.
 *
 * Props :
 *   texte    — phrase principale contextuelle
 *   cta      — texte du bouton
 *   style    — surcharge conteneur
 *   mode     — "soft" | "hard"
 *   offre    — "eclaireur" | "cap" | "integrale" (mode hard uniquement)
 *   category — catégorie du guide pour adapter le message
 */

const OFFRES = {
  eclaireur: {
    titre: 'Audit Éclaireur',
    prix: '290€',
    desc: 'Analyse complète de votre situation + 2 visios + dossier sous 5 jours',
    stripe: 'https://buy.stripe.com/dRmcN4gxS4lH196fU96AM0L',
    emoji: '🧭',
    event: 'eclaireur_stripe_opened',
  },
  cap: {
    titre: 'Cap Majorque',
    prix: '249€',
    desc: 'L\'accompagnement complet pour votre installation',
    stripe: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K',
    emoji: '📦',
    event: 'cap_stripe_opened',
  },
}

/* Sélection de l'offre selon la catégorie du guide */
function getOffreForCategory(category) {
  const proCategories = ['Travail', 'Argent']
  return proCategories.includes(category) ? 'eclaireur' : 'cap'
}

export default function AccompagnementBanner({
  texte,
  cta = 'Voir les accompagnements →',
  style = {},
  mode = 'soft',
  offre: offreId,
  category = '',
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  /* ── Mode soft — encart discret ── */
  if (mode === 'soft') {
    return (
      <div
        onClick={() => {
          track('accompagnement_banner_clicked', { mode: 'soft' })
          navigate('/app/explorer/accompagnements')
        }}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'var(--lin, #F5F0E8)',
          borderLeft: `3px solid ${VERT}`,
          borderRadius: '0 12px 12px 0',
          padding: '14px 16px',
          marginTop: 24, marginBottom: 8,
          cursor: 'pointer', transition: 'opacity 0.15s',
          ...style,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>🧭</span>
        <div>
          <p style={{ fontSize: 14, color: FORET, lineHeight: 1.5, marginBottom: 4 }}>
            {texte}
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: VERT, textDecoration: 'underline' }}>
            {cta}
          </span>
        </div>
      </div>
    )
  }

  /* ── Mode hard — carte offre avec CTA direct Stripe ── */
  const id = offreId || getOffreForCategory(category)
  const o  = OFFRES[id] || OFFRES.eclaireur

  return (
    <div style={{
      background: FORET,
      borderRadius: 18,
      overflow: 'hidden',
      marginTop: 24, marginBottom: 8,
      ...style,
    }}>
      {/* En-tête toujours visible */}
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 16, color: '#F7F2EB', marginBottom: 4,
            }}>
              {texte || 'Cette démarche vous semble complexe ?'}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.6)', lineHeight: 1.4 }}>
              {o.desc}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 22, color: VERT, lineHeight: 1,
            }}>{o.prix}</p>
            <p style={{ fontSize: 10, color: 'rgba(247,242,235,0.5)', marginTop: 2 }}>
              {o.emoji} {o.titre}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={o.stripe}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(o.event, { source: 'guide_banner', category })}
            style={{
              flex: 1, display: 'block', textAlign: 'center',
              background: VERT, color: '#fff',
              padding: '12px 0', borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              textDecoration: 'none', fontFamily: 'var(--font-corps)',
            }}
          >
            Réserver →
          </a>
          <button
            onClick={() => {
              track('accompagnement_banner_clicked', { mode: 'hard', action: 'see_all' })
              navigate('/app/explorer/accompagnements')
            }}
            style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, cursor: 'pointer',
              fontSize: 12, color: 'rgba(247,242,235,0.7)',
              fontFamily: 'var(--font-corps)', whiteSpace: 'nowrap',
            }}
          >
            Voir tout
          </button>
        </div>
      </div>
    </div>
  )
}
