import React, { useMemo, useState, useCallback } from 'react'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useNotionDB, parseCockpit } from '../hooks/useNotion'
import { NOTION_DB, PROFILS } from '../config'
import { useNavigate } from 'react-router-dom'
import { PaywallModal } from '../components/PaywallModal'
import AccompagnementBanner from '../components/AccompagnementBanner'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const PROFIL_NEXT = {
  reve: 'installe',
  installe: 'premiere',
  premiere: 'confirme',
}

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

// ─── CockpitFull ────────────────────────────────────────────────────────────
function CockpitFull({ profileNotion, profileId, onUpgrade }) {
  const { data, loading } = useNotionDB(NOTION_DB.cockpit)
  const { isPremium } = usePremium()
  const navigate = useNavigate()
  const [checked, toggle] = useCheckedSteps(profileId)
  const [showPaywallLocal, setShowPaywallLocal] = useState(false)

  const steps = useMemo(() => {
    return data
      .map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible === profileNotion)
      .sort((a, b) => a.ordre - b.ordre)
  }, [data, profileNotion])

  // 30/70 split : les 30% premiers sont accessibles en freemium
  const freeCount = useMemo(() => Math.max(1, Math.ceil(steps.length * 0.30)), [steps])

  const stepsWithAccess = useMemo(() => {
    return steps.map((s, i) => ({
      ...s,
      accessible: isPremium || i < freeCount,
    }))
  }, [steps, isPremium, freeCount])

  const byPhase = useMemo(() => {
    const map = {}
    stepsWithAccess.forEach(s => {
      if (!map[s.phase]) map[s.phase] = []
      map[s.phase].push(s)
    })
    return map
  }, [stepsWithAccess])

  const total = steps.length
  const accessible = stepsWithAccess.filter(s => s.accessible).length
  const done = stepsWithAccess.filter(s => checked.has(s.id)).length
  const doneAccessible = stepsWithAccess.filter(s => s.accessible && checked.has(s.id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const allAccessibleDone = accessible > 0 && doneAccessible >= accessible

  const nextProfil = PROFILS.find(p => p.id === PROFIL_NEXT[profileId])

  if (loading) return <div className="spinner">Chargement…</div>
  if (steps.length === 0) return <div className="empty">Aucune étape pour ce profil.</div>

  return (
    <div>
      {/* Jauge globale */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <AccentWord color={VERT} size={22}>Progression</AccentWord>
          <span style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 18 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--gris)', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%', borderRadius: 8,
            background: pct >= 100 ? '#4caf50' : 'var(--foret)',
            width: `${pct}%`, transition: 'width 0.4s ease',
          }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
          {done} / {total} étapes · {accessible < total && !isPremium && (
            <span
              onClick={onUpgrade}
              style={{ color: 'var(--foret)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {total - accessible} en Premium →
            </span>
          )}
        </p>
      </div>

      {/* Message de complétion */}
      {allAccessibleDone && (
        <div style={{
          background: 'var(--vert-light)', border: '1.5px solid rgba(90,122,64,0.3)',
          borderRadius: 14, padding: '16px 18px', marginBottom: 20,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          {isPremium ? (
            nextProfil ? (
              <>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 6 }}>
                  Toutes les étapes validées !
                </p>
                <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12 }}>
                  Vous êtes prêt pour l'étape suivante.
                </p>
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-profile-picker]')
                    if (el) el.click()
                  }}
                  style={{
                    background: 'var(--foret)', color: 'white',
                    padding: '10px 20px', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                  }}
                >
                  Passer à {nextProfil.emoji} {nextProfil.label} →
                </button>
              </>
            ) : (
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>
                Bravo ! Vous êtes un résident confirmé de Majorque 🌿
              </p>
            )
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 6 }}>
                Étapes gratuites complétées !
              </p>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12 }}>
                Débloquez les {total - accessible} étapes suivantes avec Premium.
              </p>
              <button
                onClick={onUpgrade}
                style={{
                  background: 'var(--foret)', color: 'white',
                  padding: '10px 20px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                }}
              >
                Voir tout le Cockpit →
              </button>
            </>
          )}
        </div>
      )}

      {/* Étapes par phase */}
      {Object.entries(byPhase).map(([phase, phaseSteps]) => (
        <div key={phase} style={{ marginBottom: 20 }}>
          <p className="section-title">{phase}</p>
          {phaseSteps.map(step => {
            const isDone = checked.has(step.id)
            if (!step.accessible) {
              // Étape verrouillée — floutée
              return (
                <div
                  key={step.id}
                  onClick={onUpgrade}
                  style={{
                    position: 'relative', marginBottom: 6, borderRadius: 10,
                    overflow: 'hidden', cursor: 'pointer',
                  }}
                >
                  {/* Contenu flouté */}
                  <div style={{
                    background: 'white', border: '1px solid var(--gris)',
                    borderRadius: 10, padding: '12px 14px',
                    filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none',
                  }}>
                    <p style={{ fontSize: 14, color: 'var(--foret)', fontWeight: 500 }}>
                      {step.etape}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {step.categorie && <span className="badge badge-gris" style={{ fontSize: 10 }}>{step.categorie}</span>}
                    </div>
                  </div>
                  {/* Overlay cadenas */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(250,250,248,0.5)',
                  }}>
                    <div style={{
                      background: 'white', borderRadius: 20, padding: '4px 12px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}>
                      <span style={{ fontSize: 14 }}>🔒</span>
                      <span style={{ fontSize: 11, color: 'var(--foret)', fontWeight: 700 }}>Premium</span>
                    </div>
                  </div>
                </div>
              )
            }

            // Étape accessible — cochable
            return (
              <div
                key={step.id}
                onClick={() => toggle(step.id)}
                style={{
                  background: isDone ? 'var(--vert-light)' : 'white',
                  border: `1px solid ${isDone ? 'rgba(90,122,64,0.2)' : 'var(--gris)'}`,
                  borderRadius: 10, padding: '12px 14px', marginBottom: 6,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${isDone ? 'var(--foret)' : 'var(--gris)'}`,
                  background: isDone ? 'var(--foret)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {isDone && <span style={{ color: 'white', fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4,
                    color: isDone ? 'var(--texte-sec)' : 'var(--foret)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {step.etape}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {step.categorie && <span className="badge badge-gris" style={{ fontSize: 10 }}>{step.categorie}</span>}
                    {step.priorite === '🔴 Urgent' && <span className="badge badge-ocre" style={{ fontSize: 10 }}>Urgent</span>}
                    {step.delai && <span style={{ fontSize: 11, color: 'var(--texte-sec)' }}>⏱ {step.delai}</span>}
                  </div>
                </div>
                {step.guideId && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/app/guide/${step.guideId}`) }}
                    style={{
                      color: 'var(--foret)', fontSize: 12, fontWeight: 500,
                      flexShrink: 0, marginTop: 2, background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Guide →
                  </button>
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

// ─── MonEspace ──────────────────────────────────────────────────────────────
export default function MonEspace() {
  const { profile, chooseProfile } = useProfile()
  const { isPremium, role, email, logout } = usePremium()
  const [showProfilPicker, setShowProfilPicker] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="" accent="Mon espace" color={VERT} accentSize={34} />
      </div>

      {/* Carte profil */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>Mon profil</p>
          <button
            data-profile-picker
            onClick={() => setShowProfilPicker(!showProfilPicker)}
            style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Modifier
          </button>
        </div>
        {profile ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>{profile.emoji}</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--foret)' }}>{profile.label}</p>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{profile.desc}</p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>Aucun profil sélectionné</p>
        )}
        {showProfilPicker && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--gris)', paddingTop: 12 }}>
            {PROFILS.map(p => (
              <button key={p.id} onClick={() => { chooseProfile(p.id); setShowProfilPicker(false) }} style={{
                display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: '8px 0',
                borderBottom: '1px solid var(--gris)', background: 'none', cursor: 'pointer', textAlign: 'left', border: 'none',
                borderBottom: '1px solid var(--gris)',
              }}>
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ fontSize: 14, color: 'var(--foret)' }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carte accès premium */}
      <div style={{
        background: isPremium ? 'var(--vert-light)' : 'var(--gris)',
        border: isPremium ? '1px solid rgba(90,122,64,0.2)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 4 }}>
              {isPremium ? '💎 Premium actif' : '🟢 Accès gratuit'}
            </p>
            {isPremium ? (
              <>
                {role === 'admin' && (
                  <span style={{
                    fontSize: 10, background: 'var(--foret)', color: 'white',
                    padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: 0.5,
                    display: 'inline-block', marginBottom: 6,
                  }}>ADMIN</span>
                )}
                {email && <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{email}</p>}
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>
                  Débloquez 100% des guides et tous les outils.
                </p>
                <button onClick={() => setShowPaywall(true)} style={{
                  background: 'var(--foret)', color: 'white', padding: '10px 18px', borderRadius: 10,
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
              fontSize: 11, color: 'var(--texte-sec)', textDecoration: 'underline', marginTop: 2, flexShrink: 0,
            }}>
              Déconnecter
            </button>
          )}
        </div>
      </div>

      {/* Cockpit */}
      {profile ? (
        <div>
          <p className="section-title">Mon cockpit d'installation</p>
          <CockpitFull
            profileNotion={profile.notion}
            profileId={profile.id}
            onUpgrade={() => setShowPaywall(true)}
          />
        </div>
      ) : (
        <div style={{
          background: 'var(--ocre-light)', borderRadius: 14, padding: '20px',
          textAlign: 'center', border: '1px solid rgba(196,122,90,0.15)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🧭</div>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 15, color: 'var(--foret)', marginBottom: 6 }}>
            Choisissez votre profil
          </p>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 14 }}>
            Pour voir votre cockpit personnalisé, sélectionnez votre situation.
          </p>
          <button onClick={() => setShowProfilPicker(true)} style={{
            background: 'var(--foret)', color: 'white', padding: '10px 20px', borderRadius: 10,
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            Choisir mon profil →
          </button>
        </div>
      )}

      <AccompagnementBanner
        texte="Vous préférez ne pas avancer seul·e dans ces étapes ? Je peux analyser votre situation et vous guider de A à Z."
        cta="Découvrir les accompagnements →"
        style={{ marginTop: 28 }}
      />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
