import React, { useMemo, useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { useNotionDB, parseCockpit } from '../hooks/useNotion'
import { NOTION_DB, PROFILS, PREMIUM_PRICE, PREMIUM_STRIPE_LINK } from '../config'
import { useNavigate } from 'react-router-dom'

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
          <span style={{ fontWeight: 700, color: 'var(--vert-dark)', fontSize: 18 }}>{pct}%</span>
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
                background: '#fff',
                border: '1px solid var(--gris)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: 6,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
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
                  fontSize: 14,
                  fontWeight: 500,
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
                  style={{ color: 'var(--ocre)', fontSize: 12, fontWeight: 500, flexShrink: 0, marginTop: 2 }}
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

export default function MonEspace() {
  const { profile, chooseProfile, resetProfile } = useProfile()
  const { isPremium, isOwner, email, saveEmail } = usePremium()
  const [showProfilPicker, setShowProfilPicker] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailMsg, setEmailMsg] = useState('')

  function handleEmailSubmit(e) {
    e.preventDefault()
    const isOwnerNow = saveEmail(emailInput)
    setEmailMsg(emailInput.toLowerCase() === 'amely.attias@gmail.com' ? '✅ Accès propriétaire activé' : '✅ Email enregistré')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)' }}>
          Mon espace
        </h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>Mon profil</p>
          <button onClick={() => setShowProfilPicker(!showProfilPicker)} style={{ fontSize: 12, color: 'var(--vert-dark)', fontWeight: 500 }}>
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
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--gris)',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ fontSize: 14, color: 'var(--foret)' }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 8 }}>
          Accès {isPremium ? '💎 Premium' : '🟢 Gratuit'}
        </p>
        {isPremium ? (
          <div>
            <p style={{ fontSize: 13, color: 'var(--vert-dark)', fontWeight: 500, marginBottom: 4 }}>
              {isOwner ? '✅ Accès propriétaire' : '✅ Premium actif'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
              Accès à tous les guides et contenus.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 10 }}>
              Débloquez 35+ guides détaillés pour {PREMIUM_PRICE}
            </p>
            <a
              href={PREMIUM_STRIPE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--ocre)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                marginBottom: 12,
              }}
            >
              Devenir Premium →
            </a>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 6 }}>Déjà Premium ? Entrez votre email :</p>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="votre@email.com"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gris)', fontSize: 13 }}
              />
              <button type="submit" style={{ background: 'var(--vert)', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                OK
              </button>
            </form>
            {emailMsg && <p style={{ fontSize: 12, color: 'var(--vert-dark)', marginTop: 6 }}>{emailMsg}</p>}
          </div>
        )}
      </div>

      {profile && (
        <div>
          <p className="section-title">Mon cockpit d'installation</p>
          <CockpitFull profileNotion={profile.notion} />
        </div>
      )}
    </div>
  )
}
