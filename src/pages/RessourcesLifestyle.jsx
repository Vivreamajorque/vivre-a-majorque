import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'

const DOSSIERS = [
  {
    slug: 'calas-hors-pistes',
    emoji: '🏖️',
    titre: '20 Calas Hors-Piste',
    desc: 'Le manuel ultime pour accéder aux criques sauvages : accès, stationnement, amendes à éviter.',
    tags: ['Plages', 'Nature', 'Incontournable'],
    premium: true,
  },
  {
    slug: 'experience-nautique',
    emoji: '⛵',
    titre: 'Expériences Nautiques',
    desc: 'Naviguez, plongez et explorez l\'île par la mer. 20 secrets maritimes avec les meilleurs prestataires locaux.',
    tags: ['Mer', 'Sport', 'Initié'],
    premium: true,
  },
  {
    slug: 'agenda-fiestas',
    emoji: '🎉',
    titre: 'Agenda des Fiestas Populaires',
    desc: '20 célébrations locales authentiques pour s\'intégrer : défilés, traditions, fêtes de village.',
    tags: ['Culture', 'Traditions', 'Local'],
    premium: false,
  },
  {
    slug: 'bible-tramuntana',
    emoji: '⛰️',
    titre: 'La Bible de la Tramuntana',
    desc: '20 trésors d\'altitude classés UNESCO. Sentiers oubliés, belvédères secrets, randonnées préparées.',
    tags: ['Nature', 'Randonnée', 'UNESCO'],
    premium: true,
  },
  {
    slug: 'table-locaux',
    emoji: '🍽️',
    titre: 'La Table des Locaux',
    desc: '20 restaurants authentiques à l\'abri des masses : rôtisseries de campagne, caves secrètes, adresses d\'initiés.',
    tags: ['Gastronomie', 'Local', 'Initié'],
    premium: true,
  },
  {
    slug: 'circuit-court',
    emoji: '🥕',
    titre: 'Guide du Circuit Court',
    desc: 'Consommez sain et 100% majorquin. Coopératives, fermes bio et producteurs d\'exception.',
    tags: ['Bio', 'Local', 'Alimentation'],
    premium: false,
  },
  {
    slug: 'majorque-vitalite',
    emoji: '🧘',
    titre: 'Majorque Vitalité',
    desc: '20 disciplines sport & bien-être pour résidents : yoga, surf, escalade, plongée — les bonnes adresses.',
    tags: ['Sport', 'Bien-être', 'Résident'],
    premium: true,
  },
  {
    slug: 'vie-proprietaire',
    emoji: '🏡',
    titre: 'Vie de Propriétaire',
    desc: '20 fiches pratiques pour entretenir votre maison à Majorque : artisans, matériaux, démarches administratives.',
    tags: ['Immobilier', 'Pratique', 'Propriétaire'],
    premium: true,
  },
]

export default function RessourcesLifestyle() {
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [paywallOpen, setPaywallOpen] = useState(false)

  function handleClick(dossier) {
    if (dossier.premium && !isPremium) {
      setPaywallOpen(true)
      return
    }
    window.open(`/ressources/${dossier.slug}.html`, '_blank')
  }

  const free = DOSSIERS.filter(d => !d.premium)
  const premium = DOSSIERS.filter(d => d.premium)

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
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Ressources Lifestyle
        </h1>
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
              Accès illimité avec Premium
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.4 }}>
              {premium.length} dossiers débloqués · À partir de 9,90€/mois
            </p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>→</span>
        </div>
      )}

      {/* Dossiers gratuits */}
      {free.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texte-sec)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            🟢 Accès libre
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {free.map(d => (
              <DossierCard key={d.slug} dossier={d} isPremium={true} onClick={() => handleClick(d)} />
            ))}
          </div>
        </>
      )}

      {/* Dossiers premium */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texte-sec)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        💎 Contenu Premium
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {premium.map(d => (
          <DossierCard key={d.slug} dossier={d} isPremium={isPremium} onClick={() => handleClick(d)} />
        ))}
      </div>

      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  )
}

function DossierCard({ dossier, isPremium, onClick }) {
  const locked = dossier.premium && !isPremium

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: `1.5px solid ${locked ? 'rgba(0,0,0,0.06)' : 'rgba(90,122,64,0.2)'}`,
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        cursor: 'pointer',
        opacity: locked ? 0.75 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Emoji icône */}
      <div style={{
        width: 52, height: 52, borderRadius: 13, flexShrink: 0,
        background: locked ? 'var(--gris)' : 'var(--vert-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>
        {locked ? '🔒' : dossier.emoji}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-titre)',
          fontSize: 15, fontWeight: 700,
          color: locked ? 'var(--texte-sec)' : 'var(--foret)',
          marginBottom: 5,
        }}>
          {dossier.titre}
        </p>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 8 }}>
          {dossier.desc}
        </p>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {dossier.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 600,
              padding: '2px 8px', borderRadius: 20,
              background: locked ? 'var(--gris)' : 'var(--vert-light)',
              color: locked ? 'var(--texte-sec)' : 'var(--foret)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Flèche ou cadenas */}
      <span style={{ fontSize: 16, color: locked ? 'var(--texte-sec)' : 'var(--foret)', flexShrink: 0, marginTop: 2 }}>
        {locked ? '🔒' : '→'}
      </span>
    </div>
  )
}
