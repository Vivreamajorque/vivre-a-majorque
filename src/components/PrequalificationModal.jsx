import React, { useState } from 'react'
import { track } from '@vercel/analytics'

const FORET = '#0F3D35'
const VERT  = '#5AADA5'
const TERRA = '#C76E4E'

/*
 * PrequalificationModal
 * Affiché quand le prospect clique "Réserver" sur Éclaireur ou Intégrale.
 * Collecte : prénom, email, situation, projet, timeline, conscience du budget.
 * Envoie à /api/prequalification → email à Amely + confirmation au prospect.
 */
export default function PrequalificationModal({ offre, isOpen, onClose }) {
  const [step, setStep]               = useState(1) // 1 = formulaire, 2 = succès
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const [prenom, setPrenom]           = useState('')
  const [email, setEmail]             = useState('')
  const [situation, setSituation]     = useState('')
  const [projet, setProjet]           = useState('')
  const [timeline, setTimeline]       = useState('')
  const [budgetOk, setBudgetOk]       = useState(false)

  if (!isOpen) return null

  const canSubmit = prenom.trim() && email.trim() && projet.trim() && budgetOk && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/prequalification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: prenom.trim(),
          email: email.trim().toLowerCase(),
          offre: offre?.titre,
          situation: situation.trim(),
          projet: projet.trim(),
          timeline: timeline.trim(),
          budget_conscience: budgetOk,
        }),
      })
      if (!res.ok) throw new Error('Erreur réseau')
      track('prequalification_submitted', { offre: offre?.titre })
      setStep(2)
    } catch (e) {
      setError('Une erreur est survenue. Réessayez ou écrivez directement à lalignemallorca@gmail.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,61,53,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FAF5EC',
          borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 480,
          padding: '24px 24px 40px',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#D4CCC2', margin: '0 auto 20px',
        }} />

        {step === 1 ? (
          <>
            {/* En-tête */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: VERT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                {offre?.titre} — {offre?.prix}
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 24, color: FORET, lineHeight: 1.2, marginBottom: 8,
              }}>
                Dites-moi en 2 min
              </h2>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
                Je lis chaque demande personnellement. Je reviens vers vous sous 24h avec une confirmation et le lien de paiement.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Prénom + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    placeholder="Votre prénom"
                    style={inputStyle(prenom)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    style={inputStyle(email)}
                  />
                </div>
              </div>

              {/* Situation */}
              <div>
                <label style={labelStyle}>Votre situation actuelle</label>
                <input
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder="ex : Salarié en France, en télétravail, retraité…"
                  style={inputStyle(situation)}
                />
              </div>

              {/* Projet */}
              <div>
                <label style={labelStyle}>Votre projet à Majorque *</label>
                <textarea
                  value={projet}
                  onChange={e => setProjet(e.target.value)}
                  placeholder="Décrivez votre projet en quelques lignes — activité, type de vie visé, doutes principaux…"
                  rows={3}
                  style={{
                    ...inputStyle(projet),
                    resize: 'none', lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Timeline */}
              <div>
                <label style={labelStyle}>Votre timeline envisagée</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Moins de 3 mois', '3 à 6 mois', '6 à 12 mois', 'Plus d\'1 an'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeline(t)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 20,
                        border: `1.5px solid ${timeline === t ? FORET : '#D4CCC2'}`,
                        background: timeline === t ? FORET : '#fff',
                        color: timeline === t ? '#fff' : 'var(--texte-sec)',
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-corps)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conscience du budget */}
              <div
                onClick={() => setBudgetOk(v => !v)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px', borderRadius: 14,
                  background: budgetOk ? `${FORET}08` : '#fff',
                  border: `1.5px solid ${budgetOk ? `${FORET}30` : '#D4CCC2'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: budgetOk ? FORET : '#fff',
                  border: `2px solid ${budgetOk ? FORET : '#C8C0B4'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {budgetOk && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <p style={{ fontSize: 13, color: FORET, lineHeight: 1.5 }}>
                  J'ai bien noté que cet accompagnement est à <strong>{offre?.prix}</strong> et je suis prêt·e à investir ce montant si ma demande est validée. *
                </p>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#C74E4E', textAlign: 'center', lineHeight: 1.5 }}>
                  {error}
                </p>
              )}

              {/* Bouton submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: '15px 0',
                  background: canSubmit ? FORET : '#D4CCC2',
                  color: canSubmit ? '#fff' : '#8A7F74',
                  border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'default',
                  fontFamily: 'var(--font-corps)',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma demande →'}
              </button>

              <p style={{ fontSize: 11, color: 'var(--texte-sec)', textAlign: 'center', lineHeight: 1.5 }}>
                Réponse personnelle d'Amely sous 24h · Aucun paiement maintenant
              </p>
            </div>
          </>
        ) : (
          /* ── Succès ── */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 24, color: FORET, marginBottom: 12,
            }}>
              C'est envoyé !
            </h2>
            <p style={{ fontSize: 15, color: 'var(--texte-sec)', lineHeight: 1.65, marginBottom: 8 }}>
              Votre demande est bien reçue. Amely revient vers vous sous 24h avec une confirmation personnelle et le lien de paiement.
            </p>
            <p style={{ fontSize: 13, color: VERT, fontWeight: 600, marginBottom: 28 }}>
              Un email de confirmation vous a été envoyé.
            </p>
            <button
              onClick={onClose}
              style={{
                background: FORET, color: '#fff',
                border: 'none', borderRadius: 14,
                padding: '13px 32px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-corps)',
              }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12, fontWeight: 700,
  color: '#8A7F74', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 6,
  fontFamily: 'var(--font-corps)',
}

const inputStyle = (value) => ({
  width: '100%', padding: '11px 14px',
  borderRadius: 12,
  border: `1.5px solid ${value ? '#0F3D3530' : '#D4CCC2'}`,
  background: '#fff',
  fontSize: 14, color: '#1C1410',
  fontFamily: 'var(--font-corps)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
})
