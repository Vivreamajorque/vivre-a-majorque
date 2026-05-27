import React, { useMemo, useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useNotionDB, parseCockpit } from '../hooks/useNotion'
import { NOTION_DB, PROFILS } from '../config'
import { useNavigate } from 'react-router-dom'
import { PaywallModal } from '../components/PaywallModal'

// ─── Cockpit complet (affiché si profil sélectionné) ───────────────────────
function CockpitFull({ profileNotion }) {
  const { data, loading } = useNotionDB(NOTION_DB.cockpit)
  const navigate = useNavigate()

  const steps = useMemo(() => {
    return data
      .map(parseCockpit)
      .filter(s => !profileNotion || s.profilCible === profileNotion)
      .sort((a, b) => a.ordre - b.ordre)
  }, [data, profileNotion])

  const byPhase = useMemo(() => {
    const map = {}
    steps.forEach(s => {
      if (!map[s.phase]) map[s.phase] = []
      map[s.phase].push(s)
    })
    return map
  }, [steps])

  const total = steps.length
  const done = steps.filter(s => s.statut === '✅ Validé').length
  const pct = total ? Math.round((done / total) * 100) : 0

  if (loading) return <div className="spinner">Chargement…</div>
  if (steps.length === 0) return <div className="empty">Aucune étape pour ce profil.</div>

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-titre)', fontSize: 16 }}>Progression globale</span>
          <span style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 18 }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 6 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{done} / {total} étapes validées</p>
      </div>

      {Object.entries(byPhase).map(([phase, phaseSteps]) => (
        <div key={phase} style={{ marginBottom: 20 }}>
          <p className="section-title">{phase}</p>
          {phaseSteps.map(step => (
            <div
              key={step.id}
              style={{
                background: '#fff', border: '1px solid var(--gris)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 6,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>
                {step.statut === '✅ Validé' ? '✅' :
                 step.statut === '🔄 En cours' ? '🔄' :
                 step.statut === '⏸️ En attente' ? '⏸️' :
                 step.statut === '🔒 Non applicable' ? '🔒' : '⬜'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14, fontWeight: 500,
                  color: step.statut === '✅ Validé' ? 'var(--texte-sec)' : 'var(--foret)',
                  textDecoration: step.statut === '✅ Validé' ? 'line-through' : undefined,
                  marginBottom: 2,
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
                  onClick={() => navigate(`/app/guide/${step.guideId}`)}
                  style={{ color: 'var(--foret)', fontSize: 12, fontWeight: 500, flexShrink: 0, marginTop: 2 }}
                >
                  Guide →
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
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
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)' }}>
          Mon espace
        </h1>
      </div>

      {/* ── Carte profil ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>Mon profil</p>
          <button
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
              <button
                key={p.id}
                onClick={() => { chooseProfile(p.id); setShowProfilPicker(false) }}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  width: '100%', padding: '8px 0',
                  borderBottom: '1px solid var(--gris)',
                  background: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ fontSize: 14, color: 'var(--foret)' }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Carte accès premium ── */}
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
                <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
                  {email && <span style={{ fontWeight: 500, color: 'var(--foret)' }}>{email}</span>}
                </p>
                <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 4 }}>
                  Accès illimité à tous les guides, simulateurs et ressources.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>
                  Débloquez 100% des guides et tous les outils.
                </p>
                <button
                  onClick={() => setShowPaywall(true)}
                  style={{
                    background: 'var(--foret)', color: 'white',
                    padding: '10px 18px', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                  }}
                >
                  Découvrir Premium →
                </button>
              </>
            )}
          </div>
          {isPremium && (
            <button
              onClick={logout}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'var(--texte-sec)', textDecoration: 'underline',
                marginTop: 2, flexShrink: 0,
              }}
            >
              Déconnecter
            </button>
          )}
        </div>
      </div>

      {/* ── Cockpit d'installation ── */}
      {profile && (
        <div>
          <p className="section-title">Mon cockpit d'installation</p>
          <CockpitFull profileNotion={profile.notion} />
        </div>
      )}
      {!profile && (
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
          <button
            onClick={() => setShowProfilPicker(true)}
            style={{
              background: 'var(--foret)', color: 'white',
              padding: '10px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Choisir mon profil →
          </button>
        </div>
      )}

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
