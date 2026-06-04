import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useNotionBlocks, useNotionPage, useNotionDB, parseGuide } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import { useSavedGuides } from '../hooks/useSavedGuides'
import { useSEO } from '../hooks/useSEO'
import NotionBlocks, { extractHeadings, estimateReadingTime } from '../components/NotionBlocks'
import AccompagnementBanner from '../components/AccompagnementBanner'
import PremiumGate from '../components/PremiumGate'
import { NOTION_DB } from '../config'

/* ── Guides liés à un simulateur de l'app ── */
const GUIDE_SIMULATEURS = {
  '36891a14-59f7-81ba-a303-c227233bf3d1': {
    label: '🧮 Simulateur Budget mensuel',
    desc: 'Calculez votre budget personnalisé selon votre composition familiale et votre mode de vie.',
    path: '/app/outils/budget',
  },
  '36a91a14-59f7-8155-a9a9-d2cb4b457044': {
    label: '🧮 Simulateur Coût d\'installation',
    desc: 'Estimez précisément le capital de départ nécessaire selon votre situation.',
    path: '/app/outils/cout',
  },
}

/* Correspondance par mots-clés du titre — fonctionne même sans ID Notion connu */
const GUIDE_SIMULATEURS_KEYWORDS = [
  {
    keywords: ['retraite', 'pension', 'IRPF retraité', 'S1'],
    sim: {
      label: '🏖️ Simulateur retraite',
      desc: 'Ma pension change-t-elle si je pars en Espagne ? Convention fiscale, fonctionnaire vs privé, formulaire S1 — résultat en 3 étapes.',
      path: '/app/outils/retraite',
    },
  },
  {
    keywords: ['budget', 'dépenses', 'coût de la vie', 'combien'],
    sim: {
      label: '🧮 Simulateur Budget mensuel',
      desc: 'Calculez votre budget personnalisé selon votre composition familiale et votre mode de vie.',
      path: '/app/outils/budget',
    },
  },
  {
    keywords: ['autónomo', 'autónoma', 'auto-entrepreneur', 'cotisation', 'tarifa plana'],
    sim: {
      label: '📊 Simulateur autónomo',
      desc: 'Comparez auto-entrepreneur France vs autónomo Espagne. Calculez votre net en poche.',
      path: '/app/outils/autonoma',
    },
  },
  {
    keywords: ['NIE', 'TIE', 'installation', 'frais', 'dépôt', 'bail'],
    sim: {
      label: '🏠 Simulateur Coût d\'installation',
      desc: 'Estimez précisément le capital de départ nécessaire selon votre situation.',
      path: '/app/outils/cout',
    },
  },
  {
    keywords: ['fiscal', 'modelo', 'déclaration', 'IRPF', 'IVA', 'échéance'],
    sim: {
      label: '📅 Calendrier fiscal',
      desc: 'Toutes vos échéances fiscales en Espagne : IRPF, IVA, renta annuelle.',
      path: '/app/outils/fiscal',
    },
  },
]

function findSimulateur(guide) {
  if (!guide) return null
  // 1. Lookup exact par ID
  const byId = GUIDE_SIMULATEURS[guide.id] || GUIDE_SIMULATEURS[guide.id?.replace(/-/g,'')]
  if (byId) return byId
  // 2. Fallback par mots-clés dans le titre
  if (!guide.title) return null
  const titleLower = guide.title.toLowerCase()
  for (const entry of GUIDE_SIMULATEURS_KEYWORDS) {
    if (entry.keywords.some(kw => titleLower.includes(kw.toLowerCase()))) {
      return entry.sim
    }
  }
  return null
}

/* ── Coche une étape Cockpit dans localStorage ── */
function useCockpitStep(stepId, profileId) {
  const [done, setDone] = useState(() => {
    if (!stepId || !profileId) return false
    try {
      return new Set(JSON.parse(localStorage.getItem(`vmaq_done_${profileId}`) || '[]')).has(stepId)
    } catch { return false }
  })

  const validate = useCallback(() => {
    if (!stepId || !profileId) return
    const KEY = `vmaq_done_${profileId}`
    try {
      const current = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
      current.add(stepId)
      localStorage.setItem(KEY, JSON.stringify([...current]))
      setDone(true)
    } catch {}
  }, [stepId, profileId])

  return { done, validate }
}

/* ── Barre de progression ── */
function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      setPct(Math.min(100, Math.round((window.scrollY / max) * 100)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 3, background: 'var(--gris)' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'linear-gradient(90deg, var(--vert), var(--terra))',
        borderRadius: '0 2px 2px 0', transition: 'width 0.15s linear',
      }} />
    </div>
  )
}

/* ── Table des matières ── */
function TableOfContents({ headings }) {
  const [open, setOpen] = useState(true)
  if (!headings.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius-sm)', marginBottom: 20, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 600,
        color: 'var(--texte)', cursor: 'pointer', background: 'none', border: 'none',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📋 Sommaire</span>
        <span style={{ color: 'var(--texte-sec)', fontSize: 12, display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--gris)', padding: '6px 0' }}>
          {headings.map(h => (
            <div key={h.id}
              onClick={() => { const el = document.getElementById(`notion-${h.id}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', fontSize: 14, color: 'var(--texte-sec)', cursor: 'pointer' }}
            >
              <div style={{ width: h.level === 1 ? 6 : 4, height: h.level === 1 ? 6 : 4, borderRadius: '50%', background: h.level === 1 ? 'var(--vert)' : 'var(--gris-mid)', flexShrink: 0, marginLeft: h.level === 2 ? 4 : 0 }} />
              <span style={{ lineHeight: 1.40 }}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Bouton bookmark — accessible à tous ── */
function BookmarkButton({ guide }) {
  const { isSaved, toggle } = useSavedGuides()
  const saved = isSaved(guide.id)
  const [burst, setBurst] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const tipRef = useRef(null)

  const handleClick = () => {
    const wasNew = !saved
    toggle(guide)
    if (wasNew) {
      setBurst(true)
      setTimeout(() => setBurst(false), 400)
      setShowTip(true)
      clearTimeout(tipRef.current)
      tipRef.current = setTimeout(() => setShowTip(false), 2800)
    }
  }
  useEffect(() => () => clearTimeout(tipRef.current), [])

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={handleClick}
        title={saved ? 'Retiré de mes guides' : 'Sauvegarder ce guide'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px',
          borderRadius: 20,
          background: saved ? 'rgba(90,173,165,0.12)' : '#fff',
          border: `1.5px solid ${saved ? 'var(--vert)' : 'var(--gris)'}`,
          cursor: 'pointer',
          transition: 'all 0.18s',
          transform: burst ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        {/* Icône signet SVG — claire et universelle */}
        <svg width="14" height="16" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0 }}>
          <path
            d="M1 1h12v16l-6-4-6 4V1z"
            fill={saved ? 'var(--vert)' : 'none'}
            stroke={saved ? 'var(--vert)' : 'var(--gris-mid)'}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: saved ? 'var(--vert)' : 'var(--texte-sec)',
          fontFamily: 'var(--font-corps)',
          whiteSpace: 'nowrap',
        }}>
          {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </span>
      </button>

      {showTip && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
          background: '#0F3D35', color: 'white', fontSize: 13, lineHeight: 1.5,
          padding: '9px 14px', borderRadius: 12, whiteSpace: 'nowrap',
          zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          fontFamily: 'var(--font-corps)',
        }}>
          ✅ Ajouté à <strong>Mes guides</strong> dans Mon espace
          <div style={{
            position: 'absolute', bottom: -5, right: 16,
            width: 10, height: 10,
            background: '#0F3D35',
            transform: 'rotate(45deg)', borderRadius: 2,
          }} />
        </div>
      )}
    </div>
  )
}

/* ── Skeleton ── */
function HeaderSkeleton() {
  return (
    <div style={{ paddingTop: 52, marginBottom: 4 }}>
      <div style={{ height: 16, background: 'var(--gris)', borderRadius: 8, width: '35%', marginBottom: 20, opacity: 0.5 }} />
      <div style={{ height: 14, background: 'var(--gris)', borderRadius: 6, width: '40%', marginBottom: 14, opacity: 0.4 }} />
      <div style={{ height: 30, background: 'var(--gris)', borderRadius: 8, width: '95%', marginBottom: 8, opacity: 0.4 }} />
      <div style={{ height: 30, background: 'var(--gris)', borderRadius: 8, width: '75%', marginBottom: 16, opacity: 0.4 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 26, background: 'var(--gris)', borderRadius: 20, width: 80, opacity: 0.4 }} />
        <div style={{ height: 26, background: 'var(--gris)', borderRadius: 20, width: 110, opacity: 0.4 }} />
      </div>
    </div>
  )
}

/* ── CTA validation étape Cockpit ── */
function CockpitValidationCTA({ stepId, profileId }) {
  const navigate = useNavigate()
  const { done, validate } = useCockpitStep(stepId, profileId)
  const [justValidated, setJustValidated] = useState(false)

  const handleValidate = () => {
    validate()
    setJustValidated(true)
    setTimeout(() => navigate(-1), 1200)
  }

  if (done && !justValidated) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--vert-light)',
        border: '1px solid rgba(90,173,165,0.3)',
        borderRadius: 'var(--radius)', padding: '16px 18px',
        marginTop: 24,
      }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', fontWeight: 600, marginBottom: 2 }}>
            Étape déjà validée
          </p>
          <p style={{ fontSize: 14, color: 'var(--texte-sec)' }}>
            Cette étape est cochée dans votre Cockpit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--foret)',
      borderRadius: 'var(--radius)',
      padding: '20px 18px',
      marginTop: 24,
      textAlign: 'center',
    }}>
      {justValidated ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'white' }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16, fontWeight: 600 }}>Étape validée ! Retour au Cockpit…</span>
        </div>
      ) : (
        <>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 14, lineHeight: 1.50 }}>
            Vous avez lu ce guide ?
          </p>
          <button
            onClick={handleValidate}
            style={{
              background: 'white',
              color: 'var(--foret)',
              border: 'none',
              borderRadius: 20,
              padding: '12px 28px',
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <span>✅</span> Valider cette étape
          </button>
        </>
      )}
    </div>
  )
}

/* ── Page principale ── */
/* ── Composant Guides Liés façon blog ───────────────── */
function GuidesLies({ currentGuide, navigate }) {
  const { data: allGuides, loading } = useNotionDB(NOTION_DB.guides)

  const lies = useMemo(() => {
    if (!allGuides?.length || !currentGuide) return []
    const guides = allGuides.map(parseGuide).filter(g => g.id !== currentGuide.id)

    // Score de pertinence : même catégorie + tags communs
    const scored = guides.map(g => {
      let score = 0
      if (g.category === currentGuide.category) score += 3
      const currentTags = currentGuide.tags || []
      const gTags = g.tags || []
      const commonTags = currentTags.filter(t => gTags.includes(t))
      score += commonTags.length * 2
      // Même situation cible
      const currentSit = currentGuide.situation || []
      const gSit = g.situation || []
      if (currentSit.some(s => gSit.includes(s))) score += 1
      return { ...g, score }
    })

    return scored
      .filter(g => g.score > 0 && g.access !== '🚀 Éclaireur')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [allGuides, currentGuide])

  if (loading || lies.length === 0) return null

  return (
    <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--gris)' }}>
      <p style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 20, color: '#1C1410', marginBottom: 16,
      }}>
        À lire aussi
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lies.map(g => (
          <button key={g.id} onClick={() => navigate(`/app/guide/${g.id}`)}
            style={{
              width: '100%', textAlign: 'left',
              background: '#fff', border: '1px solid var(--gris)',
              borderRadius: 12, padding: '14px 16px',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#5AADA5'; e.currentTarget.style.background = '#F8FDFC' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gris)'; e.currentTarget.style.background = '#fff' }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: 'rgba(90,173,165,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              📄
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-corps)', fontWeight: 600,
                fontSize: 14, color: '#1C1410', lineHeight: 1.3,
                marginBottom: 3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {g.title}
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {g.category && (
                  <span style={{
                    fontSize: 11, color: '#5AADA5', fontWeight: 600,
                    fontFamily: 'var(--font-corps)',
                  }}>{g.category}</span>
                )}
                {g.access !== '🟢 Public' && (
                  <span style={{ fontSize: 10, color: '#b07d2a', fontWeight: 600 }}>💎 Premium</span>
                )}
              </div>
            </div>
            <span style={{ color: '#5AADA5', fontSize: 16, flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /* Contexte Cockpit — présent seulement si on arrive depuis Mon Espace */
  const stepId    = searchParams.get('stepId')
  const profileId = searchParams.get('profileId')

  const { page: rawPage, loading: pageLoading } = useNotionPage(id)
  const { blocks, loading: blocksLoading } = useNotionBlocks(id)
  const { canAccess, isPremium, email } = usePremium()

  const guide = rawPage ? parseGuide(rawPage) : null
  const headings = extractHeadings(blocks)
  const readingTime = estimateReadingTime(blocks)
  const sectionCount = headings.filter(h => h.level === 1).length

  /* ── SEO dynamique — métas spécifiques à chaque guide ── */
  const CAT_DESCRIPTIONS = {
    'Administratif': `Démarche administrative pour les Français à Majorque — ${guide?.title || ''}. NIE, empadronamiento, résidence. Guide officiel sourcé.`,
    'Logement':      `Trouver un logement à Majorque — ${guide?.title || ''}. Conseils et étapes pour les expats français.`,
    'Travail':       `Travail et activité professionnelle à Majorque — ${guide?.title || ''}. Autónomo, contrat, fiscalité pro.`,
    'Argent':        `Finances et fiscalité à Majorque — ${guide?.title || ''}. IRPF, IVA, convention franco-espagnole.`,
    'Santé':         `Santé et couverture médicale à Majorque — ${guide?.title || ''}. Seguridad Social, carte SIP.`,
    'Famille':       `Installation en famille à Majorque — ${guide?.title || ''}. Scolarité, démarches pour les enfants.`,
    'Voiture':       `Voiture et transport à Majorque — ${guide?.title || ''}. Immatriculation, permis de conduire.`,
  }
  useSEO({
    // Passer null tant que le guide n'est pas chargé → le hook ne fait rien
    title: guide?.title || null,
    description: guide?.title
      ? (CAT_DESCRIPTIONS[guide.category] || `Guide pratique — ${guide.title}. Tout ce que les Français doivent savoir pour s'installer à Majorque.`)
      : null,
    url: `https://vivre-a-majorque.vercel.app/app/guide/${id}`,
    type: 'article',
  })


  /* ── Schema FAQPage — extrait les H2 + paragraphe suivant pour Google ── */
  useEffect(() => {
    if (!blocks || blocks.length === 0 || blocksLoading) return
    const faqs = []
    blocks.forEach((block, i) => {
      const isH2 = block.type === 'heading_2'
      if (isH2) {
        const question = block.heading_2?.rich_text?.map(t => t.plain_text).join('') || ''
        const next = blocks[i + 1]
        const answer = next?.paragraph?.rich_text?.map(t => t.plain_text).join('') || ''
        if (question && answer) {
          faqs.push({
            '@type': 'Question',
            'name': question,
            'acceptedAnswer': { '@type': 'Answer', 'text': answer }
          })
        }
      }
    })
    if (faqs.length === 0) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-schema', 'faqpage')
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs
    })
    document.head.appendChild(script)
    return () => {
      const el = document.querySelector('script[data-schema="faqpage"]')
      if (el) document.head.removeChild(el)
    }
  }, [blocks, blocksLoading])

  return (
    <div className="page" style={{ padding: 0 }}>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <ReadingProgress />

      <div style={{ padding: '0 20px 100px' }}>

        {/* ── Header ── */}
        {pageLoading ? (
          <HeaderSkeleton />
        ) : (
          <div style={{ paddingTop: 52, marginBottom: 4 }}>
            <button onClick={() => navigate(-1)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--vert)', fontSize: 14, fontWeight: 500,
              marginBottom: 20, cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            }}>
              ← {stepId ? 'Retour au Cockpit' : 'Retour aux guides'}
            </button>

            {guide && (
              <>
                {/* Bandeau Cockpit si contexte */}
                {stepId && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(45,80,22,0.07)',
                    border: '1px solid rgba(45,80,22,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px', marginBottom: 14,
                    fontSize: 13, color: 'var(--foret)', fontWeight: 500,
                  }}>
                    <span>🧭</span>
                    <span>Étape de votre Cockpit — lisez et validez en bas de page</span>
                  </div>
                )}

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {guide.category && <span className="badge badge-gris">{guide.category}</span>}
                  {guide.isPiege && <span className="badge badge-ocre">⚠️ Piège fréquent</span>}
                  {guide.access !== '🟢 Public' && <span className="badge badge-miel">💎 Premium</span>}
                </div>

                {/* Titre + bookmark */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <h1 style={{
                    flex: 1, fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                    fontWeight: 300, fontSize: 'var(--fs-2xl)', color: 'var(--foret)', lineHeight: 1.25,
                  }}>
                    {guide.title}
                  </h1>
                  <BookmarkButton guide={guide} />
                </div>

                {/* Stats pills */}
                {!blocksLoading && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[
                      { icon: '⏱', text: `~${readingTime} min` },
                      sectionCount > 0 && { icon: '📑', text: `${sectionCount} section${sectionCount > 1 ? 's' : ''}` },
                      guide.source && { icon: '✅', text: guide.source },
                    ].filter(Boolean).map((pill, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'var(--bg-card)', border: '1px solid var(--gris)',
                        borderRadius: 20, padding: '4px 12px',
                        fontSize: 13, color: 'var(--texte-sec)', fontWeight: 500,
                      }}>
                        <span>{pill.icon}</span><span>{pill.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TOC */}
                {!blocksLoading && headings.length >= 3 && (
                  <TableOfContents headings={headings} />
                )}
              </>
            )}
          </div>
        )}

        <div className="divider" />

        {/* ── Contenu ── */}
        {blocksLoading ? (
          <div className="spinner">Chargement du contenu…</div>
        ) : guide && !canAccess(guide.access) ? (
          <PremiumGate accessLevel={guide.access}>
            <div style={{ height: 200 }} />
          </PremiumGate>
        ) : (
          <>
            <NotionBlocksWithAnchors blocks={blocks} />

            {/* CTA simulateur si guide lié à un outil */}
            {guide && (() => {
              const sim = findSimulateur(guide)
              if (!sim) return null
              return (
                <div style={{
                  background: 'linear-gradient(135deg, var(--foret) 0%, #3D6B20 100%)',
                  borderRadius: 'var(--radius)', padding: '20px 18px', marginTop: 24,
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
                    Outil interactif disponible
                  </p>
                  <p style={{ fontFamily: 'var(--font-titre)', fontSize: 18, color: 'white', fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                    {sim.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
                    {sim.desc}
                  </p>
                  <button
                    onClick={() => navigate(sim.path)}
                    style={{
                      background: 'white', color: 'var(--foret)',
                      border: 'none', borderRadius: 20,
                      padding: '11px 22px', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    Lancer le simulateur →
                  </button>
                </div>
              )
            })()}

            {/* Guides liés façon blog */}
            {guide && <GuidesLies currentGuide={guide} navigate={navigate} />}

            {/* CTA validation Cockpit — uniquement si on vient du Cockpit */}
            {stepId && profileId ? (
              <CockpitValidationCTA stepId={stepId} profileId={profileId} />
            ) : (
              <div style={{ margin: '24px 0 0' }}>
                {/* Mode hard (CTA Stripe direct) pour les catégories à fort intent d'achat */}
                {['Administratif', 'Travail', 'Argent', 'Voiture', 'Logement'].includes(guide.category) ? (
                  <AccompagnementBanner
                    mode="hard"
                    category={guide.category}
                    texte="Cette démarche vous semble complexe à appliquer à votre situation ?"
                  />
                ) : (
                  <AccompagnementBanner
                    texte="Cette démarche vous semble complexe à appliquer à votre situation personnelle ?"
                    cta="Je vous accompagne pas à pas →"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function NotionBlocksWithAnchors({ blocks }) {
  if (!blocks?.length) return null
  return (
    <div>
      {blocks.map(b => {
        if (b.type === 'heading_1' || b.type === 'heading_2') {
          return (
            <div key={b.id} id={`notion-${b.id}`} style={{ scrollMarginTop: 20 }}>
              <NotionBlocks blocks={[b]} />
            </div>
          )
        }
        return <NotionBlocks key={b.id} blocks={[b]} />
      })}
    </div>
  )
}
