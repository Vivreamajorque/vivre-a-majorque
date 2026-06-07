import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { useSEO } from '../hooks/useSEO'
import { track } from '@vercel/analytics'
import { PREMIUM_STRIPE_LINK } from '../config'

const TERRA  = '#C76E4E'
const VERT   = '#5AADA5'
const FORET  = '#0F3D35'
const GOLD   = '#b07d2a'

/* ── Ce que débloque le Premium ─────────────── */
const AVANTAGES = [
  { emoji: '📚', titre: '100+ guides complets', desc: 'Chaque démarche détaillée étape par étape — NIE, autónoma, fiscalité, logement, famille' },
  { emoji: '📋', titre: 'Cockpit illimité', desc: 'Toutes les étapes de votre installation débloquées et personnalisées selon votre profil' },
  { emoji: '🧮', titre: 'Simulateurs avancés', desc: 'Budget mensuel, coût d\'installation, simulateur autónoma, calendrier fiscal, retraite' },
  { emoji: '🔔', titre: 'Alertes en temps réel', desc: 'Changements de loi, échéances fiscales, nouveaux guides — vous êtes toujours informé·e' },
  { emoji: '👥', titre: 'Annuaire des pros', desc: 'Médecins, gestors, avocats, comptables — tous francophones et vérifiés à Majorque' },
  { emoji: '🗓️', titre: 'Calendrier fiscal complet', desc: 'Toutes les échéances Hacienda, SS et AEAT pour ne jamais rater une deadline' },
]

/* ── Témoignages ─────────────────────────────── */
const TEMOIGNAGES = [
  { prenom: 'Hervé', texte: 'J\'ai attendu 6 mois avant de me décider. Après la visio, je savais exactement dans quel sens aller. L\'app m\'a économisé des semaines de recherche.', profil: 'Retraité — installé à Alcúdia' },
  { prenom: 'Cécile & Benjamin', texte: 'Le dossier Éclaireur nous a donné une vision claire de toute la complexité de notre projet. On a évité plusieurs erreurs coûteuses.', profil: 'Entrepreneurs — Palma' },
]

/* ── Offres accompagnement ───────────────────── */
const OFFRES = [
  { id: 'visio',     emoji: '💬', titre: 'Conseil 45 min',        prix: '79 €',  desc: 'Votre situation analysée — visio ou physique à Campos', stripe: 'https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W', highlight: false },
  { id: 'cap',       emoji: '🧭', titre: 'Cap Majorque',           prix: '249 €', desc: 'Accompagnement complet — WhatsApp, physique, relais île', stripe: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K', highlight: true  },
  { id: 'eclaireur', emoji: '🏢', titre: 'Audit Éclaireur',        prix: '290 €', desc: 'Votre projet pro à Majorque — statut, fiscalité, viabilité', stripe: null, highlight: false },

]

function OffreCard({ offre }) {
  const handleCTA = () => {
    track('premium_offre_clicked', { offre: offre.id })
    if (offre.stripe) window.open(offre.stripe, '_blank', 'noopener,noreferrer')
    else window.location.href = '/app/explorer/accompagnements'
  }
  return (
    <div style={{
      background: offre.highlight ? FORET : '#fff',
      border: offre.highlight ? 'none' : '1.5px solid #E0D9CF',
      borderRadius: 16, padding: '18px 16px',
      marginBottom: 10, position: 'relative',
    }}>
      {offre.highlight && (
        <span style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: GOLD, color: '#fff',
          fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
          padding: '3px 12px', borderRadius: 20,
        }}>⭐ RECOMMANDÉ</span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>{offre.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17, color: offre.highlight ? '#F7F2EB' : FORET, marginBottom: 2 }}>{offre.titre}</p>
          <p style={{ fontSize: 13, color: offre.highlight ? 'rgba(247,242,235,0.65)' : 'var(--texte-sec)', lineHeight: 1.4 }}>{offre.desc}</p>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: offre.highlight ? VERT : TERRA, flexShrink: 0 }}>{offre.prix}</span>
      </div>
      <button onClick={handleCTA} style={{
        width: '100%', padding: '11px', borderRadius: 10,
        background: offre.highlight ? TERRA : FORET,
        color: '#fff', fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 14,
        border: 'none', cursor: 'pointer',
      }}>
        {offre.stripe ? 'Réserver →' : 'En savoir plus →'}
      </button>
    </div>
  )
}

export default function Premium() {
  useSEO({
    title: 'Premium — Vivre à Majorque',
    description: 'Débloquez tous les guides, le cockpit complet et les simulateurs avancés. 9,90€/mois, résiliation à tout moment.',
    url: 'https://vivre-a-majorque.vercel.app/app/premium',
  })
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  const [tab, setTab] = useState('abonnement')

  const handleSubscribe = () => {
    track('premium_subscribe_clicked')
    window.open(PREMIUM_STRIPE_LINK, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 34, color: FORET, lineHeight: 1.1, marginBottom: 6 }}>
          Vivre à Majorque<br />
          <span style={{ color: TERRA, fontStyle: 'italic', fontWeight: 400 }}>Premium</span>
        </h1>
        <div style={{ width: 36, height: 3, background: GOLD, borderRadius: 2 }} />
      </div>

      {/* Si déjà Premium */}
      {isPremium && (
        <div style={{ background: FORET, borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 14, color: '#7EC8C0', marginBottom: 2 }}>Vous êtes déjà Premium</p>
            <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.65)' }}>Tous les guides et outils sont débloqués.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'abonnement', label: '💎 Abonnement' },
          { id: 'accompagnement', label: '🤝 Accompagnement' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 8px', borderRadius: 10,
            background: tab === t.id ? FORET : '#fff',
            color: tab === t.id ? '#F7F2EB' : 'var(--texte-sec)',
            border: `1.5px solid ${tab === t.id ? FORET : '#E0D9CF'}`,
            fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB ABONNEMENT ── */}
      {tab === 'abonnement' && (() => {
        const [annual, setAnnual] = React.useState(false)
        const stripeMonthly = 'https://buy.stripe.com/eVqcN41CY8BX8By6jz6AM0I'
        const stripeAnnual  = 'https://buy.stripe.com/bJe3cu0yU9G13hecHX6AM0Z'
        return (
        <>
          {/* Toggle mensuel / annuel */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 16, background: '#E8E3DA', borderRadius: 30, padding: 4 }}>
            {[{ label: 'Mensuel', val: false }, { label: 'Annuel · 2 mois offerts', val: true }].map(opt => (
              <button key={opt.label} onClick={() => setAnnual(opt.val)} style={{
                flex: 1, padding: '8px 12px', borderRadius: 26, border: 'none',
                background: annual === opt.val ? '#fff' : 'transparent',
                fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 13,
                color: annual === opt.val ? FORET : 'var(--texte-sec)',
                cursor: 'pointer',
                boxShadow: annual === opt.val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}>{opt.label}</button>
            ))}
          </div>

          {/* Prix hero */}
          <div style={{
            background: FORET, borderRadius: 16, padding: '24px 20px',
            marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(90,173,165,0.08)' }} />
            <p style={{ fontSize: 13, color: 'rgba(90,173,165,0.8)', fontFamily: 'var(--font-corps)', marginBottom: 8 }}>Accès complet à tout le contenu</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 48, color: '#F7F2EB', lineHeight: 1 }}>
                {annual ? '79' : '9,90'}
              </span>
              <span style={{ fontSize: 18, color: 'rgba(247,242,235,0.7)', fontFamily: 'var(--font-corps)' }}>
                {annual ? '€/an' : '€/mois'}
              </span>
            </div>
            {annual && (
              <p style={{ fontSize: 12, color: 'rgba(90,173,165,0.8)', marginBottom: 4 }}>soit 6,58€/mois · 2 mois offerts</p>
            )}
            <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.45)', marginBottom: 20 }}>
              {annual ? 'Accès 12 mois · Renouvellement annuel' : 'Résiliable à tout moment · Sans engagement'}
            </p>
            <button onClick={() => { track('subscribe_clicked', { plan: annual ? 'annual' : 'monthly' }); window.open(annual ? stripeAnnual : stripeMonthly, '_blank', 'noopener,noreferrer') }} style={{
              background: TERRA, color: '#fff', border: 'none',
              borderRadius: 30, padding: '14px 32px',
              fontFamily: 'var(--font-corps)', fontWeight: 800, fontSize: 16,
              cursor: 'pointer', width: '100%',
              boxShadow: '0 4px 20px rgba(199,110,78,0.35)',
            }}>
              {annual ? 'Démarrer — 79€/an →' : 'Démarrer — 9,90€/mois →'}
            </button>
            <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.35)', marginTop: 10 }}>Paiement sécurisé via Stripe</p>
          </div>

          {/* Avantages */}
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: FORET, marginBottom: 12 }}>Ce que vous débloquez</p>
          <div style={{ marginBottom: 24 }}>
            {AVANTAGES.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0',
                borderBottom: i < AVANTAGES.length - 1 ? '1px solid #E0D9CF' : 'none',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{a.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 14, color: FORET, marginBottom: 2 }}>{a.titre}</p>
                  <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.45 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Témoignages */}
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: FORET, marginBottom: 12 }}>Ils l'ont fait</p>
          {TEMOIGNAGES.map((t, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '16px',
              border: '1.5px solid #E0D9CF', marginBottom: 10,
            }}>
              <p style={{ fontSize: 14, color: FORET, lineHeight: 1.6, fontFamily: 'var(--font-titre)', fontStyle: 'italic', marginBottom: 10 }}>
                "{t.texte}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: VERT + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, color: VERT }}>
                  {t.prenom[0]}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: FORET }}>{t.prenom}</p>
                  <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{t.profil}</p>
                </div>
              </div>
            </div>
          ))}

          {/* CTA final */}
          <button onClick={() => { track('subscribe_clicked', { plan: annual ? 'annual' : 'monthly' }); window.open(annual ? stripeAnnual : stripeMonthly, '_blank', 'noopener,noreferrer') }} style={{
            width: '100%', padding: '16px', borderRadius: 14, marginTop: 8,
            background: TERRA, color: '#fff', border: 'none',
            fontFamily: 'var(--font-corps)', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(199,110,78,0.3)',
          }}>
            {annual ? 'Démarrer — 79€/an →' : 'Démarrer — 9,90€/mois →'}
          </button>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', textAlign: 'center', marginTop: 8 }}>
            {annual ? 'Accès 12 mois · Renouvellement annuel' : 'Résiliable à tout moment · Aucun engagement'}
          </p>
        </>
        )
      })()}

      {/* ── TAB ACCOMPAGNEMENT ── */}
      {tab === 'accompagnement' && (
        <>
          <div style={{ background: '#FFF8F0', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: '1px solid rgba(176,125,42,0.2)' }}>
            <p style={{ fontSize: 13, color: '#7A5A1A', lineHeight: 1.55, fontFamily: 'var(--font-corps)' }}>
              Un accompagnement personnalisé avec Amely — française installée à Campos depuis 2025, autónoma, maman d'une petite fille à l'école espagnole.
            </p>
          </div>
          {OFFRES.map(o => <OffreCard key={o.id} offre={o} />)}
          <p style={{ fontSize: 12, color: 'var(--texte-sec)', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
            Toutes les offres incluent l'abonnement Premium offert le 1er mois
          </p>
        </>
      )}

    </div>
  )
}
