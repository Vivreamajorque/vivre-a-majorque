import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '@vercel/analytics'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'
import { useQuizData, getRecommendedOffer } from '../hooks/useQuizData'
import Temoignages from '../components/Temoignages'
import PrequalificationModal from '../components/PrequalificationModal'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'
const CONTACT_EMAIL = 'lalignemallorca@gmail.com'

/*
 * PLACES DISPONIBLES — mettre à jour manuellement chaque mois.
 * 0 = pas de badge urgence sur cette offre.
 */
const PLACES_DISPO = {
  visio:      5,
  cap:        3,
  eclaireur:  2,
  integrale:  1,
}

const OFFRES = [
  {
    id: 'visio',
    label: '🚀 Lancement',
    titre: 'Conseil 45 min',
    prix: '79 €',
    prixBarre: '99 €',
    accroche: 'Votre situation analysée en 45 min — en visio ou en rencontre physique à Campos',
    couleur: '#FDF6EE',
    border: 'rgba(199,110,78,0.25)',
    textAccent: '#C76E4E',
    highlight: false,
    lancement: true,
    inclus: [
      { ok: true,  texte: '45 min de diagnostic individuel — votre situation précise, pas un cas générique' },
      { ok: true,  texte: 'En visio depuis chez vous, ou en rencontre physique à Campos (Carrer de Santanyi 19)' },
      { ok: true,  texte: 'L\'ordre exact des démarches pour votre profil — évitez les erreurs coûteuses' },
      { ok: true,  texte: 'Compte-rendu écrit sous 48h — plan d\'action, contacts, points de vigilance' },
    ],
    pour: 'Vous avez fait vos recherches mais votre situation est particulière — vous avez peur de prendre une mauvaise décision qui va coûter cher',
    sujet: 'Demande Conseil 45 min — 79€ lancement',
    stripeUrl: 'https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W',
    prequalification: false,
  },
  {
    id: 'cap',
    label: '⭐ Recommandé',
    titre: 'Cap Majorque',
    prix: '249 €',
    accroche: 'Vous avancez, on reste disponible — WhatsApp, physique, relais sur l\'île',
    couleur: '#E8F5F4',
    border: 'rgba(126,200,192,0.4)',
    textAccent: '#0F6E56',
    highlight: true,
    inclus: [
      { ok: true, texte: 'Visio 1 — diagnostic complet 60 min' },
      { ok: true, texte: 'Dossier personnalisé livré sous 72h (roadmap, points de vigilance, contacts adaptés)' },
      { ok: true, texte: 'Visio 2 — prise de route 45 min' },
      { ok: true, texte: 'Disponible par WhatsApp si vous êtes bloqué — un message suffit, pas d\'attente' },
      { ok: true, texte: 'Rencontre physique possible à Campos sur RDV — voir l\'île, poser vos questions en vrai' },
      { ok: true, texte: 'Relais de transition — courrier et colis reçus à notre adresse pendant votre installation' },
      { ok: true, texte: 'Checklist imprimable + calendrier des démarches dans l\'ordre' },
      { ok: true, texte: '79€ du Conseil déduits si réservé dans les 30 jours — vous ne payez que 170€' },
    ],
    pour: 'Familles, salariés en remote, retraités — ceux qui ne veulent pas avancer seuls',
    sujet: 'Demande Cap Majorque — 249€',
    stripeUrl: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K',
    prequalification: false,
  },
  {
    id: 'eclaireur',
    label: 'Entrepreneurs',
    titre: 'Audit Éclaireur',
    prix: '290 €',
    accroche: 'Analyse de votre projet professionnel à Majorque',
    couleur: 'var(--ocre-light)',
    border: 'rgba(199,110,78,0.2)',
    textAccent: '#7a3e22',
    highlight: false,
    inclus: [
      { ok: true, texte: 'Analyse viabilité du projet professionnel en Espagne — chiffres réels' },
      { ok: true, texte: 'Statut optimal identifié — autónoma, SL, télétravailleur détaché' },
      { ok: true, texte: 'Fiscalité pro détaillée — IRPF, IVA, obligations trimestrielles' },
      { ok: true, texte: 'Disponible par WhatsApp pendant votre lancement — un message si vous bloquez' },
      { ok: true, texte: 'Rencontre physique possible à Campos — voir l\'île, poser vos questions en vrai' },
      { ok: true, texte: 'Relais de transition — courrier et colis reçus à notre adresse (Carrer de Santanyi 19, Campos)' },
      { ok: true, texte: '79€ du Conseil déduits si réservé dans les 30 jours — vous ne payez que 211€' },
    ],
    pour: 'Entrepreneurs, indépendants, créateurs d\'activité à Majorque',
    sujet: 'Demande Audit Éclaireur — 290€',
    stripeUrl: null,
    prequalification: true, // ← formulaire à la place de Stripe
  },
  {
    id: 'integrale',
    label: '💎 Meilleure valeur',
    titre: 'L\'Installation Intégrale',
    prix: '449 €',
    prixBarre: '539 €',
    accroche: 'Cap Majorque + Audit Éclaireur — vie et activité réunies',
    couleur: '#FBF5F0',
    border: 'rgba(199,110,78,0.35)',
    textAccent: '#7a3e22',
    highlight: false,
    inclus: [
      { ok: true, texte: 'Tout le Cap Majorque (2 visios + dossier)' },
      { ok: true, texte: 'Tout l\'Audit Éclaireur (pro + fiscal + SEO)' },
      { ok: true, texte: 'Dossier unique fusionné — vie perso + projet pro' },
      { ok: true, texte: 'Disponible par WhatsApp pendant toute la durée — vie perso + lancement pro' },
      { ok: true, texte: 'Économie de 90 € vs achats séparés' },
      { ok: true, texte: '79€ du Conseil déduits si réservé dans les 30 jours — vous ne payez que 370€' },
    ],
    pour: 'Entrepreneurs qui déménagent leur vie ET leur activité à Majorque',
    sujet: 'Demande Installation Intégrale — 449€',
    stripeUrl: null,
    prequalification: true, // ← formulaire à la place de Stripe
  },
]

const FAQS = [
  {
    q: "C'est quoi exactement ce que vous faites pendant la visio ?",
    a: "Je lis votre questionnaire avant l'appel. Je n'arrive pas les mains vides. Pendant 45 minutes on travaille votre situation spécifique : ordre des démarches, points de vigilance selon votre profil, budget réaliste, questions qu'on vous posera à la préfecture ou chez le banquier. À la fin vous avez une note de route livrée sous 48h avec vos 3 priorités dans l'ordre et la première action à faire dans les 7 jours.",
  },
  {
    q: "Je peux pas trouver les mêmes infos gratuitement sur internet ?",
    a: "Vous pouvez. Il vous faudra environ 40h à éplucher des forums, des blogs datés de 2019, des sites en espagnol et des groupes Facebook où tout le monde se contredit. Ce que je fais c'est vous sortir les informations qui s'appliquent à votre situation, dans votre langue, avec les sources officielles vérifiées. Certains préfèrent chercher seuls — c'est tout à fait valable. D'autres préfèrent 45 minutes et une réponse claire.",
  },
  {
    q: "Ma situation est trop particulière / complexe pour une visio de 45 minutes.",
    a: "C'est souvent ce que pensent les gens avant d'appeler. Dans 80% des cas, une situation qui semble complexe a une logique claire une fois qu'on la décompose. Si votre situation est vraiment hors-norme, je vous le dirai honnêtement pendant la visio — et je vous orienterai vers les bons interlocuteurs (gestor, avocat spécialisé). Vous ne payez pas pour une réponse que je n'ai pas.",
  },
  {
    q: "Je ne suis pas encore sûr(e) de vouloir m'installer à Majorque.",
    a: "C'est exactement pour ça que la Visio existe. Vous repartez avec une image réaliste de ce que représente votre projet — budget, délais, obstacles. Ça aide autant à décider d'y aller qu'à décider que c'est pas le bon moment. Hervé, un de mes clients, a attendu 3 ans avant d'appeler. Après la visio, il savait exactement dans quel sens aller.",
  },
  {
    q: "Pourquoi vous et pas un cabinet de conseil en expatriation ?",
    a: "Parce que je vis ici. Pas dans un bureau à Paris avec des clients en Espagne. J'ai fait les démarches il y a un an. J'ai un compte bancaire espagnol, un statut autónoma, une fille à l'école espagnole. Je connais les délais réels, les bonnes adresses, ce qui a changé depuis la loi de 2023. Un cabinet peut vous vendre un dossier générique. Moi je vous réponds depuis l'intérieur.",
  },
  {
    q: "Et si j'ai encore des questions après la visio ?",
    a: "La note de route livrée sous 48h répond à 90% des questions qui émergent juste après. Si vous souhaitez un suivi plus long — disponibilité WhatsApp + point d'ancrage à Campos, deux sessions, dossier complet — c'est le Cap Majorque à 249€. Si votre projet est professionnel, l'Audit Éclaireur à 290€ couvre la partie activité.",
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{
      borderBottom: '0.5px solid var(--gris)',
      paddingBottom: open ? 14 : 0,
      marginBottom: open ? 4 : 0,
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none',
          cursor: 'pointer', padding: '14px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 12, textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-corps)', fontSize: 14,
          fontWeight: 600, color: FORET, lineHeight: 1.45, flex: 1,
        }}>{q}</span>
        <span style={{
          fontSize: 18, color: 'var(--texte-sec)', flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>+</span>
      </button>
      {open && (
        <p style={{
          fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.65,
          fontFamily: 'var(--font-corps)', paddingRight: 24,
        }}>{a}</p>
      )}
    </div>
  )
}

function FaqSection() {
  return (
    <div style={{ marginTop: 24, marginBottom: 8 }}>
      <p style={{
        fontFamily: 'var(--font-accent)', fontSize: 16,
        color: TERRA, marginBottom: 4,
      }}>vos questions</p>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 22, color: FORET, lineHeight: 1.1, marginBottom: 4,
      }}>Ce que tout le monde se demande</h2>
      <div style={{ width: 30, height: 3, background: VERT, borderRadius: 2, marginBottom: 16 }} />
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--gris)', padding: '0 16px' }}>
        {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
      </div>
    </div>
  )
}

function OffreCard({ offre, onPrequalify }) {
  const places = PLACES_DISPO[offre.id] || 0

  const handleReserver = () => {
    track('accompagnement_clicked', { offre: offre.titre, prix: offre.prix })
    if (offre.prequalification) {
      onPrequalify(offre)
    } else if (offre.stripeUrl) {
      window.open(offre.stripeUrl, '_blank', 'noopener,noreferrer')
    } else {
      const body = encodeURIComponent(
        `Bonjour Amely,\n\nJe souhaite réserver "${offre.titre}" à ${offre.prix}.\n\nMon projet : \n\nMa situation actuelle : \n\nMa timeline envisagée : \n\nMerci !`
      )
      window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(offre.sujet)}&body=${body}`, '_blank')
    }
  }

  /* Libellé du bouton selon le type */
  const btnLabel = offre.prequalification
    ? 'Envoyer ma demande →'
    : 'Réserver directement →'

  return (
    /* id pour le scroll depuis les CTAs dans les guides */
    <div id={offre.id} style={{
      background: offre.couleur,
      border: `1.5px solid ${offre.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
      boxShadow: offre.highlight ? '0 4px 20px rgba(126,200,192,0.18)' : 'none',
      scrollMarginTop: 80,
    }}>

      <div style={{ padding: '18px 18px 14px' }}>
        {/* Header badges + prix */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: offre.textAccent,
              background: offre.highlight ? 'rgba(126,200,192,0.25)' : 'rgba(0,0,0,0.07)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {offre.label}
            </span>
            {places > 0 && (
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: places === 1 ? '#C74E4E' : '#b07d2a',
                background: places === 1 ? 'rgba(199,78,78,0.10)' : 'rgba(176,125,42,0.10)',
                border: `1px solid ${places === 1 ? 'rgba(199,78,78,0.25)' : 'rgba(176,125,42,0.25)'}`,
                padding: '3px 9px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>
                {places === 1 ? '🔴 Dernière place' : `⚡ ${places} places ce mois`}
              </span>
            )}
            {/* Badge "sur demande" pour les offres avec pré-qualification */}
            {offre.prequalification && (
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: '#7a3e22',
                background: 'rgba(199,110,78,0.10)',
                border: '1px solid rgba(199,110,78,0.25)',
                padding: '3px 9px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>
                Sur demande
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-2xl)',
              fontWeight: 700, color: FORET,
            }}>
              {offre.prix}
            </span>
            {offre.prixBarre && (
              <span style={{
                fontSize: 13, color: 'var(--texte-sec)',
                textDecoration: 'line-through', marginLeft: 6,
              }}>
                {offre.prixBarre}
              </span>
            )}
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-xl)',
          fontWeight: 700, color: FORET, marginBottom: 6, lineHeight: 1.30,
        }}>
          {offre.titre}
        </p>

        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.50, marginBottom: 14 }}>
          {offre.accroche}
        </p>

        {/* Ce qui est inclus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {offre.inclus.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 14, flexShrink: 0, marginTop: 1,
                color: item.ok ? offre.textAccent : 'var(--texte-sec)',
                opacity: item.ok ? 1 : 0.4,
              }}>
                {item.ok ? '✓' : '✕'}
              </span>
              <span style={{
                fontSize: 14, lineHeight: 1.40,
                color: item.ok ? FORET : 'var(--texte-sec)',
                opacity: item.ok ? 1 : 0.5,
              }}>
                {item.texte}
              </span>
            </div>
          ))}
        </div>

        {/* Pour qui */}
        <p style={{
          fontSize: 12, color: offre.textAccent,
          background: 'rgba(0,0,0,0.05)', borderRadius: 8,
          padding: '7px 10px', lineHeight: 1.50, marginBottom: 14,
          fontStyle: 'italic',
        }}>
          {offre.pour}
        </p>

        {/* Explication pré-qualification si applicable */}
        {offre.prequalification && (
          <div style={{
            background: `${FORET}06`, borderRadius: 10,
            border: `1px solid ${FORET}15`,
            padding: '10px 12px', marginBottom: 12,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>📋</span>
            <p style={{ fontSize: 12, color: FORET, lineHeight: 1.55 }}>
              Pas de paiement immédiat — vous remplissez un court formulaire, Amely valide votre demande et vous envoie le lien de paiement sous 24h.
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleReserver}
          style={{
            width: '100%',
            padding: '13px 0',
            background: offre.highlight ? FORET : 'transparent',
            color: offre.highlight ? '#fff' : FORET,
            border: `1.5px solid ${FORET}`,
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-corps)',
          }}
        >
          {btnLabel}
        </button>

        {/* Mention paiement + créneau pour la Visio */}
        {offre.id === 'visio' && (
          <p style={{
            fontSize: 12, textAlign: 'center',
            color: '#5AADA5', marginTop: 8, lineHeight: 1.5,
            fontFamily: 'var(--font-corps)',
          }}>
            📅 Après le paiement, choisissez votre créneau en ligne. En visio depuis chez vous ou en rencontre physique à Campos (Carrer de Santanyi 19) — au choix.
          </p>
        )}

        {/* Urgence sous le bouton */}
        {places > 0 && (
          <p style={{
            fontSize: 12, textAlign: 'center',
            color: places === 1 ? '#C74E4E' : '#7A5A1A',
            fontWeight: 600, marginTop: 8,
            fontFamily: 'var(--font-corps)',
          }}>
            {places === 1
              ? '🔴 Dernière place disponible ce mois-ci'
              : `⚡ Plus que ${places} places disponibles en juin`}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Accompagnements() {
  const navigate = useNavigate()
  const { quiz } = useQuizData()
  const [prequalOffre, setPrequalOffre] = useState(null)

  useSEO({
    title: "Accompagnement installation à Majorque",
    description: "Audit personnalisé, visio conseil et accompagnement complet pour votre installation à Majorque. Analyses chiffrées et sourcées par Amely, française installée sur l'île. À partir de 79€.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/accompagnements",
  })

  const recommended = quiz ? getRecommendedOffer(quiz) : null

  const MSG = {
    eclaireur: { icon: '🏢', text: 'Votre profil entrepreneur correspond à l\'Audit Éclaireur — analyse complète de votre activité à Majorque.' },
    integrale:  { icon: '💎', text: 'Votre situation (urgence + projet pro) — L\'Installation Intégrale couvre votre vie et votre activité en un seul accompagnement.' },
    cap:       { icon: '🧭', text: 'Le Cap Majorque correspond à votre projet — un accompagnement complet de A à Z.' },
    visio:     { icon: '💬', text: 'Pour commencer sans engagement, la Visio conseil est faite pour vous.' },
  }
  const msg = recommended ? MSG[recommended] : null

  const offres = useMemo(() => {
    if (!recommended) return OFFRES
    return [...OFFRES].sort((a, b) => {
      if (a.id === recommended) return -1
      if (b.id === recommended) return 1
      return 0
    })
  }, [recommended])

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: VERT, fontSize: 13, fontWeight: 600,
          padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Explorer
        </button>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          votre projet
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Accompagnements
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          Commencez par le <strong style={{ color: FORET }}>Conseil 45 min</strong> — votre situation analysée, en visio ou à Campos. La suite, si vous voulez aller plus loin.
        </p>
      </div>

      {/* Message personnalisé selon quiz */}
      {msg && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: 'rgba(90,173,165,0.08)',
          border: '1px solid rgba(90,173,165,0.25)',
          borderRadius: 12, padding: '12px 14px',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.icon}</span>
          <p style={{ fontSize: 13, color: FORET, lineHeight: 1.55, fontFamily: 'var(--font-corps)' }}>
            {msg.text}
          </p>
        </div>
      )}

      {/* Conseil 45 min — premier pas obligatoire */}
      <OffreCard
        offre={offres.find(o => o.id === 'visio')}
        onPrequalify={setPrequalOffre}
      />

      {/* Séparateur — suite si vous continuez */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        margin: '8px 0 12px',
      }}>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--gris)' }} />
        <p style={{
          fontSize: 13, fontWeight: 700, color: 'var(--texte-sec)',
          fontFamily: 'var(--font-corps)', textTransform: 'uppercase',
          letterSpacing: '0.07em', whiteSpace: 'nowrap',
        }}>
          Pour aller plus loin — dans les 30 jours
        </p>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--gris)' }} />
      </div>

      {/* Encart déduction */}
      <div style={{
        background: 'rgba(15,110,86,0.06)',
        border: '1px solid rgba(15,110,86,0.15)',
        borderRadius: 12, padding: '11px 14px',
        marginBottom: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 12, color: FORET, lineHeight: 1.6, fontFamily: 'var(--font-corps)' }}>
          Les <strong>79€ du Conseil sont déduits</strong> de tout accompagnement pris dans les 30 jours — vous ne payez que la différence.
        </p>
      </div>

      {/* Cap, Éclaireur, Intégrale */}
      {offres.filter(o => o.id !== 'visio').map(offre => (
        <OffreCard key={offre.id} offre={offre} onPrequalify={setPrequalOffre} />
      ))}

      {/* Preuve sociale */}
      <Temoignages style={{ marginTop: 8, marginBottom: 16 }} />

      {/* Encart rôle & périmètre */}
      <div style={{
        background: '#F7F2EB',
        border: '1px solid rgba(15,61,53,0.12)',
        borderLeft: '3px solid #0F3D35',
        borderRadius: '0 12px 12px 0',
        padding: '18px 18px 16px',
        marginBottom: 16,
      }}>
        <p style={{
          fontSize: 12, fontWeight: 700, color: '#0F3D35',
          fontFamily: 'var(--font-corps)', textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 10,
        }}>
          📌 Ce que je fais — et ce que je ne fais pas
        </p>
        <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.65, fontFamily: 'var(--font-corps)', marginBottom: 10 }}>
          Mon rôle est de <strong>conseiller, guider, analyser et proposer les meilleures solutions</strong> pour votre projet à Majorque. Je vulgarise et simplifie des démarches complexes qui peuvent coûter cher ou générer des erreurs si elles sont mal abordées.
        </p>
        <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.65, fontFamily: 'var(--font-corps)', marginBottom: 10 }}>
          Je ne me substitue pas au <strong>gestor, à l'avocat ni au notaire</strong> — et je ne réalise pas les démarches à votre place. Pour les actes juridiques, fiscaux ou notariés, un professionnel agréé reste indispensable.
        </p>
        <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.65, fontFamily: 'var(--font-corps)', marginBottom: 10 }}>
          Toutes les informations que je délivre proviennent de <strong>sources officielles vérifiées et vérifiables</strong> : textes de loi, publications officielles (BOE, AEAT, Seguridad Social, Govern Balear). Rien d'inventé, rien de secondaire.
        </p>
        <p style={{ fontSize: 12, color: '#7A6E68', lineHeight: 1.60, fontFamily: 'var(--font-corps)', fontStyle: 'italic' }}>
          ⚠️ Les démarches peuvent varier selon les communes et les institutions. Je vous indique les règles générales applicables et vous signale les points qui méritent une vérification locale.
        </p>
      </div>

      {/* FAQ objections */}
      <FaqSection />

      <div style={{
        textAlign: 'center', padding: '16px 0 8px',
        borderTop: '0.5px solid var(--gris)',
        fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.65,
      }}>
        Une question avant de vous décider ?{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: FORET, fontWeight: 600 }}>
          Écrivez-moi →
        </a>
      </div>

      {/* Modal pré-qualification */}
      <PrequalificationModal
        offre={prequalOffre}
        isOpen={!!prequalOffre}
        onClose={() => setPrequalOffre(null)}
      />
    </div>
  )
}
