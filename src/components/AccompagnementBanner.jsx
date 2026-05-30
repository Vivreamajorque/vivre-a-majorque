import React from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '@vercel/analytics'

const FORET = '#0F3D35'
const VERT  = '#5AADA5'

const OFFRES_INFO = {
  eclaireur: {
    titre: 'Audit Éclaireur',
    prix: '290€',
    desc: 'Analyse complète de votre projet pro à Majorque — statut, fiscalité, viabilité',
    emoji: '🧭',
    id: 'eclaireur',
  },
  cap: {
    titre: 'Cap Majorque',
    prix: '249€',
    desc: "L'accompagnement complet pour votre installation",
    emoji: '📦',
    id: 'cap',
  },
}

function getOffreForCategory(category) {
  return ['Travail', 'Argent'].includes(category) ? 'eclaireur' : 'cap'
}

/*
 * AccompagnementBanner — deux modes :
 *
 * mode="soft" (défaut) : encart discret → page accompagnements
 * mode="hard"          : carte foncée → page accompagnements scrollée sur l'offre
 *                        PAS de Stripe direct — le prospect lit avant de s'engager
 */
export default function AccompagnementBanner({
  texte,
  cta = 'Voir les accompagnements →',
  style = {},
  mode = 'soft',
  offre: offreId,
  category = '',
}) {
  const navigate = useNavigate()

  /* ── Mode soft ── */
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

  /* ── Mode hard — carte sombre → page Accompagnements + scroll ancre ── */
  const id = offreId || getOffreForCategory(category)
  const o  = OFFRES_INFO[id] || OFFRES_INFO.eclaireur

  const goToOffre = () => {
    track('accompagnement_banner_clicked', { mode: 'hard', offre: id, category })
    navigate('/app/explorer/accompagnements')
    setTimeout(() => {
      const el = document.getElementById(o.id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350)
  }

  return (
    <div style={{
      background: FORET, borderRadius: 18, overflow: 'hidden',
      marginTop: 24, marginBottom: 8, ...style,
    }}>
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
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

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={goToOffre}
            style={{
              flex: 1, background: VERT, color: '#fff',
              border: 'none', padding: '12px 0', borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-corps)',
            }}
          >
            Voir cette offre →
          </button>
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

        <p style={{
          fontSize: 11, color: 'rgba(247,242,235,0.45)',
          textAlign: 'center', marginTop: 10,
          fontFamily: 'var(--font-corps)',
        }}>
          Pas de paiement immédiat · Réponse personnelle d'Amely sous 24h
        </p>
      </div>
    </div>
  )
}
