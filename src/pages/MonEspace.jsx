import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useUserData } from '../hooks/useUserData'
import {
  useQuizData, getRecommendedOffer, getSuggestedGuideCategories,
  getSuggestedTools, isEntrepreneurProfile, getProfileLabelFromQuiz,
} from '../hooks/useQuizData'
import { useNotionDB, parseCockpit, parseGuide } from '../hooks/useNotion'
import { useSavedGuides } from '../hooks/useSavedGuides'
import { NOTION_DB, PROFILS } from '../config'
import { PaywallModal } from '../components/PaywallModal'
import QuizProfil from '../components/QuizProfil'
import ProfilResume from '../components/ProfilResume'
import { TERRA, VERT, DisplayTitle, ContextLabel, Trait } from '../components/WaveTitle'

const CONTACT_EMAIL = 'lalignemallorca@gmail.com'

/* ── Checked steps ─────────────────────────── */
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
   COCKPIT REFONDU — ultra-ludique
═══════════════════════════════════════════════ */

const PHASE_META = {
  'Avant départ':  { emoji: '✈️', color: '#5AADA5', badge: 'bg-vert' },
  'Arrivée':       { emoji: '🏠', color: '#C76E4E', badge: 'bg-terra' },
  'Administratif': { emoji: '📋', color: '#7BA05B', badge: 'bg-foret' },
  'Vie pratique':  { emoji: '🌿', color: '#b07d2a', badge: 'bg-gold' },
  'Travail':       { emoji: '💼', color: '#5AADA5', badge: 'bg-vert' },
  'Général':       { emoji: '📌', color: '#8A7F74', badge: '' },
}

/* ── Carte tâche compacte ───────────────────── */
function TaskRow({ step, isDone, onToggle, navigate }) {
  const meta = PHASE_META[step.phase] || PHASE_META['Général']
  const isUrgent = step.priorite === '🔴 Urgent' && !isDone

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px',
        background: isDone ? `${meta.color}08` : '#fff',
        borderRadius: 12,
        border: `1.5px solid ${isDone ? `${meta.color}22` : isUrgent ? '#C74E4E33' : '#E8E2D9'}`,
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => step.guideId ? navigate(`/app/guide/${step.guideId}`) : onToggle(step.id)}
    >
      {/* Indicateur urgent */}
      {isUrgent && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, background: '#C74E4E', borderRadius: '12px 0 0 12px',
        }} />
      )}

      {/* Checkbox cliquable */}
      <div
        onClick={e => { e.stopPropagation(); onToggle(step.id) }}
        style={{
          width: 24, height: 24, flexShrink: 0,
          borderRadius: 7,
          border: `2px solid ${isDone ? VERT : '#D0C8BC'}`,
          background: isDone ? VERT : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
      >
        {isDone && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: isDone ? 400 : 500,
          color: isDone ? 'var(--texte-sec)' : 'var(--texte)',
          lineHeight: 1.3,
          textDecoration: isDone ? 'line-through' : 'none',
          textDecorationColor: '#aaa',
        }}>
          {step.etape}
        </p>
      </div>

      {/* Flèche guide */}
      {step.guideId && !isDone && (
        <span style={{ color: VERT, fontSize: 16, flexShrink: 0, opacity: 0.7 }}>›</span>
      )}
    </div>
  )
}

/* ── Bloc phase accordéon ───────────────────── */
function PhaseAccordion({ phase, steps, checked, toggle, navigate, isPremium, onPaywall, defaultOpen }) {
  const meta = PHASE_META[phase] || PHASE_META['Général']
  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const allDone = done === total
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      borderRadius: 14,
      border: `1.5px solid ${allDone ? `${VERT}30` : '#E8E2D9'}`,
      overflow: 'hidden',
      marginBottom: 10,
      background: allDone ? `${VERT}05` : '#fff',
      transition: 'all 0.2s',
    }}>
      {/* Header accordéon */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Icône phase */}
        <div style={{
          width: 34, height: 34, flexShrink: 0,
          borderRadius: 9,
          background: allDone ? VERT : `${meta.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
          transition: 'background 0.3s',
        }}>
          {allDone ? (
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : meta.emoji}
        </div>

        {/* Nom + mini-barre */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: allDone ? VERT : 'var(--texte)',
              fontFamily: 'var(--font-display)',
            }}>
              {phase}
            </p>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: allDone ? VERT : done > 0 ? meta.color : 'var(--texte-sec)',
              fontFamily: 'var(--font-corps)',
            }}>
              {done}/{total}
            </span>
          </div>
          {/* Barre */}
          <div style={{
            height: 4, background: '#E8E2D9',
            borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: allDone ? VERT : meta.color,
              borderRadius: 4, transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {/* Chevron */}
        <span style={{
          fontSize: 12, color: 'var(--texte-sec)',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
          marginLeft: 4,
        }}>▼</span>
      </div>

      {/* Étapes (accordéon) */}
      {open && (
        <div style={{ padding: '0 10px 10px' }}>
          {steps.map(step => {
            if (!step.accessible) {
              return (
                <div key={step.id} onClick={onPaywall} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 6,
                  background: '#F7F2EB', borderRadius: 10,
                  border: '1.5px dashed #D0C8BC',
                  cursor: 'pointer', opacity: 0.7,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    border: '2px solid #D0C8BC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11,
                  }}>🔒</div>
                  <span style={{ fontSize: 12, color: 'var(--texte-sec)', flex: 1 }}>{step.etape}</span>
                  <span style={{
                    fontSize: 10, color: '#b07d2a', fontWeight: 700,
                    background: 'rgba(176,125,42,0.10)', padding: '2px 7px', borderRadius: 20,
                  }}>Premium</span>
                </div>
              )
            }
            return (
              <TaskRow
                key={step.id}
                step={step}
                isDone={checked.has(step.id)}
                onToggle={toggle}
                navigate={navigate}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Progression globale hero ───────────────── */
function CockpitHero({ pct, done, total, onBack }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const strokeDash = (pct / 100) * circumference

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F3D35 0%, #1a5c50 100%)',
      borderRadius: 20,
      padding: '20px 20px 22px',
      marginBottom: 22,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Deco cercle flou */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(90,173,165,0.12)',
        pointerEvents: 'none',
      }} />

      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        color: 'rgba(247,242,235,0.7)', fontSize: 12, fontWeight: 600,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        marginBottom: 16, fontFamily: 'var(--font-corps)',
      }}>
        ← Mon espace
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Donut SVG */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
            {/* Fond */}
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
            {/* Progression */}
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke={VERT} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          {/* Pourcentage centré */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: pct === 100 ? 22 : 26, color: '#F7F2EB',
              lineHeight: 1,
            }}>
              {pct === 100 ? '🎉' : `${pct}%`}
            </span>
          </div>
        </div>

        {/* Texte */}
        <div>
          <p style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 13, color: 'rgba(90,173,165,0.9)',
            marginBottom: 4,
          }}>mon</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 26, color: '#F7F2EB', lineHeight: 1.1,
            marginBottom: 8,
          }}>Cockpit</h1>
          <p style={{
            fontSize: 12, color: 'rgba(247,242,235,0.6)',
            fontFamily: 'var(--font-corps)',
          }}>
            {done} sur {total} étapes{'\n'}
            {pct === 100 ? 'Installation complète !' : 'validées'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Vue cockpit complète ───────────────────── */
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

  // Trouver la première phase non complète pour l'ouvrir par défaut
  const firstOpenPhase = useMemo(() => {
    for (const [phase, phaseSteps] of Object.entries(byPhase)) {
      const phaseDone = phaseSteps.filter(s => checked.has(s.id)).length
      if (phaseDone < phaseSteps.length) return phase
    }
    return Object.keys(byPhase)[0]
  }, [byPhase, checked])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
        <p style={{ color: 'var(--texte-sec)', fontSize: 14 }}>Chargement…</p>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div style={{ paddingTop: 48 }}>
        <CockpitHero pct={pct} done={done} total={total} onBack={onBack} />

        {Object.entries(byPhase).map(([phase, phaseSteps]) => (
          <PhaseAccordion
            key={phase}
            phase={phase}
            steps={phaseSteps}
            checked={checked}
            toggle={toggle}
            navigate={navigate}
            isPremium={isPremium}
            onPaywall={() => setShowPaywallLocal(true)}
            defaultOpen={phase === firstOpenPhase}
          />
        ))}

        {/* Encouragement si tout fait */}
        {pct === 100 && (
          <div style={{
            textAlign: 'center', padding: '24px 20px',
            background: `${VERT}08`,
            border: `1px solid ${VERT}25`,
            borderRadius: 16, marginTop: 8,
          }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🌿</p>
            <p style={{
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
              fontSize: 16, color: VERT, fontWeight: 600,
            }}>
              Félicitations ! Votre installation est complète.
            </p>
          </div>
        )}
      </div>
      <PaywallModal isOpen={showPaywallLocal} onClose={() => setShowPaywallLocal(false)} />
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DASHBOARD MON ESPACE
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
        fontSize: 11, fontWeight: 700,
        color: 'var(--texte-sec)', textTransform: 'uppercase',
        letterSpacing: '0.07em', fontFamily: 'var(--font-corps)',
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

function OffreRecommandeeStrip({ quiz }) {
  const recommended = getRecommendedOffer(quiz)
  const OFFRES_MAP = {
    eclaireur: { titre: 'Audit Éclaireur', prix: '290€', emoji: '🏢', url: 'https://buy.stripe.com/dRmcN4gxS4lH196fU96AM0L', desc: 'Analysez votre projet pro à Majorque' },
    integrale:  { titre: 'Installation Intégrale', prix: '449€', emoji: '💎', url: 'https://buy.stripe.com/eVq00i95q9G16tq6jz6AM0M', desc: 'Vie + activité réunies' },
    cap:        { titre: 'Cap Majorque', prix: '249€', emoji: '🧭', url: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K', desc: "L'accompagnement complet" },
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
      <span style={{ fontSize: 14, fontWeight: 700, color: VERT, flexShrink: 0 }}>
        {o.prix}
      </span>
    </div>
  )
}

/* ── Cockpit aperçu dans dashboard ──────────── */
function CockpitPreview({ profile, quiz, checked, steps, pct, done, total, onOpen }) {
  const nextStep = useMemo(() =>
    steps.find(s => !checked.has(s.id) && (s.priorite === '🔴 Urgent' || s.priorite === '🟠 Important'))
    || steps.find(s => !checked.has(s.id))
  , [steps, checked])

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDash = (pct / 100) * circumference

  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff', border: '1px solid #E8E2D9',
        borderRadius: 16, padding: '16px',
        cursor: 'pointer',
        display: 'flex', gap: 16, alignItems: 'center',
      }}
    >
      {/* Mini donut */}
      <div style={{ flexShrink: 0, position: 'relative', width: 64, height: 64 }}>
        <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={radius} fill="none"
            stroke="#E8E2D9" strokeWidth="7" />
          <circle cx="32" cy="32" r={radius} fill="none"
            stroke={VERT} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.5s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: pct === 100 ? 14 : 16, color: 'var(--texte)',
          }}>
            {pct === 100 ? '🎉' : `${pct}%`}
          </span>
        </div>
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texte)', marginBottom: 4 }}>
          Mon installation
        </p>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 8 }}>
          {done}/{total} étapes
        </p>
        {nextStep && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px',
            background: 'rgba(199,110,78,0.07)',
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 10, color: TERRA, fontWeight: 700, flexShrink: 0 }}>→ Prochaine</span>
            <span style={{
              fontSize: 11, color: 'var(--texte)',
              lineHeight: 1.3, overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {nextStep.etape}
            </span>
          </div>
        )}
      </div>

      <span style={{ color: VERT, fontSize: 18, flexShrink: 0 }}>›</span>
    </div>
  )
}

/* ── Dashboard principal ────────────────────── */
function Dashboard({ onShowCockpit, onUpgrade, setShowPaywall }) {
  const { profile } = useProfile()
  const { isPremium, email, logout } = usePremium()
  const navigate = useNavigate()
  const [showQuiz, setShowQuiz] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { user } = useUserData()
  const { quiz, saveQuiz, hasQuiz } = useQuizData()

  useEffect(() => {
    if (!hasQuiz) {
      const t = setTimeout(() => setShowQuiz(true), 800)
      return () => clearTimeout(t)
    }
  }, [hasQuiz])

  /* Guides suggérés */
  const suggestedCats = getSuggestedGuideCategories(quiz)
  const filterGuides = {
    and: [
      { or: suggestedCats.map(c => ({ property: 'Catégorie', select: { equals: c } })) },
      { property: 'Statut_contenu', select: { equals: 'Publié' } },
    ],
  }
  const { data: rawGuides } = useNotionDB(NOTION_DB.guides, filterGuides)
  const suggestedGuides = useMemo(() => rawGuides.map(parseGuide).slice(0, 4), [rawGuides])

  /* Cockpit résumé */
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

  /* Outils suggérés */
  const suggestedTools = getSuggestedTools(quiz)

  /* Label profil issu du quiz */
  const profileQuizLabel = getProfileLabelFromQuiz(quiz)

  /* Salutation */
  const greeting = useMemo(() => new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir', [])

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

        {/* ── Badge profil (dérivé du quiz) ── */}
        {hasQuiz && profileQuizLabel && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: `${VERT}12`,
            border: `1px solid ${VERT}25`,
            borderRadius: 20, marginBottom: 20,
          }}>
            <span style={{ fontSize: 14 }}>{profileQuizLabel.emoji}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#0F3D35',
              fontFamily: 'var(--font-corps)',
            }}>
              {profileQuizLabel.label}
            </span>
            <button
              onClick={() => setShowQuiz(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, color: 'var(--texte-sec)', padding: 0, marginLeft: 2,
                fontFamily: 'var(--font-corps)',
              }}
            >
              ✏️
            </button>
          </div>
        )}

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
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--texte-sec)', marginTop: 2 }}>
                4 questions pour tout adapter à votre situation
              </div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
          </button>
        )}

        {/* ── Profil résumé ── */}
        {hasQuiz && (
          <ProfilResume quiz={quiz} onEdit={() => setShowQuiz(true)} />
        )}

        {/* ── Cockpit aperçu ── */}
        {profile && total > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>Mon installation</SectionTitle>
            <CockpitPreview
              profile={profile}
              quiz={quiz}
              checked={checked}
              steps={steps}
              pct={pct}
              done={done}
              total={total}
              onOpen={onShowCockpit}
            />
          </div>
        )}

        {/* ── Guides recommandés ── */}
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
            <OffreRecommandeeStrip quiz={quiz} />
          </div>
        )}

        {/* ── Outils suggérés ── */}
        {suggestedTools.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle cta="Tous →" ctaTo="/app/explorer/outils">Simulateurs utiles</SectionTitle>
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

        {/* ── Mon accès ── */}
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
                    <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>
                      Débloquez 100% des guides et tous les outils.
                    </p>
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
