import React, { useMemo, useState, useCallback, useEffect } from 'react'
import OnboardingModal from '../components/OnboardingModal'
import QuizProfil from '../components/QuizProfil'
import ProfilResume from '../components/ProfilResume'
import { useUserData } from '../hooks/useUserData'
import { useQuizData, getRecommendedOffer, isEntrepreneurProfile, getPainLabel } from '../hooks/useQuizData'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useSavedGuides } from '../hooks/useSavedGuides'
import { useNotionDB, parseCockpit } from '../hooks/useNotion'
import { NOTION_DB, PROFILS } from '../config'
import { useNavigate } from 'react-router-dom'
import { PaywallModal } from '../components/PaywallModal'
import AccompagnementBanner from '../components/AccompagnementBanner'

/* ─────────────────────────────────────────────
   Hook — étapes cochées
───────────────────────────────────────────── */
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

const PROFIL_NEXT = { reve: 'installe', installe: 'premiere', premiere: 'confirme' }

/* ─────────────────────────────────────────────
   Cockpit complet (vue dédiée)
───────────────────────────────────────────── */
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
    stepsWithAccess.forEach(s => { if (!map[s.phase]) map[s.phase] = []; map[s.phase].push(s) })
    return map
  }, [stepsWithAccess])

  const done = stepsWithAccess.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  if (loading) return <div className="spinner">Chargement…</div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ paddingTop: 48, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--vert)', fontSize: 13, fontWeight: 500,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 16,
        }}>
          ← Mon espace
        </button>
        <h1 style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 'var(--fs-2xl)', color: 'var(--foret)', lineHeight: 1.25, marginBottom: 12,
        }}>
          Mon Cockpit
        </h1>
        {/* Barre de progression */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{done} / {total} étapes</span>
            <span style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 16 }}>{pct}%</span>
          </div>
          <div style={{ height: 7, background: 'var(--gris)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--foret)', borderRadius: 8, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Étapes par phase */}
      {Object.entries(byPhase).map(([phase, phaseSteps]) => (
        <div key={phase} style={{ marginBottom: 20 }}>
          <p className="section-title">{phase}</p>
          {phaseSteps.map(step => {
            const isDone = checked.has(step.id)
            if (!step.accessible) return (
              <div key={step.id} onClick={onUpgrade} style={{ position: 'relative', marginBottom: 6, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: 'white', border: '1px solid var(--gris)', borderRadius: 10, padding: '12px 14px', filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                  <p style={{ fontSize: 14, color: 'var(--foret)', fontWeight: 500 }}>{step.etape}</p>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,250,248,0.5)' }}>
                  <div style={{ background: 'white', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <span style={{ fontSize: 14 }}>🔒</span>
                    <span style={{ fontSize: 11, color: 'var(--foret)', fontWeight: 700 }}>Premium</span>
                  </div>
                </div>
              </div>
            )
            return (
              <div key={step.id} style={{
                background: isDone ? 'var(--vert-light)' : 'white',
                border: `1px solid ${isDone ? 'rgba(90,122,64,0.2)' : 'var(--gris)'}`,
                borderRadius: 10, marginBottom: 6, overflow: 'hidden',
              }}>
                <div onClick={() => {
                  if (step.guideId) navigate(`/app/guide/${step.guideId}?stepId=${step.id}&profileId=${profileId}`)
                  else toggle(step.id)
                }} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer' }}>
                  <div onClick={e => { e.stopPropagation(); toggle(step.id) }} style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${isDone ? 'var(--foret)' : 'var(--gris)'}`,
                    background: isDone ? 'var(--foret)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone && <span style={{ color: 'white', fontSize: 13, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4, color: isDone ? 'var(--texte-sec)' : 'var(--foret)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {step.etape}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {step.categorie && <span className="badge badge-gris" style={{ fontSize: 10 }}>{step.categorie}</span>}
                      {step.priorite === '🔴 Urgent' && <span className="badge badge-ocre" style={{ fontSize: 10 }}>Urgent</span>}
                      {step.delai && <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>⏱ {step.delai}</span>}
                    </div>
                  </div>
                  {step.guideId && <span style={{ color: 'var(--vert)', fontSize: 16, flexShrink: 0, marginTop: 2 }}>›</span>}
                </div>
                {step.guideId && !isDone && (
                  <div onClick={() => navigate(`/app/guide/${step.guideId}?stepId=${step.id}&profileId=${profileId}`)}
                    style={{ borderTop: '1px solid var(--gris)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--vert)', fontWeight: 600, cursor: 'pointer', background: 'var(--vert-light)' }}>
                    <span>📖</span><span>Lire le guide</span><span style={{ marginLeft: 'auto' }}>→</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
      <PaywallModal isOpen={showPaywallLocal} onClose={() => setShowPaywallLocal(false)} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Dashboard principal
───────────────────────────────────────────── */
function Dashboard({ onShowCockpit, onUpgrade, setShowPaywall }) {
  const { profile, chooseProfile } = useProfile()
  const { isPremium, role, email, logout } = usePremium()
  const navigate = useNavigate()
  const [showProfilPicker, setShowProfilPicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { user, saveUser, dismiss, hasData } = useUserData()
  const { quiz, saveQuiz, resetQuiz, hasQuiz } = useQuizData()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  /* Afficher le modal si : pas encore de données ET premier passage sur Mon Espace */
  useEffect(() => {
    if (!hasData && !isPremium) {
      const timer = setTimeout(() => setShowOnboarding(true), 800)
      return () => clearTimeout(timer)
    }
  }, [hasData, isPremium])

  /* Déclencher le quiz si pas encore complété — pour tout le monde */
  useEffect(() => {
    if (!hasQuiz) {
      const timer = setTimeout(() => setShowQuiz(true), 900)
      return () => clearTimeout(timer)
    }
  }, [hasQuiz])

  const handleOnboardingSubmit = async ({ prenom, email: userEmail, newsletter }) => {
    // 1. Sauvegarde locale immédiate (UX réactive)
    saveUser({ prenom, email: userEmail, newsletter })
    setShowOnboarding(false)

    // 2. Envoi à Brevo en arrière-plan (non bloquant)
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom,
          email: userEmail,
          newsletter,
          profil: profile?.label || '',
        }),
      })
    } catch (err) {
      // Silencieux — les données sont déjà en localStorage
      console.warn('Subscribe API unavailable:', err.message)
    }
  }

  /* Données cockpit pour la progression et la prochaine étape */
  const { data } = useNotionDB(NOTION_DB.cockpit)
  const [checked] = useCheckedSteps(profile?.id || 'guest')

  const steps = useMemo(() =>
    data.map(parseCockpit)
      .filter(s => !profile?.notion || s.profilCible === profile.notion)
      .sort((a, b) => a.ordre - b.ordre)
  , [data, profile])

  const done = steps.filter(s => checked.has(s.id)).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const nextUrgent = useMemo(() =>
    steps.find(s => !checked.has(s.id) && (s.priorite === '🔴 Urgent' || s.priorite === '🟠 Important'))
  , [steps, checked])

  /* Guides sauvegardés */
  const { saved } = useSavedGuides(email)

  /* Salutation selon l'heure */
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bonjour'
    return 'Bonsoir'
  }, [])

  return (
    <>
    <div className="page" style={{ paddingBottom: 100 }}>
      <div style={{ paddingTop: 48 }}>

        {/* ── En-tête ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-accent)', fontSize: 20, color: 'var(--terra)', marginBottom: 2 }}>
            {greeting}{user?.prenom ? ` ${user.prenom}` : ''} 👋
          </p>
          <h1 style={{
            fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'var(--fs-2xl)', color: 'var(--foret)', lineHeight: 1.25, marginBottom: 8,
          }}>
            Mon espace
          </h1>
          {/* Message contextuel selon le profil quiz */}
          {quiz?.douleur && (
            <p style={{
              fontSize: 13, color: 'var(--texte-sec)',
              lineHeight: 1.55,
              fontStyle: 'italic',
              padding: '8px 12px',
              background: 'var(--terra-light)',
              borderRadius: 10,
              borderLeft: '3px solid var(--terra)',
            }}>
              {quiz.douleur === 'clients'
                ? `Votre priorité : trouver des clients à Majorque. La section Entreprendre est faite pour vous.`
                : quiz.douleur === 'fiscal'
                ? `Votre priorité : comprendre la fiscalité. Les guides Travail et Argent vous attendent.`
                : quiz.douleur === 'admin'
                ? `Votre priorité : les démarches. Votre Cockpit liste tout dans l'ordre.`
                : quiz.douleur === 'logement'
                ? `Votre priorité : trouver un logement. Les guides Logement sont vos premiers alliés.`
                : `Tout avancer pas à pas — votre Cockpit vous guide dans l'ordre.`}
            </p>
          )}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 16 }}>{profile.emoji}</span>
              <span style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{profile.label}</span>
              <button onClick={() => setShowProfilPicker(v => !v)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--vert)', fontWeight: 600, textDecoration: 'underline',
              }}>Changer</button>
            </div>
          )}
        </div>

        {/* ── Profil quiz résumé ── */}
        {hasQuiz && (
          <ProfilResume quiz={quiz} onEdit={() => setShowQuiz(true)} />
        )}

        {/* ── CTA quiz si pas encore fait ── */}
        {hasData && !hasQuiz && (
          <button
            onClick={() => setShowQuiz(true)}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: 'var(--vert-light)',
              border: '1.5px dashed var(--vert)',
              borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              color: 'var(--foret, #0F3D35)',
              cursor: 'pointer',
              fontFamily: 'var(--font-corps)',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>✨</span>
            <span>Personnaliser mon espace — 5 questions</span>
            <span style={{ marginLeft: 'auto', fontSize: 16 }}>→</span>
          </button>
        )}

        {/* ── Sélecteur de profil ── */}
        {showProfilPicker && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20 }}>
            {PROFILS.map(p => (
              <button key={p.id} onClick={() => { chooseProfile(p.id); setShowProfilPicker(false) }} style={{
                display: 'flex', gap: 10, alignItems: 'center', width: '100%',
                padding: '10px 0', borderBottom: '1px solid var(--gris)',
                background: 'none', cursor: 'pointer', textAlign: 'left', border: 'none',
              }}>
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--foret)', fontWeight: 500, marginBottom: 1 }}>{p.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{p.desc}</p>
                </div>
                {profile?.id === p.id && <span style={{ marginLeft: 'auto', color: 'var(--vert)', fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── Si pas de profil ── */}
        {!profile && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🧭</p>
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 6 }}>Choisissez votre profil</p>
            <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginBottom: 14 }}>Pour personnaliser votre espace et accéder à votre cockpit d'installation.</p>
            <button onClick={() => setShowProfilPicker(true)} style={{ background: 'var(--foret)', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Choisir mon profil →
            </button>
          </div>
        )}

        {/* ── Deux cartes accès rapide ── */}
        {profile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {/* Cockpit */}
            <button onClick={onShowCockpit} style={{
              background: 'var(--foret)', border: 'none', borderRadius: 'var(--radius)',
              padding: '18px 14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{ fontSize: 24 }}>🧭</span>
              <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'white', fontWeight: 600, lineHeight: 1.3 }}>Mon Cockpit</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                {total > 0 ? `${pct}% — ${done}/${total} étapes` : 'Votre suivi d\'installation'}
              </span>
              {total > 0 && (
                <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
                </div>
              )}
            </button>

            {/* Guides sauvegardés */}
            <button onClick={() => navigate('/app/guides')} style={{
              background: 'var(--bg-card)', border: '1px solid var(--gris)',
              borderRadius: 'var(--radius)', padding: '18px 14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{ fontSize: 24 }}>🔖</span>
              <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', fontWeight: 600, lineHeight: 1.3 }}>Mes guides</span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4 }}>
                {isPremium
                  ? saved.length > 0 ? `${saved.length} sauvegardé${saved.length > 1 ? 's' : ''}` : 'Aucun sauvegardé'
                  : 'Disponible en Premium'}
              </span>
            </button>
          </div>
        )}

        {/* ── Guides sauvegardés (si Premium + guides) ── */}
        {isPremium && saved.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="section-title" style={{ marginBottom: 10 }}>Mes guides sauvegardés</p>
            {saved.slice(0, 3).map(guide => (
              <div key={guide.id} onClick={() => navigate(`/app/guide/${guide.id}`)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>🔖</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--foret)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{guide.title}</p>
                  {guide.category && <span style={{ fontSize: 11, color: 'var(--texte-sec)', background: 'var(--gris)', padding: '1px 7px', borderRadius: 20 }}>{guide.category}</span>}
                </div>
                <span style={{ color: 'var(--texte-sec)', fontSize: 16, flexShrink: 0 }}>›</span>
              </div>
            ))}
            {saved.length > 3 && (
              <button onClick={() => navigate('/app/guides')} style={{ width: '100%', background: 'none', border: '1px solid var(--gris)', borderRadius: 'var(--radius-sm)', padding: '9px', fontSize: 13, color: 'var(--texte-sec)', cursor: 'pointer' }}>
                Voir les {saved.length - 3} autres →
              </button>
            )}
          </div>
        )}

        {/* ── Prochaine étape urgente ── */}
        {profile && nextUrgent && (
          <div style={{ marginBottom: 20 }}>
            <p className="section-title" style={{ marginBottom: 10 }}>Prochaine étape</p>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--terra-light)', borderLeft: '3px solid var(--terra)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 14px 10px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {nextUrgent.priorite === '🔴 Urgent' && <span className="badge badge-ocre" style={{ fontSize: 10 }}>Urgent</span>}
                  {nextUrgent.categorie && <span className="badge badge-gris" style={{ fontSize: 10 }}>{nextUrgent.categorie}</span>}
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--foret)', lineHeight: 1.4, marginBottom: nextUrgent.delai ? 6 : 0 }}>{nextUrgent.etape}</p>
                {nextUrgent.delai && <p style={{ fontSize: 12, color: 'var(--terra)', fontWeight: 500 }}>⏱ {nextUrgent.delai}</p>}
              </div>
              {nextUrgent.guideId && (
                <button onClick={() => navigate(`/app/guide/${nextUrgent.guideId}?stepId=${nextUrgent.id}&profileId=${profile.id}`)}
                  style={{ width: '100%', background: 'var(--terra-light)', border: 'none', borderTop: '1px solid rgba(199,110,78,0.15)', padding: '9px 14px', fontSize: 12, color: 'var(--terra)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📖</span><span>Lire le guide</span><span style={{ marginLeft: 'auto' }}>→</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Accès Premium ── */}
        <div style={{ marginBottom: 20 }}>
          <p className="section-title" style={{ marginBottom: 10 }}>Mon accès</p>
          <div style={{
            background: isPremium ? 'var(--vert-light)' : 'var(--bg-card)',
            border: `1px solid ${isPremium ? 'rgba(90,122,64,0.2)' : 'var(--gris)'}`,
            borderRadius: 'var(--radius)', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 4 }}>
                  {isPremium ? '💎 Premium actif' : '🟢 Accès gratuit'}
                </p>
                {isPremium ? (
                  <>
                    {role === 'admin' && <span style={{ fontSize: 10, background: 'var(--foret)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginBottom: 4 }}>ADMIN</span>}
                    {email && <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{email}</p>}
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>Débloquez 100% des guides et tous les outils.</p>
                    <button onClick={onUpgrade} style={{ background: 'var(--foret)', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      Découvrir Premium →
                    </button>
                  </>
                )}
              </div>
              {isPremium && (
                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--texte-sec)', textDecoration: 'underline', flexShrink: 0 }}>
                  Déconnecter
                </button>
              )}
            </div>
          </div>

          {/* ── Gestion du compte — sous Mon accès ── */}
          <div style={{ borderTop: '1px solid var(--gris)', marginTop: 12, paddingTop: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Gestion du compte</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isPremium && (
                <a href="mailto:vivre@vivre-a-majorque.es?subject=Résiliation%20abonnement%20Premium"
                  style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Résilier mon abonnement</span>
                  <span style={{ fontSize: 12 }}>›</span>
                </a>
              )}
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: 'var(--texte-sec)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Supprimer mes données</span>
                  <span style={{ fontSize: 12 }}>›</span>
                </button>
              ) : (
                <div style={{ background: 'rgba(199,78,78,0.05)', border: '1px solid rgba(199,78,78,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 10, lineHeight: 1.5 }}>
                    Vos données locales seront supprimées. Pour votre compte Premium, une confirmation vous sera envoyée sous 72h.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`mailto:vivre@vivre-a-majorque.es?subject=Suppression%20données%20RGPD${email ? `&body=Adresse%20%3A%20${encodeURIComponent(email)}` : ''}`}
                      onClick={() => { localStorage.clear(); setShowDeleteConfirm(false) }}
                      style={{ background: '#C74E4E', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      Confirmer
                    </a>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: '1px solid var(--gris)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--texte-sec)' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Politique de confidentialité</span>
                <span style={{ fontSize: 12 }}>↗</span>
              </a>
            </div>
            <p style={{ fontSize: 10, color: 'var(--gris-mid)', marginTop: 10, lineHeight: 1.5 }}>
              RGPD · LOPDGDD · LSSI · AEPD — Amely Attias · vivre@vivre-a-majorque.es
            </p>
          </div>
        </div>

        {/* ── Accompagnement ── */}
        <AccompagnementBanner
          texte="Vous préférez être guidé·e plutôt qu'avancer seul·e ?"
          cta="Voir les accompagnements →"
          style={{ marginBottom: 20 }}
        />

        {/* ── Gestion du compte (déplacé sous Mon accès) ── */}
        <div style={{ display: 'none' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {isPremium && (
              <a href="mailto:vivre@vivre-a-majorque.es?subject=Résiliation%20abonnement%20Premium"
                style={{ fontSize: 12, color: 'var(--texte-sec)', textDecoration: 'underline' }}>
                Résilier l'abonnement
              </a>
            )}
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontSize: 12, color: 'var(--texte-sec)', textDecoration: 'underline',
              }}>
                Supprimer mes données
              </button>
            ) : (
              <div style={{ width: '100%', background: 'rgba(199,78,78,0.05)', border: '1px solid rgba(199,78,78,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 6 }}>
                <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 10, lineHeight: 1.5 }}>
                  Vos données locales seront supprimées. Pour votre compte Premium, vous recevrez une confirmation sous 72h.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`mailto:vivre@vivre-a-majorque.es?subject=Suppression%20données%20RGPD${email ? `&body=Adresse%20%3A%20${encodeURIComponent(email)}` : ''}`}
                    onClick={() => { localStorage.clear(); setShowDeleteConfirm(false) }}
                    style={{ background: '#C74E4E', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    Confirmer
                  </a>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: '1px solid var(--gris)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--texte-sec)' }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
            <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--texte-sec)', textDecoration: 'underline' }}>
              Confidentialité
            </a>
          </div>
          <p style={{ fontSize: 11, color: 'var(--gris-mid)', lineHeight: 1.5 }}>
            RGPD · LOPDGDD · LSSI · AEPD — Responsable : Amely Attias · vivre@vivre-a-majorque.es
          </p>
        </div>

      </div>
    </div>

    {/* Quiz profil */}
    {showQuiz && (
      <QuizProfil
        onComplete={(answers) => { saveQuiz(answers); setShowQuiz(false) }}
        onSkip={() => setShowQuiz(false)}
      />
    )}
  </>
  )
}

/* ─────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────── */
export default function MonEspace() {
  const { profile } = useProfile()
  const { isPremium } = usePremium()
  const [view, setView] = useState('dashboard') // 'dashboard' | 'cockpit'
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
