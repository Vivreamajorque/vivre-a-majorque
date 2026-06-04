import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { track } from '@vercel/analytics'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useUserData } from '../hooks/useUserData'
import {
  useQuizData, getRecommendedOffer, getSuggestedGuideCategories,
  getSuggestedTools, isEntrepreneurProfile, getProfileLabelFromQuiz,
} from '../hooks/useQuizData'
import { useNotionDB, parseCockpit, parseGuide } from '../hooks/useNotion'
import { useSavedGuides } from '../hooks/useSavedGuides'
import { useSEO } from '../hooks/useSEO'
import { NOTION_DB } from '../config'
import { PaywallModal } from '../components/PaywallModal'
import QuizProfil from '../components/QuizProfil'
import NotionError from '../components/NotionError'
import EmailCaptureBar from '../components/EmailCaptureBar'
import { TERRA, VERT, SectionHead } from '../components/WaveTitle'

const FORET = '#0F3D35'

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

/* ── SectionHead ────────────────────────────── */
/* ══════════════════════════════════════════════
   COCKPIT — vue complète
══════════════════════════════════════════════ */

const PHASE_META = {
  'Avant départ':  { emoji: '✈️', color: VERT },
  'Arrivée':       { emoji: '🏠', color: TERRA },
  'Administratif': { emoji: '📋', color: '#7BA05B' },
  'Vie pratique':  { emoji: '🌿', color: '#b07d2a' },
  'Travail':       { emoji: '💼', color: VERT },
  'Général':       { emoji: '📌', color: '#8A7F74' },
}

function TaskRow({ step, isDone, onToggle, navigate }) {
  const meta = PHASE_META[step.phase] || PHASE_META['Général']
  const isUrgent = step.priorite === '🔴 Urgent' && !isDone
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: isDone ? 'rgba(90,173,165,0.04)' : '#fff',
        borderRadius: 12,
        border: `1.5px solid ${isDone ? 'rgba(90,173,165,0.2)' : isUrgent ? 'rgba(199,110,78,0.3)' : '#E0D9CF'}`,
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => step.guideId ? navigate(`/app/guide/${step.guideId}`) : onToggle(step.id)}
    >
      {isUrgent && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, background: TERRA, borderRadius: '12px 0 0 12px',
        }} />
      )}
      <div
        onClick={e => { e.stopPropagation(); onToggle(step.id) }}
        style={{
          width: 24, height: 24, flexShrink: 0,
          borderRadius: 7,
          border: `2px solid ${isDone ? VERT : '#C8C0B4'}`,
          background: isDone ? VERT : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', cursor: 'pointer',
        }}
      >
        {isDone && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: isDone ? 400 : 500,
          color: isDone ? 'var(--texte-sec)' : 'var(--texte)',
          lineHeight: 1.35,
          textDecoration: isDone ? 'line-through' : 'none',
          textDecorationColor: '#bbb',
        }}>
          {step.etape}
        </p>
      </div>
      {step.guideId && !isDone && (
        <span style={{ color: VERT, fontSize: 18, flexShrink: 0, opacity: 0.8 }}>›</span>
      )}
    </div>
  )
}

function PhaseAccordion({ phase, steps, checked, toggle, navigate, isPremium, onPaywall, defaultOpen }) {
  const meta = PHASE_META[phase] || PHASE_META['Général']
  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const allDone = done === total
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      borderRadius: 16,
      border: `1.5px solid ${allDone ? 'rgba(90,173,165,0.3)' : '#D4CCC2'}`,
      overflow: 'hidden',
      marginBottom: 10,
      background: allDone ? 'rgba(90,173,165,0.04)' : '#fff',
    }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          borderRadius: 10,
          background: allDone ? VERT : `${meta.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, transition: 'background 0.3s',
        }}>
          {allDone ? (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1.5 5L5.5 9L12.5 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : meta.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <p style={{
              fontSize: 15, fontWeight: 700,
              color: allDone ? VERT : FORET,
              fontFamily: 'var(--font-corps)',
            }}>
              {phase}
            </p>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: allDone ? VERT : done > 0 ? meta.color : 'var(--texte-sec)',
            }}>
              {done}/{total}
            </span>
          </div>
          <div style={{ height: 4, background: '#E0D9CF', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: allDone ? VERT : meta.color,
              borderRadius: 3, transition: 'width 0.4s',
            }} />
          </div>
        </div>
        <span style={{
          fontSize: 13, color: 'var(--texte-sec)',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s', marginLeft: 2,
        }}>▼</span>
      </div>

      {open && (
        <div style={{ padding: '2px 10px 10px' }}>
          {steps.map(step => {
            if (!step.accessible) {
              return (
                <div key={step.id} onClick={onPaywall} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', marginBottom: 6,
                  background: 'var(--bg)', borderRadius: 10,
                  border: '1.5px dashed #C8C0B4',
                  cursor: 'pointer', opacity: 0.7,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    border: '2px solid #C8C0B4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                  }}>🔒</div>
                  <span style={{ fontSize: 13, color: 'var(--texte-sec)', flex: 1 }}>{step.etape}</span>
                  <span style={{
                    fontSize: 12, color: '#b07d2a', fontWeight: 800,
                    background: 'rgba(176,125,42,0.12)', padding: '3px 8px', borderRadius: 20,
                    letterSpacing: '0.04em',
                  }}>PREMIUM</span>
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

function CockpitHero({ pct, done, total, onBack }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{
      background: FORET,
      borderRadius: 20,
      padding: '24px 20px 22px',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(90,173,165,0.08)',
        pointerEvents: 'none',
      }} />
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: 'rgba(247,242,235,0.6)', fontSize: 12, fontWeight: 600,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        marginBottom: 20, fontFamily: 'var(--font-corps)',
      }}>
        ← Mon espace
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flexShrink: 0, position: 'relative', width: 88, height: 88 }}>
          <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9"/>
            <circle cx="44" cy="44" r={r} fill="none" stroke={VERT} strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: pct === 100 ? 22 : 24, color: '#F7F2EB',
            }}>
              {pct === 100 ? '🎉' : `${pct}%`}
            </span>
          </div>
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 16, color: 'rgba(90,173,165,0.9)',
            marginBottom: 2,
          }}>mon</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 30, color: '#F7F2EB', lineHeight: 1.05, marginBottom: 8,
          }}>Cockpit</h1>
          <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.55)', fontFamily: 'var(--font-corps)' }}>
            {done} sur {total} étapes validées
          </p>
        </div>
      </div>
    </div>
  )
}

function CockpitView({ profileNotion, profileId, onBack }) {
  const { data, loading, error } = useNotionDB(NOTION_DB.cockpit)
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  const [checked, toggle] = useCheckedSteps(profileId)
  const [showPaywallLocal, setShowPaywallLocal] = useState(false)

  const steps = useMemo(() =>
    data.map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible.includes(profileNotion))
      .sort((a, b) => a.ordre - b.ordre)
  , [data, profileNotion])

  // 60% des étapes accessibles gratuitement — assez pour que l'utilisateur
  // comprenne la valeur avant de voir le cadenas sur les étapes avancées
  const freeCount = useMemo(() => Math.max(3, Math.ceil(steps.length * 0.60)), [steps])
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

  const firstOpenPhase = useMemo(() => {
    for (const [phase, phaseSteps] of Object.entries(byPhase)) {
      if (phaseSteps.filter(s => checked.has(s.id)).length < phaseSteps.length) return phase
    }
    return Object.keys(byPhase)[0]
  }, [byPhase, checked])

  if (error) return (
    <div className="page" style={{ paddingTop: 48 }}>
      <button onClick={onBack} style={{ color: VERT, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font-corps)' }}>
        ← Mon espace
      </button>
      <NotionError message={error} />
    </div>
  )

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
        {pct === 100 && (
          <div style={{
            textAlign: 'center', padding: '28px 20px',
            background: 'rgba(90,173,165,0.08)',
            border: `1.5px solid rgba(90,173,165,0.25)`,
            borderRadius: 18, marginTop: 8,
          }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🌿</p>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 18, color: VERT,
            }}>
              Félicitations ! Installation complète.
            </p>
          </div>
        )}
      </div>
      <PaywallModal isOpen={showPaywallLocal} onClose={() => setShowPaywallLocal(false)} />
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD — Mon Espace
══════════════════════════════════════════════ */

/* Aperçu cockpit compact */
function CockpitPreview({ steps, checked, pct, done, total, onOpen }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  const nextStep = useMemo(() =>
    steps.find(s => !checked.has(s.id) && (s.priorite === '🔴 Urgent' || s.priorite === '🟠 Important'))
    || steps.find(s => !checked.has(s.id))
  , [steps, checked])

  return (
    <div onClick={onOpen} style={{
      background: '#fff',
      borderRadius: 18,
      border: 'var(--border)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px',
      cursor: 'pointer',
    }}>
      {/* Mini donut */}
      <div style={{ flexShrink: 0, position: 'relative', width: 68, height: 68 }}>
        <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="34" cy="34" r={r} fill="none" stroke="#E0D9CF" strokeWidth="7"/>
          <circle cx="34" cy="34" r={r} fill="none" stroke={VERT} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.5s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: pct === 100 ? 13 : 16, color: FORET,
          }}>
            {pct === 100 ? '🎉' : `${pct}%`}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: FORET, marginBottom: 3 }}>
          Mon installation
        </p>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: nextStep ? 10 : 0 }}>
          {done} / {total} étapes
        </p>
        {nextStep && (
          <div style={{
            background: '#FDF0EA',
            borderLeft: `3px solid ${TERRA}`,
            borderRadius: '0 9px 9px 0',
            padding: '8px 10px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: TERRA, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>
              → Prochaine étape
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte)', fontWeight: 500, lineHeight: 1.35 }}>
              {nextStep.etape}
            </p>
          </div>
        )}
      </div>

      <span style={{ color: VERT, fontSize: 20, flexShrink: 0 }}>›</span>
    </div>
  )
}

/* Ligne guide */
const CAT_EMOJIS = {
  'Administratif': '📋', 'Logement': '🏠', 'Travail': '💼',
  'Santé': '🏥', 'Famille': '👨‍👩‍👧', 'Argent': '💶',
  'Voiture': '🚗', 'Animaux': '🐾', 'Déménagement': '📦', 'Vie pratique': '🌿',
}

const CAT_COLORS = {
  'Administratif': '#5AADA5', 'Logement': '#C76E4E', 'Travail': '#5AADA5',
  'Santé': '#C74E4E', 'Famille': '#7BA05B', 'Argent': '#b07d2a',
  'Voiture': '#5A7A40', 'Animaux': '#8B6E4E', 'Déménagement': '#C76E4E', 'Vie pratique': '#7BA05B',
}

function GuideCard({ guide, isPremium, onPaywall }) {
  const navigate = useNavigate()
  const locked = guide.access === '💎 Premium' && !isPremium
  const color = CAT_COLORS[guide.category] || VERT
  const emoji = CAT_EMOJIS[guide.category] || '📄'

  return (
    <div
      onClick={() => locked ? onPaywall() : navigate(`/app/guide/${guide.id}`)}
      style={{
        background: locked ? '#F7F2EB' : '#fff',
        borderRadius: 14,
        border: `1.5px solid ${locked ? '#D4CCC2' : `${color}25`}`,
        padding: '14px 12px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 110,
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.12s',
      }}
      onMouseEnter={e => { if (!locked) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Trait coloré haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: locked ? '#D4CCC2' : color,
        borderRadius: '14px 14px 0 0',
      }} />

      {locked && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 12, fontWeight: 800, color: '#b07d2a',
          background: 'rgba(176,125,42,0.12)',
          padding: '2px 6px', borderRadius: 20,
          fontFamily: 'var(--font-corps)',
        }}>💎</span>
      )}

      <div>
        <div style={{ fontSize: 22, marginBottom: 7, marginTop: 6 }}>{emoji}</div>
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: locked ? 'var(--texte-sec)' : FORET,
          lineHeight: 1.35, marginBottom: 6,
        }}>
          {guide.title}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: locked ? '#C8C0B4' : color,
          background: locked ? '#E8E2D9' : `${color}15`,
          padding: '2px 7px', borderRadius: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          {guide.category}
        </span>
        <span style={{ color: locked ? '#C8C0B4' : color, fontSize: 14 }}>›</span>
      </div>
    </div>
  )
}

/* Offre recommandée */
function OffreStrip({ quiz }) {
  const navigate = useNavigate()
  const recommended = getRecommendedOffer(quiz)

  /* Offres avec pré-qualification → page Accompagnements + scroll sur l'ancre
     Offres Stripe direct → Visio et Cap uniquement */
  const OFFRES = {
    eclaireur: { titre: 'Audit Éclaireur',        prix: '290€', emoji: '🏢', desc: 'Votre projet pro à Majorque', places: 2, prequalification: true,  stripeUrl: null },

    cap:       { titre: 'Cap Majorque',           prix: '249€', emoji: '🧭', desc: "L'accompagnement complet",     places: 3, prequalification: false, stripeUrl: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K' },
    visio:     { titre: 'Visio conseil',          prix: '79€',  emoji: '💬', desc: 'Une session pour y voir clair — tarif lancement',places: 5, prequalification: false, stripeUrl: 'https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W' },
  }
  const o = OFFRES[recommended]
  if (!o) return null

  const handleClick = () => {
    track('accompagnement_clicked', { offre: o.titre, source: 'mon_espace' })
    if (o.prequalification) {
      // → page Accompagnements scrollée sur l'offre concernée
      navigate('/app/explorer/accompagnements')
      setTimeout(() => {
        const el = document.getElementById(recommended)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
    } else {
      window.open(o.stripeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div style={{ overflow: 'hidden', borderRadius: 18 }}>
      <div
        onClick={handleClick}
        style={{
          background: FORET,
          padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 30, flexShrink: 0 }}>{o.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 17, color: '#F7F2EB', marginBottom: 3,
          }}>{o.titre}</p>
          <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.55)', lineHeight: 1.4 }}>{o.desc}</p>
          {o.prequalification && (
            <p style={{ fontSize: 13, color: 'rgba(90,173,165,0.8)', marginTop: 4, fontFamily: 'var(--font-corps)' }}>
              Sur demande · réponse sous 24h
            </p>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 22, color: VERT, flexShrink: 0,
        }}>{o.prix}</span>
      </div>
      {o.places > 0 && (
        <div style={{
          background: o.places === 1 ? 'rgba(199,78,78,0.08)' : 'rgba(176,125,42,0.08)',
          border: `1px solid ${o.places === 1 ? 'rgba(199,78,78,0.2)' : 'rgba(176,125,42,0.2)'}`,
          borderTop: 'none', borderRadius: '0 0 18px 18px',
          padding: '8px 18px', textAlign: 'center',
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700,
            color: o.places === 1 ? '#C74E4E' : '#7A5A1A',
            fontFamily: 'var(--font-corps)',
          }}>
            {o.places === 1 ? '🔴 Dernière place disponible ce mois-ci' : `⚡ Plus que ${o.places} places disponibles en juin`}
          </p>
        </div>
      )}
    </div>
  )
}

/* Accès Premium */
function AccesCard({ isPremium, email, logout, onUpgrade }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  return (
    <div style={{
      background: isPremium ? 'rgba(90,173,165,0.06)' : '#fff',
      borderRadius: 18,
      border: `1.5px solid ${isPremium ? 'rgba(90,173,165,0.3)' : '#D4CCC2'}`,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: FORET, marginBottom: 5 }}>
          {isPremium ? '💎 Premium actif' : '🟢 Accès gratuit'}
        </p>
        {isPremium ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {email && <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{email}</p>}
            <button onClick={logout} style={{
              fontSize: 12, color: 'var(--texte-sec)', textDecoration: 'underline',
              fontFamily: 'var(--font-corps)', cursor: 'pointer',
            }}>Déconnecter</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 14, lineHeight: 1.5 }}>
              Débloquez 100% des guides et tous les outils.
            </p>
            <button onClick={onUpgrade} style={{
              background: FORET, color: '#fff',
              padding: '12px 22px', borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-corps)',
              letterSpacing: '0.01em',
            }}>
              Découvrir Premium →
            </button>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--gris)', padding: '12px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isPremium && (
            <a href="mailto:vivre@vivre-a-majorque.es?subject=Résiliation%20abonnement%20Premium"
              style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
              <span>Résilier mon abonnement</span><span>›</span>
            </a>
          )}
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 13, color: 'var(--texte-sec)', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', width: '100%',
              fontFamily: 'var(--font-corps)',
            }}>
              <span>Supprimer mes données</span><span style={{ fontSize: 12 }}>›</span>
            </button>
          ) : (
            <div style={{ background: 'rgba(199,78,78,0.05)', border: '1px solid rgba(199,78,78,0.2)', borderRadius: 10, padding: '12px' }}>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 10, lineHeight: 1.5 }}>
                Vos données locales seront supprimées. Compte Premium : confirmation sous 72h.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`mailto:vivre@vivre-a-majorque.es?subject=Suppression%20données%20RGPD${email ? `&body=Adresse%20%3A%20${encodeURIComponent(email)}` : ''}`}
                  onClick={() => { localStorage.clear(); setDeleteConfirm(false) }}
                  style={{ background: '#C74E4E', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  Confirmer
                </a>
                <button onClick={() => setDeleteConfirm(false)} style={{
                  background: 'none', border: '1px solid var(--gris)',
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'var(--font-corps)',
                }}>
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
        <p style={{ fontSize: 12, color: '#C8C0B4', marginTop: 12, lineHeight: 1.5 }}>
          RGPD · LOPDGDD · LSSI — Amely Attias · vivre@vivre-a-majorque.es
        </p>
      </div>
    </div>
  )
}

/* Dashboard principal */
function Dashboard({ onShowCockpit, onUpgrade, setShowPaywall }) {
  const { profile } = useProfile()
  const { isPremium, email, logout } = usePremium()
  const navigate = useNavigate()
  const [showQuiz, setShowQuiz] = useState(false)
  const { user } = useUserData()
  const { quiz, saveQuiz, hasQuiz } = useQuizData()
  const { saved: savedGuides, toggle: toggleSaved } = useSavedGuides()

  useEffect(() => {
    if (!hasQuiz) {
      const t = setTimeout(() => setShowQuiz(true), 800)
      return () => clearTimeout(t)
    }
  }, [hasQuiz])

  /* Guides suggérés — mélange de catégories */
  const suggestedCats = getSuggestedGuideCategories(quiz)
  // On charge TOUS les guides publiés (sans filtre catégorie) pour pouvoir mélanger
  const filterGuides = {
    property: 'Statut_contenu', select: { equals: 'Publié' },
  }
  const { data: rawGuides } = useNotionDB(NOTION_DB.guides, filterGuides)
  const suggestedGuides = useMemo(() => {
    const parsed = rawGuides.map(parseGuide)
    // Séparer : guides des catégories recommandées VS autres
    const priority = parsed.filter(g => suggestedCats.includes(g.category))
    const others   = parsed.filter(g => !suggestedCats.includes(g.category))
    // Mélange : 1 de chaque catégorie recommandée (max 2), puis compléter avec autres catégories
    const seen = new Set()
    const mixed = []
    // 1 guide par catégorie recommandée en premier
    for (const cat of suggestedCats) {
      const g = priority.find(g => g.category === cat && !seen.has(g.id))
      if (g) { seen.add(g.id); mixed.push(g) }
      if (mixed.length >= 4) break
    }
    // Compléter avec d'autres catégories non encore représentées
    for (const g of others) {
      if (mixed.length >= 6) break
      if (!seen.has(g.id) && !mixed.find(m => m.category === g.category)) {
        seen.add(g.id); mixed.push(g)
      }
    }
    // Compléter jusqu'à 6 si besoin
    for (const g of [...priority, ...others]) {
      if (mixed.length >= 6) break
      if (!seen.has(g.id)) { seen.add(g.id); mixed.push(g) }
    }
    return mixed
  }, [rawGuides, suggestedCats])

  /* Cockpit */
  const { data: cockpitData } = useNotionDB(NOTION_DB.cockpit)
  const [checked] = useCheckedSteps(profile?.id || 'guest')
  const steps = useMemo(() =>
    cockpitData.map(parseCockpit)
      .filter(s => !profile?.notion || s.profilCible.includes(profile.notion))
      .sort((a, b) => a.ordre - b.ordre)
  , [cockpitData, profile])
  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const suggestedTools = getSuggestedTools(quiz)
  const profileQuizLabel = getProfileLabelFromQuiz(quiz)
  const greeting = useMemo(() => new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir', [])

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── HERO ── */}
      <div style={{
        background: FORET,
        margin: '0 -16px',
        padding: '52px 20px 28px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {/* Cercle déco */}
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(90,173,165,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -30, left: -50,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(199,110,78,0.06)', pointerEvents: 'none',
        }} />

        <p style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 24, color: 'rgba(199,110,78,0.9)',
          lineHeight: 1, marginBottom: 4,
        }}>
          {greeting}{user?.prenom ? ` ${user.prenom}` : ''} 👋
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 40, color: '#F7F2EB',
          lineHeight: 1, marginBottom: 18,
          letterSpacing: '-0.5px',
        }}>
          Mon espace
        </h1>

        {/* Étiquettes profil — toutes les infos quiz dans le hero */}
        {hasQuiz && quiz && (() => {
          const INTENTION = { vivre: 'Vivre & travailler', retraite: 'Retraite', remote: 'Télétravail', creer: 'Créer mon activité' }
          const FAMILLE   = { seul: 'Seul·e', couple: 'En couple', enfants: 'Famille' }
          const HORIZON   = { plus1an: '+ 1 an', entre6et12: '6–12 mois', moins6: '< 6 mois', deja: 'Déjà là' }
          const DOULEUR   = { admin: 'Démarches admin', fiscal: 'Fiscalité', logement: 'Logement', clients: 'Clients', solitude: 'Intégration', tout: 'Tout à la fois' }
          const tags = [
            profileQuizLabel && { emoji: profileQuizLabel.emoji, label: profileQuizLabel.label, v: true },
            quiz.intention && { label: INTENTION[quiz.intention] },
            quiz.famille   && { label: FAMILLE[quiz.famille] },
            quiz.douleur   && { label: `💬 ${DOULEUR[quiz.douleur]}` },
          ].filter(Boolean)
          return (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.map((t, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-corps)',
                  background: t.v ? 'rgba(90,173,165,0.22)' : 'rgba(255,255,255,0.12)',
                  color: t.v ? '#7EC8C0' : 'rgba(247,242,235,0.85)',
                  border: `1.5px solid ${t.v ? 'rgba(90,173,165,0.4)' : 'rgba(255,255,255,0.18)'}`,
                }}>
                  {t.emoji && <span>{t.emoji}</span>}
                  {t.label}
                </span>
              ))}
              <button onClick={() => setShowQuiz(true)} style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '5px 11px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(247,242,235,0.5)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                fontFamily: 'var(--font-corps)', cursor: 'pointer',
              }}>
                ✏️ Modifier
              </button>
            </div>
          )
        })()}

        {/* CTA quiz si pas fait */}
        {!hasQuiz && (
          <button onClick={() => setShowQuiz(true)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1.5px dashed rgba(255,255,255,0.25)',
            borderRadius: 14, cursor: 'pointer',
            fontFamily: 'var(--font-corps)',
          }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F7F2EB', marginBottom: 1 }}>
                Personnaliser mon espace
              </p>
              <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.55)' }}>
                4 questions pour tout adapter
              </p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(247,242,235,0.7)' }}>→</span>
          </button>
        )}
      </div>

      {/* ── EMAIL CAPTURE — pour les utilisateurs qui ont skippé l'onboarding ── */}
      {!user?.email && (
        <EmailCaptureBar prenom={user?.prenom} />
      )}

      {/* ── COCKPIT ── */}
      {profile && total > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead title="Mon installation" cta="Tout voir →" onCta={onShowCockpit} />
          <CockpitPreview
            steps={steps}
            checked={checked}
            pct={pct} done={done} total={total}
            onOpen={onShowCockpit}
          />
        </div>
      )}

      {/* ── MES GUIDES SAUVEGARDÉS ── */}
      {savedGuides.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead
            title="Mes guides"
            cta={savedGuides.length > 3 ? `Voir les ${savedGuides.length} →` : null}
            ctaTo="/app/guides"
          />
          <div style={{
            background: '#fff',
            borderRadius: 18,
            border: 'var(--border)',
            overflow: 'hidden',
          }}>
            {savedGuides.slice(0, 3).map((g, i) => (
              <div
                key={g.id}
                onClick={() => navigate(`/app/guide/${g.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < Math.min(savedGuides.length, 3) - 1 ? '1px solid #F0EAE0' : 'none',
                  cursor: 'pointer',
                }}
              >
                {/* Icône signet plein */}
                <svg width="13" height="15" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M1 1h12v16l-6-4-6 4V1z" fill="var(--vert)" stroke="var(--vert)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  flex: 1, fontSize: 14, color: 'var(--texte)',
                  fontWeight: 500, lineHeight: 1.35,
                }}>
                  {g.title}
                </span>
                {g.category && (
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: 'var(--texte-sec)',
                    background: 'var(--bg)',
                    padding: '3px 8px', borderRadius: 20,
                    flexShrink: 0,
                    fontFamily: 'var(--font-corps)',
                  }}>
                    {g.category}
                  </span>
                )}
                <span style={{ color: VERT, fontSize: 18, opacity: 0.7 }}>›</span>
              </div>
            ))}
            {savedGuides.length === 0 && (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--texte-sec)', fontSize: 13 }}>
                Aucun guide sauvegardé pour l'instant.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GUIDES SUGGÉRÉS ── */}
      {suggestedGuides.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead
            title={quiz ? 'Guides pour vous' : 'Guides populaires'}
            cta="Tous les guides →"
            ctaTo="/app/guides"
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}>
            {suggestedGuides.map(g => (
              <GuideCard key={g.id} guide={g} isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
            ))}
          </div>
        </div>
      )}

      {/* ── ACCOMPAGNEMENT ── */}
      {quiz && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead title="Accompagnement" cta="Voir tout →" ctaTo="/app/explorer/accompagnements" />
          <OffreStrip quiz={quiz} />
        </div>
      )}

      {/* ── SIMULATEURS ── */}
      {suggestedTools.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead title="Simulateurs" cta="Tous →" ctaTo="/app/explorer/outils" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestedTools.map(t => (
              <Link key={t.id} to={t.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 15px',
                  background: '#fff',
                  border: 'var(--border)',
                  borderRadius: 12,
                  fontSize: 13, fontWeight: 600, color: FORET,
                }}>
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── ACCÈS ── */}
      <div style={{ marginBottom: 12 }}>
        <SectionHead title="Mon accès" />
        <AccesCard
          isPremium={isPremium} email={email} logout={logout} onUpgrade={onUpgrade}
        />
      </div>

      {showQuiz && (
        <QuizProfil
          onComplete={(answers) => { saveQuiz(answers); setShowQuiz(false) }}
          onSkip={() => setShowQuiz(false)}
          initialAnswers={hasQuiz ? quiz : null}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════ */
export default function MonEspace() {
  useSEO({
    title: "Mon espace — tableau de bord installation Majorque",
    description: "Votre espace personnel : cockpit d'installation, guides sauvegardés, progression et recommandations personnalisées pour votre projet à Majorque.",
    url: "https://vivre-a-majorque.vercel.app/app/moi",
    robots: "noindex, nofollow",
  })
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
