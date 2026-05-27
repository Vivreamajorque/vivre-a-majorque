import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const PACK_3_LINK = 'https://buy.stripe.com/3cIeVc0yU8BX19623j6AM0O'

const DOSSIERS = [
  {
    slug: 'calas-hors-pistes',
    emoji: '🏖️',
    titre: '20 Calas Hors-Piste',
    desc: 'Le manuel ultime pour accéder aux criques sauvages : accès, stationnement, amendes à éviter.',
    tags: ['Plages', 'Nature', 'Incontournable'],
    premium: true,
    buyLink: 'https://buy.stripe.com/5kQ3cu2H2aK58By23j6AM0P',
  },
  {
    slug: 'experience-nautique',
    emoji: '⛵',
    titre: 'Expériences Nautiques',
    desc: 'Naviguez, plongez et explorez l\'île par la mer. 20 secrets maritimes avec les meilleurs prestataires locaux.',
    tags: ['Mer', 'Sport', 'Initié'],
    premium: true,
    buyLink: 'https://buy.stripe.com/14AcN46Xi4lHcRO23j6AM0Q',
  },
  {
    slug: 'agenda-fiestas',
    emoji: '🎉',
    titre: 'Agenda des Fiestas Populaires',
    desc: '20 célébrations locales authentiques pour s\'intégrer : défilés, traditions, fêtes de village.',
    tags: ['Culture', 'Traditions', 'Local'],
    premium: false,
    buyLink: null,
  },
  {
    slug: 'bible-tramuntana',
    emoji: '⛰️',
    titre: 'La Bible de la Tramuntana',
    desc: '20 trésors d\'altitude classés UNESCO. Sentiers oubliés, belvédères secrets, randonnées préparées.',
    tags: ['Nature', 'Randonnée', 'UNESCO'],
    premium: true,
    buyLink: 'https://buy.stripe.com/28E14ma9u7xT6tq9vL6AM0R',
  },
  {
    slug: 'table-locaux',
    emoji: '🍽️',
    titre: 'La Table des Locaux',
    desc: '20 restaurants authentiques à l\'abri des masses : rôtisseries de campagne, caves secrètes, adresses d\'initiés.',
    tags: ['Gastronomie', 'Local', 'Initié'],
    premium: true,
    buyLink: 'https://buy.stripe.com/28E4gy3L6dWheZW0Zf6AM0S',
  },
  {
    slug: 'circuit-court',
    emoji: '🥕',
    titre: 'Guide du Circuit Court',
    desc: 'Consommez sain et 100% majorquin. Coopératives, fermes bio et producteurs d\'exception.',
    tags: ['Bio', 'Local', 'Alimentation'],
    premium: true,
    buyLink: 'https://buy.stripe.com/dRm14m81maK5dVS9vL6AM0V',
  },
  {
    slug: 'majorque-vitalite',
    emoji: '🧘',
    titre: 'Majorque Vitalité',
    desc: '20 disciplines sport & bien-être pour résidents : yoga, surf, escalade, plongée — les bonnes adresses.',
    tags: ['Sport', 'Bien-être', 'Résident'],
    premium: true,
    buyLink: 'https://buy.stripe.com/aFaaEW95q5pL3hefU96AM0T',
  },
  {
    slug: 'vie-proprietaire',
    emoji: '🏡',
    titre: 'Vie de Propriétaire',
    desc: '20 fiches pratiques pour entretenir votre maison à Majorque : artisans, matériaux, démarches administratives.',
    tags: ['Immobilier', 'Pratique', 'Propriétaire'],
    premium: true,
    buyLink: 'https://buy.stripe.com/6oU6oGftO4lHg40azP6AM0U',
  },
]

export default function RessourcesLifestyle() {
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [selectedDossier, setSelectedDossier] = useState(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  function handleClick(dossier) {
    if (!dossier.premium || isPremium) {
      window.open(`/ressources/${dossier.slug}.html`, '_blank')
    } else {
      setSelectedDossier(dossier)
    }
  }

  const freeDossiers = DOSSIERS.filter(d => !d.premium)
  const premiumDossiers = DOSSIERS.filter(d => d.premium)

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="page-header">
        <button
          onClick={() => navigate('/app/explorer/boutiques')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--foret)', padding: 0, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 500,
          }}
        >
          ← <span>Bons plans</span>
        </button>
        <PageHeading label="à découvrir" title="Lifestyle" accentColor={TERRA} traitColor={TERRA} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
          Dossiers complets pour vivre Majorque comme un initié
        </p>
      </div>

      {/* Bandeau premium si non abonné */}
      {!isPremium && (
        <div
          onClick={() => setPaywallOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--foret) 0%, #3a6b1e 100%)',
            borderRadius: 14, padding: '16px 18px',
            marginBottom: 24, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <span style={{ fontSize: 28 }}>💎</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
              Tous les dossiers inclus avec Premium
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.4 }}>
              7 dossiers débloqués · À partir de 9,90€/mois
            </p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>→</span>
        </div>
      )}

      {/* Dossier gratuit */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texte-sec)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        🟢 Aperçu gratuit
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {freeDossiers.map(d => (
          <DossierCard key={d.slug} dossier={d} unlocked={true} onClick={() => handleClick(d)} />
        ))}
      </div>

      {/* Dossiers premium */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texte-sec)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        💎 Réservé aux abonnés · ou achat à l'unité
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {premiumDossiers.map(d => (
          <DossierCard key={d.slug} dossier={d} unlocked={isPremium} onClick={() => handleClick(d)} />
        ))}
      </div>

      {/* Modal achat dossier */}
      {selectedDossier && (
        <PurchaseModal
          dossier={selectedDossier}
          onClose={() => setSelectedDossier(null)}
          onSubscribe={() => { setSelectedDossier(null); setPaywallOpen(true) }}
        />
      )}

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  )
}

function DossierCard({ dossier, unlocked, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: `1.5px solid ${unlocked ? 'rgba(90,122,64,0.2)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        cursor: 'pointer',
        opacity: unlocked ? 1 : 0.8,
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 13, flexShrink: 0,
        background: unlocked ? 'var(--vert-light)' : 'var(--gris)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>
        {dossier.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 700,
          color: unlocked ? 'var(--foret)' : 'var(--texte-sec)',
          marginBottom: 5,
        }}>
          {dossier.titre}
        </p>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 8 }}>
          {dossier.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {dossier.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: unlocked ? 'var(--vert-light)' : 'var(--gris)',
              color: unlocked ? 'var(--foret)' : 'var(--texte-sec)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span style={{ fontSize: 16, color: unlocked ? 'var(--foret)' : 'var(--texte-sec)', flexShrink: 0, marginTop: 2 }}>
        {unlocked ? '→' : '🔒'}
      </span>
    </div>
  )
}

function PurchaseModal({ dossier, onClose, onSubscribe }) {
  return (
    <div
      onClick={onClose}
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
        <style>{`@keyframes slideUp { from { transform: translateY(60px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--gris)', margin: '0 auto 24px' }} />

        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{dossier.emoji}</div>
          <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 19, color: 'var(--foret)', marginBottom: 6 }}>
            {dossier.titre}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>
            {dossier.desc}
          </p>
        </div>

        {/* Option 1 — achat unitaire */}
        <a
          href={dossier.buyLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white', border: '1.5px solid rgba(90,122,64,0.3)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 10,
            textDecoration: 'none',
          }}
        >
          <div>
            <p style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 14, marginBottom: 2 }}>
              Ce dossier uniquement
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>Accès immédiat après paiement</p>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--foret)' }}>4,90€</span>
        </a>

        {/* Option 2 — pack 3 */}
        <a
          href={PACK_3_LINK}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--vert-light)', border: '1.5px solid rgba(90,122,64,0.25)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 10,
            textDecoration: 'none', position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: -8, right: 14,
            background: 'var(--terra)', color: 'white',
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          }}>
            MEILLEUR PRIX
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 14, marginBottom: 2 }}>
              Pack 3 fascicules au choix
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>4,30€ le fascicule</p>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--foret)' }}>12,90€</span>
        </a>

        {/* Option 3 — Premium */}
        <button
          onClick={onSubscribe}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'var(--foret)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 16,
            border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 2 }}>
              💎 Tous les dossiers avec Premium
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>+ guides, simulateurs, cockpit</p>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>9,90€/mois</span>
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: 'var(--texte-sec)', fontSize: 13, cursor: 'pointer', padding: '8px 0',
          }}
        >
          Pas maintenant
        </button>
      </div>
    </div>
  )
}
