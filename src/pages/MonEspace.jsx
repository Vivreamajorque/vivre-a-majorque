import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useUserData } from '../hooks/useUserData'
import { useQuizData, getRecommendedOffer, getSuggestedGuideCategories, getSuggestedTools, isEntrepreneurProfile, getPainLabel } from '../hooks/useQuizData'
import { useNotionDB, parseCockpit, parseGuide } from '../hooks/useNotion'
import { useSavedGuides } from '../hooks/useSavedGuides'
import { NOTION_DB, PROFILS } from '../config'
import { PaywallModal } from '../components/PaywallModal'
import QuizProfil from '../components/QuizProfil'
import ProfilResume from '../components/ProfilResume'
import { TERRA, VERT, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'

const CONTACT_EMAIL = 'lalignemallorca@gmail.com'

/* ── Checked steps hook ─────────────────────── */
function useCheckedSteps(profileId) {
  const KEY = `vmaq_done_${profileId}`
  const [checked, setChecked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) }
    catch { return new Set() }
  })
  const toggle = useCallback((id) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }, [KEY])
  return [checked, toggle]
}

/* ═══════════════════════════════════════════════
   COCKPIT — refonte visuelle ludique
═══════════════════════════════════════════════ */

const PHASE_CONFIG = {
  'Avant départ':    { emoji: '✈️', color: '#5AADA5', bg: 'rgba(90,173,165,0.10)' },
  'Arrivée':         { emoji: '🏠', color: '#C76E4E', bg: 'rgba(199,110,78,0.10)' },
  'Administratif':   { emoji: '📋', color: '#7BA05B', bg: 'rgba(123,160,91,0.10)' },
  'Vie pratique':    { emoji: '🌿', color: '#b07d2a', bg: 'rgba(176,125,42,0.10)' },
  'Travail':         { emoji: '💼', color: '#5AADA5', bg: 'rgba(90,173,165,0.10)' },
  'default':         { emoji: '📌', color: '#8A7F74', bg: 'rgba(138,127,116,0.08)' },
}

function StepCard({ step, isDone, onToggle, onGuide }) {
  const navigate = useNavigate()
  const cfg = PHASE_CONFIG[step.phase] || PHASE_CONFIG.default

  return (
    <div
      onClick={() => step.guideId ? onGuide(step) : onToggle(step.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: isDone ? 'rgba(90,173,165,0.07)' : '#fff',
        borderRadius: 14,
        border: `1.5px solid ${isDone ? 'rgba(90,173,165,0.25)' : '#E8E2D9'}`,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.18s',
        opacity: isDone ? 0.72 : 1,
      }}
    >
      {/* Checkbox */}
      <div
        onClick={e => { e.stopPropagation(); onToggle(step.id) }}
        style={{
          width: 26, height: 26, flexShrink: 0,
          borderRadius: 8,
          border: `2.5px solid ${isDone ? VERT : '#D0C8BC'}`,
          background: isDone ? VERT : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s',
        }}
      >
        {isDone && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: isDone ? 400 : 600,
          color: isDone ? 'var(--texte-sec)' : 'var(--texte)',
          lineHeight: 1.35, marginBottom: 3,
          textDecoration: isDone ? 'line-through' : 'none',
        }}>
          {step.etape}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {step.categorie && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: cfg.color,
              background: cfg.bg,
              padding: '2px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              {step.categorie}
            </span>
          )}
          {step.priorite === '🔴 Urgent' && !isDone && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: '#C74E4E',
              background: 'rgba(199,78,78,0.10)',
              padding: '2px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Flèche guide */}
      {step.guideId && !isDone && (
        <span style={{ color: VERT, fontSize: 18, flexShrink: 0 }}>›</span>
      )}
    </div>
  )
}

function PhaseBlock({ phase, steps, checked, toggle, navigate, isPremium, onPaywall }) {
  const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG.default
  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const allDone = done === total

  return (
    <div style={{ marginBottom: 20 }}>
      {/* En-tête phase */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: allDone ? VERT : cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          transition: 'background 0.3s',
        }}>
          {allDone ? '✓' : cfg.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 15, fontWeight: 700,
            color: allDone ? VERT : 'var(--texte)',
            marginBottom: 3,
            fontFamily: 'var(--font-display)',
          }}>
            {phase}
          </p>
          {/* Mini barre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flex: 1, height: 4,
              background: '#E8E2D9', borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: allDone ? VERT : cfg.color,
                borderRadius: 4, transition: 'width 0.4s',
              }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--texte-sec)', fontWeight: 600, flexShrink: 0 }}>
              {done}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Étapes */}
      {steps.map(step => {
        const isDone = checked.has(step.id)
        if (!step.accessible) {
          return (
            <div key={step.id} onClick={onPaywall} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', marginBottom: 8,
              background: '#F7F2EB', borderRadius: 14,
              border: '1.5px dashed #D0C8BC',
              cursor: 'pointer', opacity: 0.75,
            }}>
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                borderRadius: 8, border: '2px solid #D0C8BC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
              }}>🔒</div>
              <span style={{ fontSize: 13, color: 'var(--texte-sec)', flex: 1 }}>
                {step.etape}
              </span>
              <span style={{
                fontSize: 11, color: '#b07d2a', fontWeight: 700,
                background: 'rgba(176,125,42,0.10)', padding: '2px 8px', borderRadius: 20,
              }}>Premium</span>
            </div>
          )
        }
        return (
          <StepCard
            key={step.id}
            step={step}
            isDone={isDone}
            onToggle={toggle}
            onGuide={(s) => navigate(`/app/guide/${s.guideId}`)}
          />
        )
      })}
    </div>
  )
}

function CockpitView({ profileNotion, profileId, onBack, onUpgrade }) {
  const { data, loading } = useNotionDB(NOTION_DB.cockpit)
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  const [checked, toggle] = useCheckedSteps(profileId)
  const [showPaywallLocal, setShowPaywallLocal] = useState(false)

  const steps = useMemo(() =>
    data.map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible === profileNotion)
      .sort((a, b) => a.ordre - b.ordre)
  , [data, profileNotion])

  const freeCount = useMemo(() => Math.max(1, Math.ceil(steps.length * 0.30)), [steps])
  const stepsWithAccess = useMemo(() =>
    steps.map((s, i) => ({ ...s, accessible: isPremium || i < freeCount }))
  , [steps, isPremium, freeCount])

  const byPhase = useMemo(() => {
    const map = {}
    stepsWithAccess.forEach(s => {
      const key = s.phase || 'Général'
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [stepsWithAccess])

  const done = stepsWithAccess.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
        <p style={{ color: 'var(--texte-sec)', fontSize: 14 }}>Chargement…</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div style={{ paddingTop: 48, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: VERT, fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Mon espace
        </button>

        {/* Titre + progression globale */}
        <div style={{
          background: 'linear-gradient(135deg, #0F3D35, #1a5c50)',
          borderRadius: 18, padding: '20px 20px 18px',
          marginBottom: 24,
        }}>
          <ContextLabel color="rgba(90,173,165,0.9)" size={13}>mon</ContextLabel>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 28, color: '#F7F2EB', lineHeight: 1.2, marginBottom: 16,
          }}>
            Cockpit
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              flex: 1, height: 8,
              background: 'rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: VERT, borderRadius: 8,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 22, color: '#F7F2EB',
            }}>
              {pct}%
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.65)', fontFamily: 'var(--font-corps)' }}>
            {done} sur {total} étapes validées
          </p>
        </div>
      </div>

      {Object.entries(byPhase).map(([phase, phaseSteps]) => (
        <PhaseBlock
          key={phase}
          phase={phase}
          steps={phaseSteps}
          checked={checked}
          toggle={toggle}
          navigate={navigate}
          isPremium={isPremium}
          onPaywall={() => setShowPaywallLocal(true)}
        />
      ))}

      <PaywallModal isOpen={showPaywallLocal} onClose={() => setShowPaywallLocal(false)} />
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MON ESPACE — dashboard personnalisé
═══════════════════════════════════════════════ */

function GuideChip({ guide, isPremium, onPaywall }) {
  const navigate = useNavigate()
  const locked = guide.access === '💎 Premium' && !isPremium

  return (
    <div
      onClick={() => locked ? onPaywall() : navigate(`/app/guide/${guide.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px',
        background: '#fff',
        border: '1px solid #E8E2D9',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 7,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {guide.isPiege && <span style={{ fontSize: 13 }}>⚠️</span>}
      <span style={{
        flex: 1, fontSize: 13, lineHeight: 1.35,
        color: locked ? 'var(--texte-sec)' : 'var(--texte)',
        fontWeight: 500,
      }}>
        {guide.title}
      </span>
      {locked
        ? <span style={{ fontSize: 11, color: '#b07d2a', fontWeight: 700 }}>💎</span>
        : <span style={{ color: VERT, fontSize: 16 }}>›</span>}
    </div>
  )
}

function SectionTitle({ children, cta, ctaTo }) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <p style={{
        fontSize: 12, fontWeight: 700,
        color: 'var(--texte-sec)', textTransform: 'uppercase',
        letterSpacing: '0.06em', fontFamily: 'var(--font-corps)',
      }}>
        {children}
      </p>
      {cta && ctaTo && (
        <button onClick={() => navigate(ctaTo)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: VERT, fontWeight: 600,
          fontFamily: 'var(--font-corps)', textDecoration: 'underline',
        }}>
          {cta}
        </button>
      )}
    </div>
  )
}

function OffreRecommandeeStrip({ quiz, navigate }) {
  const recommended = getRecommendedOffer(quiz)
  const OFFRES_MAP = {
    eclaireur: { titre: 'Audit Éclaireur', prix: '290€', emoji: '🏢', url: 'https://buy.stripe.com/dRmcN4gxS4lH196fU96AM0L', desc: 'Analyse votre projet pro à Majorque' },
    integrale:  { titre: 'Installation Intégrale', prix: '449€', emoji: '💎', url: 'https://buy.stripe.com/eVq00i95q9G16tq6jz6AM0M', desc: 'Vie + activité réunies' },
    cap:        { titre: 'Cap Majorque', prix: '249€', emoji: '🧭', url: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K', desc: 'L\'accompagnement complet' },
    visio:      { titre: 'Visio conseil', prix: '99€', emoji: '💬', url: 'https://buy.stripe.com/bJeaEW1CYcSd8By0Zf6AM0J', desc: 'Une session pour y voir clair' },
  }
  const o = OFFRES_MAP[recommended]
  if (!o) return null

  return (
    <div
      onClick={() => window.open(o.url, '_blank', 'noopener,noreferrer')}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #0F3D35, #1a5c50)',
        borderRadius: 14, marginBottom: 7,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }}>{o.emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#F7F2EB', marginBottom: 2 }}>{o.titre}</p>
        <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.65)' }}>{o.desc}</p>
      </div>
      <span style={{
        fontSize: 14, fontWeight: 700, color: VERT,
        flexShrink: 0,
      }}>
        {o.prix}
      </span>
    </div>
  )
}

function Dashboard({ onShowCockpit, onUpgrade, setShowPaywall }) {
  const { profile, chooseProfile } = useProfile()
  const { isPremium, email, logout } = usePremium()
  const navigate = useNavigate()
  const [showQuiz, setShowQuiz] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { user } = useUserData()
  const { quiz, saveQuiz, hasQuiz } = useQuizData()

  /* Déclencher quiz auto si pas encore fait */
  useEffect(() => {
    if (!hasQuiz) {
      const t = setTimeout(() => setShowQuiz(true), 800)
      return () => clearTimeout(t)
    }
  }, [hasQuiz])

  /* Guides suggérés depuis Notion */
  const suggestedCats = getSuggestedGuideCategories(quiz)
  const filterGuides = {
    and: [
      { or: suggestedCats.map(c => ({ property: 'Catégorie', select: { equals: c } })) },
      { property: 'Statut_contenu', select: { equals: 'Publié' } },
    ],
  }
  const { data: rawGuides } = useNotionDB(NOTION_DB.guides, filterGuides)
  const suggestedGuides = useMemo(() => rawGuides.map(parseGuide).slice(0, 4), [rawGuides])

  /* Cockpit — étape urgente */
  const { data: cockpitData } = useNotionDB(NOTION_DB.cockpit)
  const [checked, toggle] = useCheckedSteps(profile?.id || 'guest')
  const steps = useMemo(() =>
    cockpitData.map(parseCockpit)
      .filter(s => !profile?.notion || s.profilCible === profile.notion)
      .sort((a, b) => a.ordre - b.ordre)
  , [cockpitData, profile])
  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const nextStep = useMemo(() =>
    steps.find(s => !checked.has(s.id) && (s.priorite === '🔴 Urgent' || s.priorite === '🟠 Important'))
    || steps.find(s => !checked.has(s.id))
  , [steps, checked])

  /* Outils suggérés */
  const suggestedTools = getSuggestedTools(quiz)

  /* Salutation */
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 18 ? 'Bonjour' : 'Bonsoir'
  }, [])

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div style={{ paddingTop: 48 }}>

        {/* ── En-tête ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-accent)', fontSize: 20, color: TERRA, marginBottom: 2 }}>
            {greeting}{user?.prenom ? ` ${user.prenom}` : ''} 👋
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 30, color: 'var(--texte)', lineHeight: 1.2, marginBottom: 4,
          }}>
            Mon espace
          </h1>
          <Trait color={VERT} width={32} />
        </div>

        {/* ── CTA quiz si pas encore fait ── */}
        {!hasQuiz && (
          <button
            onClick={() => setShowQuiz(true)}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'var(--vert-light)',
              border: `1.5px dashed ${VERT}`,
              borderRadius: 14, fontSize: 14, fontWeight: 600,
              color: '#0F3D35', cursor: 'pointer',
              fontFamily: 'var(--font-corps)',
              marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>✨</span>
            <div style={{ textAlign: 'left' }}>
              <div>Personnaliser mon espace</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--texte-sec)', marginTop: 2 }}>4 questions pour tout adapter à votre situation</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
          </button>
        )}

        {/* ── Profil résumé ── */}
        {hasQuiz && (
          <ProfilResume quiz={quiz} onEdit={() => setShowQuiz(true)} />
        )}

        {/* ── Cockpit — aperçu ── */}
        {profile && total > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle cta="Tout voir →" ctaTo={null}>Mon installation</SectionTitle>
            <div
              onClick={onShowCockpit}
              style={{
                background: '#fff', border: '1px solid #E8E2D9',
                borderRadius: 14, padding: '16px', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--texte)' }}>
                  {pct === 100 ? '🎉 Tout validé !' : `${done} / ${total} étapes`}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: pct === 100 ? VERT : 'var(--texte)' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 7, background: '#E8E2D9', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: VERT, borderRadius: 8, transition: 'width 0.4s' }} />
              </div>
              {nextStep && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px',
                  background: 'rgba(199,110,78,0.08)',
                  border: '1px solid rgba(199,110,78,0.2)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 16 }}>→</span>
                  <div>
                    <p style={{ fontSize: 12, color: TERRA, fontWeight: 700, marginBottom: 1 }}>Prochaine étape</p>
                    <p style={{ fontSize: 13, color: 'var(--texte)', lineHeight: 1.35 }}>{nextStep.etape}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Guides pour vous ── */}
        {suggestedGuides.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle cta="Tous les guides →" ctaTo="/app/guides">
              {quiz ? 'Guides pour vous' : 'Guides populaires'}
            </SectionTitle>
            {suggestedGuides.map(g => (
              <GuideChip key={g.id} guide={g} isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
            ))}
          </div>
        )}

        {/* ── Offre recommandée ── */}
        {quiz && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle cta="Voir tout →" ctaTo="/app/explorer/accompagnements">
              Accompagnement recommandé
            </SectionTitle>
            <OffreRecommandeeStrip quiz={quiz} navigate={navigate} />
          </div>
        )}

        {/* ── Outils suggérés ── */}
        {suggestedTools.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle cta="Tous les outils →" ctaTo="/app/explorer/outils">Simulateurs utiles</SectionTitle>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {suggestedTools.map(t => (
                <Link key={t.id} to={t.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 14px',
                    background: '#fff', border: '1px solid #E8E2D9',
                    borderRadius: 12, fontSize: 13, fontWeight: 600,
                    color: 'var(--texte)',
                  }}>
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Accès Premium ── */}
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Mon accès</SectionTitle>
          <div style={{
            background: isPremium ? 'var(--vert-light)' : '#fff',
            border: `1px solid ${isPremium ? 'rgba(90,122,64,0.2)' : '#E8E2D9'}`,
            borderRadius: 14, padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--foret)', marginBottom: 4 }}>
                  {isPremium ? '💎 Premium actif' : '🟢 Accès gratuit'}
                </p>
                {isPremium ? (
                  email && <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{email}</p>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>Débloquez 100% des guides et tous les outils.</p>
                    <button onClick={onUpgrade} style={{
                      background: '#0F3D35', color: 'white',
                      padding: '10px 18px', borderRadius: 10,
                      fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    }}>
                      Découvrir Premium →
                    </button>
                  </>
                )}
              </div>
              {isPremium && (
                <button onClick={logout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--texte-sec)', textDecoration: 'underline',
                }}>
                  Déconnecter
                </button>
              )}
            </div>
          </div>

          {/* Gestion compte */}
          <div style={{ borderTop: '1px solid #E8E2D9', marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isPremium && (
                <a href="mailto:vivre@vivre-a-majorque.es?subject=Résiliation%20abonnement%20Premium"
                  style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Résilier mon abonnement</span><span>›</span>
                </a>
              )}
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 13, color: 'var(--texte-sec)', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                }}>
                  <span>Supprimer mes données</span><span style={{ fontSize: 12 }}>›</span>
                </button>
              ) : (
                <div style={{ background: 'rgba(199,78,78,0.05)', border: '1px solid rgba(199,78,78,0.2)', borderRadius: 10, padding: '12px' }}>
                  <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 10, lineHeight: 1.5 }}>
                    Vos données locales seront supprimées. Pour votre compte Premium, confirmation sous 72h.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`mailto:vivre@vivre-a-majorque.es?subject=Suppression%20données%20RGPD${email ? `&body=Adresse%20%3A%20${encodeURIComponent(email)}` : ''}`}
                      onClick={() => { localStorage.clear(); setShowDeleteConfirm(false) }}
                      style={{ background: '#C74E4E', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      Confirmer
                    </a>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: '1px solid #E8E2D9', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <span>Politique de confidentialité</span><span>↗</span>
              </a>
            </div>
            <p style={{ fontSize: 10, color: '#D0C8BC', marginTop: 10, lineHeight: 1.5 }}>
              RGPD · LOPDGDD · LSSI · AEPD — Amely Attias · vivre@vivre-a-majorque.es
            </p>
          </div>
        </div>
      </div>

      {showQuiz && (
        <QuizProfil
          onComplete={(answers) => { saveQuiz(answers); setShowQuiz(false) }}
          onSkip={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Composant principal
═══════════════════════════════════════════════ */
export default function MonEspace() {
  const { profile } = useProfile()
  const { isPremium } = usePremium()
  const [view, setView] = useState('dashboard')
  const [showPaywall, setShowPaywall] = useState(false)

  if (view === 'cockpit' && profile) {
    return (
      <>
        <CockpitView
          profileNotion={profile.notion}
          profileId={profile.id}
          onBack={() => setView('dashboard')}
          onUpgrade={() => { setView('dashboard'); setShowPaywall(true) }}
        />
        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    )
  }

  return (
    <>
      <Dashboard
        onShowCockpit={() => setView('cockpit')}
        onUpgrade={() => setShowPaywall(true)}
        setShowPaywall={setShowPaywall}
      />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  )
}
