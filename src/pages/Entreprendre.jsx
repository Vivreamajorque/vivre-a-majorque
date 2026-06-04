import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import { NOTION_DB } from '../config'
import { PageHeading, AccentWord, TERRA, VERT } from '../components/WaveTitle'
import { useQuizData, isEntrepreneurProfile } from '../hooks/useQuizData'
import { useSEO } from '../hooks/useSEO'

/* ─── Données statiques ────────────────────────── */

const ECLAIREUR = {
  titre: 'Audit Éclaireur',
  prix: '290 €',
  accroche: 'Analyse complète de votre projet professionnel à Majorque',
  inclus: [
    'Analyse viabilité du projet pro en Espagne',
    'Statut optimal (autónoma, SL, télétravailleur)',
    'Fiscalité pro — IRPF, IVA, cotisations RETA',
    'Audit visibilité SEO marché francophone',
    '2 visios + dossier livré sous 5 jours',
  ],
  pour: 'Entrepreneurs, indépendants, créateurs d\'activité à Majorque',
  stripeUrl: 'https://buy.stripe.com/dRmcN4gxS4lH196fU96AM0L',
}

const INTEGRALE = {
  titre: 'L\'Installation Intégrale',
  prix: '449 €',
  prixBarre: '539 €',
  accroche: 'Cap Majorque + Audit Éclaireur — vie et activité réunies',
  stripeUrl: 'https://buy.stripe.com/eVq00i95q9G16tq6jz6AM0M',
}

const BLOCS_THEMES = [
  {
    id: 'demarrer',
    emoji: '🚀',
    label: 'Démarrer',
    titre: 'Lancer son activité',
    color: 'var(--vert)',
    bg: 'var(--vert-light)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['Autónoma vs SL', 'Séquence de lancement', 'Gestor'],
  },
  {
    id: 'fiscal',
    emoji: '📊',
    label: 'Fiscal',
    titre: 'Obligations fiscales',
    color: 'var(--terra)',
    bg: 'var(--terra-light)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['IVA (303)', 'IRPF (130)', 'RETA', 'Dépenses déductibles'],
  },
  {
    id: 'facturer',
    emoji: '🧾',
    label: 'Facturer',
    titre: 'Facturer & clients UE',
    color: '#b07d2a',
    bg: 'rgba(176,125,42,0.10)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['Mentions obligatoires', 'Inversion sujet passif', 'Modèle 349'],
  },
  {
    id: 'ouvrir',
    emoji: '🏪',
    label: 'Ouvrir',
    titre: 'Licences & autorisations',
    color: '#6B5E4E',
    bg: 'rgba(107,94,78,0.09)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['Comunicación previa', 'Licencia actividad', 'Tourisme'],
  },
  {
    id: 'tresorerie',
    emoji: '💶',
    label: 'Trésorerie',
    titre: 'Gérer son argent',
    color: 'var(--vert)',
    bg: 'var(--vert-light)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['Provisionner IVA', 'RETA mensuel', 'Acomptes IRPF'],
  },
  {
    id: 'marche',
    emoji: '🌍',
    label: 'Marché',
    titre: 'Majorque, le marché',
    color: 'var(--terra)',
    bg: 'var(--terra-light)',
    sousProfil: '🇪🇸 Entrepreneur ES',
    tags: ['Saisonnalité', 'Secteurs porteurs', 'Clientèle FR'],
  },
]

/* ─── Helpers ─────────────────────────────────── */

function isEntrepreneur(guide) {
  const sp = guide.sousProfil || []
  return sp.includes('🇪🇸 Entrepreneur ES') || sp.includes('🇫🇷 Entrepreneur FR')
}

const BLOC_KEYWORDS = {
  demarrer:    ['Aut', 'séquence', 'lancer', 'statut', 'gestor', 'choisir'],
  fiscal:      ['IRPF', 'IVA', 'RETA', 'cotis', 'déclar', '130', '303', 'dépens'],
  facturer:    ['factur', 'sujet passif', 'intracom', '349', 'client UE', 'mentions'],
  ouvrir:      ['licen', 'autoris', 'activité à Major', 'ouvrir'],
  tresorerie:  ['trésor', 'provision', 'combien', 'gérer'],
  marche:      ['marché', 'saisonn', 'secteur', 'chiffres'],
}

function guideMatchesBloc(guide, blocId) {
  const kws = BLOC_KEYWORDS[blocId] || []
  const text = guide.title.toLowerCase()
  return kws.some(k => text.includes(k.toLowerCase()))
}

/* ─── Composants ──────────────────────────────── */

function EclaireurCard({ onPaywall, isPremium }) {
  const navigate = useNavigate()
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F3D35 0%, #1a5c50 100%)',
      borderRadius: 18,
      padding: '22px 20px',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Texture subtile */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 80% 20%, rgba(90,173,165,0.18) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
        <span style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
          color: 'rgba(90,173,165,0.9)',
          background: 'rgba(90,173,165,0.12)',
          border: '1px solid rgba(90,173,165,0.3)',
          padding: '3px 10px', borderRadius: 20,
          textTransform: 'uppercase',
          fontFamily: 'var(--font-corps)',
        }}>
          ✦ Recommandé pour vous
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28, fontWeight: 900,
          color: '#F7F2EB',
          lineHeight: 1,
        }}>
          {ECLAIREUR.prix}
        </span>
      </div>

      {/* Titre */}
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22, fontWeight: 700,
        color: '#F7F2EB',
        marginBottom: 6, lineHeight: 1.25,
        position: 'relative',
      }}>
        {ECLAIREUR.titre}
      </p>
      <p style={{
        fontSize: 13, color: 'rgba(247,242,235,0.72)',
        lineHeight: 1.5, marginBottom: 16,
        position: 'relative',
      }}>
        {ECLAIREUR.accroche}
      </p>

      {/* Inclus */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18, position: 'relative' }}>
        {ECLAIREUR.inclus.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--vert)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13, color: 'rgba(247,242,235,0.88)', lineHeight: 1.45 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Pour qui */}
      <p style={{
        fontSize: 12, color: 'rgba(90,173,165,0.85)',
        fontStyle: 'italic', marginBottom: 16,
        position: 'relative',
      }}>
        {ECLAIREUR.pour}
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
        <button
          onClick={() => window.open(ECLAIREUR.stripeUrl, '_blank', 'noopener,noreferrer')}
          style={{
            flex: 1,
            padding: '13px 0',
            background: 'var(--vert)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-corps)',
          }}
        >
          Réserver →
        </button>
        <button
          onClick={() => navigate('/app/explorer/accompagnements')}
          style={{
            padding: '13px 16px',
            background: 'transparent',
            color: 'rgba(247,242,235,0.7)',
            border: '1.5px solid rgba(247,242,235,0.2)',
            borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-corps)',
            whiteSpace: 'nowrap',
          }}
        >
          Voir tout
        </button>
      </div>
    </div>
  )
}

function IntegraleStrip() {
  return (
    <div
      onClick={() => window.open(INTEGRALE.stripeUrl, '_blank', 'noopener,noreferrer')}
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid rgba(199,110,78,0.3)',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 24,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--terra)', marginBottom: 2 }}>
          💎 {INTEGRALE.titre}
        </p>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4 }}>
          {INTEGRALE.accroche}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--terra)' }}>
          {INTEGRALE.prix}
        </span>
        <br />
        <span style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'line-through' }}>
          {INTEGRALE.prixBarre}
        </span>
      </div>
    </div>
  )
}

function SectionDivider({ emoji, titre, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginTop: 28, marginBottom: 14,
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17, fontWeight: 700,
        color: 'var(--texte)',
        flex: 1,
      }}>
        {titre}
      </span>
      <div style={{ width: 32, height: 2, background: color, borderRadius: 2, opacity: 0.5 }} />
    </div>
  )
}

function GuideRow({ guide, isPremium, onPaywall }) {
  const navigate = useNavigate()
  const isPremiumLocked = guide.access === '💎 Premium' && !isPremium

  const handleClick = () => {
    if (isPremiumLocked) { onPaywall(); return }
    navigate(`/app/guide/${guide.id}`)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-card)',
        borderRadius: 12,
        border: '1px solid var(--gris)',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {/* Icône piège */}
      {guide.isPiege && (
        <span style={{ fontSize: 14, flexShrink: 0 }} title="Piège fréquent">⚠️</span>
      )}

      {/* Titre */}
      <span style={{
        flex: 1,
        fontSize: 14, lineHeight: 1.4,
        color: isPremiumLocked ? 'var(--texte-sec)' : 'var(--texte)',
        fontFamily: 'var(--font-corps)',
      }}>
        {guide.title}
      </span>

      {/* Badge accès */}
      {isPremiumLocked ? (
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: '#b07d2a',
          background: 'rgba(176,125,42,0.10)',
          padding: '2px 8px', borderRadius: 20,
          flexShrink: 0,
          fontFamily: 'var(--font-corps)',
        }}>
          💎
        </span>
      ) : (
        <span style={{ color: 'var(--texte-sec)', fontSize: 16, flexShrink: 0 }}>›</span>
      )}
    </div>
  )
}

function BlocTheme({ bloc, guides, isPremium, onPaywall }) {
  const matching = useMemo(() =>
    guides.filter(g => guideMatchesBloc(g, bloc.id)),
    [guides, bloc.id]
  )

  if (!matching.length) return null

  return (
    <div style={{ marginBottom: 6 }}>
      <SectionDivider emoji={bloc.emoji} titre={bloc.titre} color={bloc.color} />

      {/* Tags indicatifs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {bloc.tags.map(t => (
          <span key={t} style={{
            fontSize: 13, fontWeight: 600,
            color: bloc.color,
            background: bloc.bg,
            padding: '3px 9px', borderRadius: 20,
            border: `1px solid ${bloc.color}28`,
            fontFamily: 'var(--font-corps)',
          }}>
            {t}
          </span>
        ))}
      </div>

      {/* Guides */}
      {matching.map(g => (
        <GuideRow key={g.id} guide={g} isPremium={isPremium} onPaywall={onPaywall} />
      ))}
    </div>
  )
}

/* ─── Page principale ─────────────────────────── */

export default function Entreprendre() {
  useSEO({
    title: "Entreprendre à Majorque — créer son activité",
    description: "Créer son activité à Majorque : autónoma, SL, fiscalité, IVA, IRPF, facturation UE. Guide complet pour entrepreneurs francophones à Majorque.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/entreprendre",
  })
  const navigate = useNavigate()
  const { isPremium } = usePremium()
  const [showPaywall, setShowPaywall] = useState(false)
  const { quiz } = useQuizData()
  const isEntrepreneur = isEntrepreneurProfile(quiz)

  // Tous les guides catégorie Travail + Argent filtrés Entrepreneur
  const filterEntrepreneur = {
    and: [
      {
        or: [
          { property: 'Catégorie', select: { equals: 'Travail' } },
          { property: 'Catégorie', select: { equals: 'Argent' } },
        ],
      },
      { property: 'Statut_contenu', select: { equals: 'Publié' } },
    ],
  }

  const { data: raw, loading } = useNotionDB(NOTION_DB.guides, filterEntrepreneur)

  const guides = useMemo(() => {
    return raw.map(parseGuide)
  }, [raw])

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button
          onClick={() => navigate('/app/explorer')}
          style={{
            background: 'none', border: 'none', fontSize: 18,
            cursor: 'pointer', color: 'var(--foret, #0F3D35)',
            padding: 0, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← <span style={{ fontSize: 14, fontFamily: 'var(--font-corps)' }}>Explorer</span>
        </button>

        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-accent)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--vert)',
          }}>
            entreprendre à
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30, fontWeight: 900,
          color: 'var(--texte)', lineHeight: 1.15,
          marginBottom: 8,
        }}>
          Majorque
        </h1>
        <div style={{ width: 36, height: 3, background: 'var(--vert)', borderRadius: 2, marginBottom: 14 }} />
        {isEntrepreneur ? (
          <p style={{
            fontSize: 13, lineHeight: 1.55,
            padding: '10px 14px',
            background: 'rgba(90,173,165,0.12)',
            borderRadius: 10,
            borderLeft: '3px solid var(--vert)',
            color: 'var(--foret, #0F3D35)',
            marginBottom: 4,
          }}>
            ✦ Votre profil correspond à cette section — les guides et l'Audit Éclaireur sont prioritaires pour vous.
          </p>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.55, marginBottom: 4 }}>
            Guides juridiques et fiscaux vérifiés, sources officielles uniquement —
            pour créer votre activité à Majorque en connaissance de cause.
          </p>
        )}
      </div>

      {/* Bloc accompagnement — en premier */}
      <EclaireurCard isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
      <IntegraleStrip />

      {/* Séparateur */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--gris)' }} />
        <span style={{
          fontSize: 12, color: 'var(--texte-sec)',
          fontFamily: 'var(--font-accent)', fontStyle: 'italic',
        }}>
          Guides vérifiés — sources BOE &amp; AEAT
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--gris)' }} />
      </div>

      {/* Chargement */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--texte-sec)', fontSize: 14 }}>
          Chargement des guides…
        </div>
      )}

      {/* Blocs thématiques */}
      {!loading && guides.length > 0 && BLOCS_THEMES.map(bloc => (
        <BlocTheme
          key={bloc.id}
          bloc={bloc}
          guides={guides}
          isPremium={isPremium}
          onPaywall={() => setShowPaywall(true)}
        />
      ))}

      {/* Aucun guide trouvé */}
      {!loading && guides.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '32px 16px',
          color: 'var(--texte-sec)', fontSize: 14,
        }}>
          Aucun guide disponible pour le moment — revenez bientôt.
        </div>
      )}

      {/* Footer encart */}
      <div style={{
        marginTop: 28, padding: '16px',
        background: 'var(--vert-light)',
        borderRadius: 12,
        border: '1px solid rgba(90,173,165,0.2)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55, marginBottom: 8 }}>
          Ces guides donnent un cadre général fondé sur la législation officielle.
          Votre situation personnelle mérite une analyse sur-mesure.
        </p>
        <button
          onClick={() => window.open(ECLAIREUR.stripeUrl, '_blank', 'noopener,noreferrer')}
          style={{
            width: '100%', padding: '12px 0',
            background: 'var(--foret, #0F3D35)',
            color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-corps)',
          }}
        >
          Réserver l'Audit Éclaireur — 290 € →
        </button>
      </div>

      <div style={{ height: 32 }} />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
