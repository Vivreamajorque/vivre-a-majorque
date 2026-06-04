import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import { SectionHead, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'
const PACK_3_LINK = 'https://buy.stripe.com/3cIeVc0yU8BX19623j6AM0O'

const DOSSIERS = [
  {
    slug: 'calas-hors-pistes',
    emoji: '🏖️',
    titre: '20 Calas Hors-Piste',
    soustitre: 'Le manuel des criques sauvages',
    desc: 'Accès, stationnement, amendes à éviter — les spots que les locaux gardent secrets.',
    tags: ['Plages', 'Nature'],
    couleur: '#5AADA5',
    bg: '#E8F5F5',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/5kQ3cu2H2aK58By23j6AM0P',
    pages: '32 pages',
  },
  {
    slug: 'experience-nautique',
    emoji: '⛵',
    titre: 'Expériences Nautiques',
    soustitre: 'Découvrir l\'île par la mer',
    desc: 'Naviguez, plongez et explorez. 20 secrets maritimes avec les meilleurs prestataires locaux.',
    tags: ['Mer', 'Sport'],
    couleur: '#2D7BA5',
    bg: '#E6F3FA',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/14AcN46Xi4lHcRO23j6AM0Q',
    pages: '28 pages',
  },
  {
    slug: 'agenda-fiestas',
    emoji: '🎉',
    titre: 'Agenda des Fiestas',
    soustitre: 'Fêtes populaires & traditions',
    desc: '20 célébrations locales authentiques pour s\'intégrer : défilés, fêtes de village, traditions.',
    tags: ['Culture', 'Local'],
    couleur: '#C76E4E',
    bg: '#FAEEE9',
    premium: false,
    ready: true,
    buyLink: null,
    pages: '24 pages',
  },
  {
    slug: 'bible-tramuntana',
    emoji: '⛰️',
    titre: 'La Bible de la Tramuntana',
    soustitre: 'Trésors d\'altitude UNESCO',
    desc: '20 trésors classés UNESCO. Sentiers oubliés, belvédères secrets, randonnées préparées.',
    tags: ['Nature', 'Randonnée'],
    couleur: '#5A7A40',
    bg: '#EDF4E6',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/28E14ma9u7xT6tq9vL6AM0R',
    pages: '36 pages',
  },
  {
    slug: 'table-locaux',
    emoji: '🍽️',
    titre: 'La Table des Locaux',
    soustitre: 'Restaurants authentiques',
    desc: '20 adresses loin des masses : rôtisseries de campagne, caves secrètes, initiés seulement.',
    tags: ['Gastronomie', 'Local'],
    couleur: '#8B4513',
    bg: '#F9EDE5',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/28E4gy3L6dWheZW0Zf6AM0S',
    pages: '30 pages',
  },
  {
    slug: 'circuit-court',
    emoji: '🥕',
    titre: 'Guide du Circuit Court',
    soustitre: '100% Majorquin, 100% local',
    desc: 'Coopératives, fermes bio et producteurs d\'exception pour consommer sain et local.',
    tags: ['Bio', 'Alimentation'],
    couleur: '#7BA05B',
    bg: '#EEF5E8',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/dRm14m81maK5dVS9vL6AM0V',
    pages: '26 pages',
  },
  {
    slug: 'majorque-vitalite',
    emoji: '🧘',
    titre: 'Majorque Vitalité',
    soustitre: 'Sport & bien-être pour résidents',
    desc: '20 disciplines : yoga, surf, escalade, plongée — les bonnes adresses pour résidents.',
    tags: ['Sport', 'Bien-être'],
    couleur: '#7B68AA',
    bg: '#F0EEF8',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/aFaaEW95q5pL3hefU96AM0T',
    pages: '28 pages',
  },
  {
    slug: 'vie-proprietaire',
    emoji: '🏡',
    titre: 'Vie de Propriétaire',
    soustitre: 'Entretenir sa maison à Majorque',
    desc: '20 fiches pratiques : artisans fiables, matériaux, démarches administratives.',
    tags: ['Immobilier', 'Pratique'],
    couleur: '#A0785A',
    bg: '#F5EDE8',
    premium: true,
    ready: false,
    buyLink: 'https://buy.stripe.com/6oU6oGftO4lHg40azP6AM0U',
    pages: '34 pages',
  },
]

/* ── Mockup couverture de guide ─────────────── */
function GuideCover({ dossier, unlocked, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: unlocked || !dossier.premium ? 'pointer' : 'pointer',
        position: 'relative',
      }}
    >
      {/* Couverture style livret */}
      <div style={{
        background: dossier.bg,
        borderRadius: '12px 12px 0 0',
        padding: '20px 16px 16px',
        position: 'relative',
        overflow: 'hidden',
        border: `1.5px solid ${dossier.couleur}30`,
        borderBottom: 'none',
        minHeight: 130,
      }}>
        {/* Trait coloré latéral gauche — style reliure */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 5,
          background: `linear-gradient(180deg, ${dossier.couleur}, ${dossier.couleur}88)`,
          borderRadius: '12px 0 0 0',
        }} />

        {/* Verrou premium */}
        {dossier.premium && !unlocked && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            fontSize: 14, opacity: 0.6,
          }}>🔒</div>
        )}

        {/* Emoji + contenu */}
        <div style={{ paddingLeft: 12 }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>{dossier.emoji}</div>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 16, color: FORET, lineHeight: 1.2,
            marginBottom: 3, fontWeight: 400,
          }}>
            {dossier.titre}
          </p>
          <p style={{
            fontSize: 13, fontWeight: 600,
            color: dossier.couleur,
            fontFamily: 'var(--font-corps)',
            marginBottom: 8,
          }}>
            {dossier.soustitre}
          </p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {dossier.tags.map(t => (
              <span key={t} style={{
                fontSize: 12, fontWeight: 700,
                color: dossier.couleur,
                background: `${dossier.couleur}18`,
                padding: '2px 8px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Pied de couverture — style 4e de couv */}
      <div style={{
        background: dossier.couleur,
        borderRadius: '0 0 12px 12px',
        padding: '10px 14px 10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1.5px solid ${dossier.couleur}`,
        borderTop: 'none',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-corps)' }}>
            {dossier.pages}
          </span>
          {!dossier.premium && (
            <span style={{
              fontSize: 12, fontWeight: 800,
              background: 'rgba(255,255,255,0.2)',
              color: '#fff', padding: '2px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              GRATUIT
            </span>
          )}
          {dossier.premium && unlocked && (
            <span style={{
              fontSize: 12, fontWeight: 800,
              background: 'rgba(255,255,255,0.2)',
              color: '#fff', padding: '2px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              ✓ INCLUS
            </span>
          )}
          {dossier.premium && !unlocked && (
            <span style={{
              fontSize: 12, fontWeight: 800,
              background: 'rgba(255,255,255,0.2)',
              color: '#fff', padding: '2px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              4,90€
            </span>
          )}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>›</span>
      </div>
    </div>
  )
}

/* ── Modal achat ────────────────────────────── */
function PurchaseModal({ dossier, onClose, onSubscribe }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,61,53,0.6)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, margin: '0 auto',
          background: 'var(--bg)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 20px 40px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(60px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--gris)', margin: '0 auto 24px' }} />

        {/* Mini couverture */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px', background: dossier.bg,
          borderRadius: 14, marginBottom: 22,
          borderLeft: `4px solid ${dossier.couleur}`,
        }}>
          <span style={{ fontSize: 32 }}>{dossier.emoji}</span>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: FORET, marginBottom: 2 }}>
              {dossier.titre}
            </p>
            <p style={{ fontSize: 12, color: dossier.couleur, fontWeight: 600 }}>{dossier.pages}</p>
          </div>
        </div>

        {/* Option 1 — achat unitaire */}
        {dossier.buyLink && dossier.ready && (
          <a href={dossier.buyLink} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', border: `1.5px solid ${dossier.couleur}40`,
            borderRadius: 14, padding: '14px 18px', marginBottom: 10,
            textDecoration: 'none',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: FORET, fontSize: 15, marginBottom: 2 }}>
                Ce guide uniquement
              </p>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>Accès immédiat</p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 20, color: dossier.couleur }}>4,90€</span>
          </a>
        )}
        {dossier.buyLink && !dossier.ready && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--gris)', border: '1.5px solid #D4CCC2',
            borderRadius: 14, padding: '14px 18px', marginBottom: 10,
          }}>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--texte-sec)', fontSize: 15, marginBottom: 2 }}>
                Ce guide
              </p>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>Disponible prochainement</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8A7F74', background: '#E0D9CF', padding: '4px 12px', borderRadius: 20 }}>Bientôt</span>
          </div>
        )}

        {/* Option 2 — pack 3 */}
        <a href={PACK_3_LINK} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--vert-light)', border: '1.5px solid rgba(90,173,165,0.3)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 10,
          textDecoration: 'none', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -8, right: 14,
            background: TERRA, color: 'white',
            fontSize: 13, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
          }}>
            MEILLEUR PRIX
          </div>
          <div>
            <p style={{ fontWeight: 700, color: FORET, fontSize: 15, marginBottom: 2 }}>
              Pack 3 guides au choix
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>4,30€ le guide</p>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 20, color: VERT }}>12,90€</span>
        </a>

        {/* Option 3 — Premium */}
        <button onClick={onSubscribe} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: FORET,
          borderRadius: 14, padding: '14px 18px', marginBottom: 16,
          border: 'none', cursor: 'pointer',
        }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 2 }}>
              💎 Tous les guides avec Premium
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>+ guides admin, simulateurs, cockpit</p>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 18, color: VERT }}>9,90€/mois</span>
        </button>

        <button onClick={onClose} style={{
          width: '100%', background: 'none', border: 'none',
          color: 'var(--texte-sec)', fontSize: 14, cursor: 'pointer', padding: '8px 0',
          fontFamily: 'var(--font-corps)',
        }}>
          Pas maintenant
        </button>
      </div>
    </div>
  )
}

/* ── Page principale ────────────────────────── */
export default function RessourcesLifestyle() {
  useSEO({
    title: "Mini guides lifestyle Majorque",
    description: "Guides pratiques pour profiter de Majorque : 20 calas hors-piste, expériences nautiques, agenda des fêtes locales, restaurants des locaux, Tramuntana secrète.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/lifestyle",
  })
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [selectedDossier, setSelectedDossier] = useState(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  function handleClick(dossier) {
    if (!dossier.premium) {
      window.open(`/ressources/${dossier.slug}.html`, '_blank')
    } else if (isPremium) {
      window.open(`/ressources/${dossier.slug}.html`, '_blank')
    } else {
      setSelectedDossier(dossier)
    }
  }

  const freeDossiers = DOSSIERS.filter(d => !d.premium)
  const premiumDossiers = DOSSIERS.filter(d => d.premium)

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 24 }}>
        <button onClick={() => navigate('/app/explorer/boutiques')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: VERT, fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', marginBottom: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Boutique
        </button>

        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          à découvrir
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Mini guides thématiques
        </h1>
        <div style={{ width: 36, height: 3, background: TERRA, borderRadius: 2, marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          Des guides interactifs pour vivre Majorque comme un initié — chaque guide est une immersion dans un univers de l'île.
        </p>
      </div>

      {/* ── Bandeau Premium ── */}
      {!isPremium && (
        <div
          onClick={() => setPaywallOpen(true)}
          style={{
            background: FORET,
            borderRadius: 16, padding: '16px 18px',
            marginBottom: 24, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <span style={{ fontSize: 26 }}>💎</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              Tous les guides inclus avec Premium
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.4 }}>
              7 guides débloqués · À partir de 9,90€/mois
            </p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>›</span>
        </div>
      )}

      {/* ── Guide gratuit ── */}
      <SectionHead title="Accès gratuit" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {freeDossiers.map(d => (
          <GuideCover key={d.slug} dossier={d} unlocked={true} onClick={() => handleClick(d)} />
        ))}
      </div>

      {/* ── Guides Premium ── */}
      <SectionHead
        title={isPremium ? 'Vos guides Premium' : 'Guides Premium'}
        cta={!isPremium ? 'À partir de 4,90€ →' : null}
        onCta={() => setPaywallOpen(true)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {premiumDossiers.map(d => (
          <GuideCover key={d.slug} dossier={d} unlocked={isPremium} onClick={() => handleClick(d)} />
        ))}
      </div>

      {/* Modals */}
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
