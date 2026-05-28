import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const RAISONS = [
  { id: 'question', label: '❓ J\'ai une question' },
  { id: 'partenaire', label: '🤝 Devenir partenaire / presse' },
  { id: 'annuaire', label: '📋 Être dans l\'annuaire' },
]

export default function Contact() {
  const navigate = useNavigate()
  const [raison, setRaison] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--gris)',
    borderRadius: 'var(--radius)',
    fontSize: 16,
    fontFamily: 'var(--font-corps)',
    background: '#fff',
    color: 'var(--noir)',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: 6,
  }

  const handleSend = () => {
    if (!raison || !nom || !email || !message) return
    const raisonLabel = RAISONS.find(r => r.id === raison)?.label || raison
    const subject = encodeURIComponent(`[Vivre à Majorque] ${raisonLabel} — ${nom}`)
    const body = encodeURIComponent(`Motif : ${raisonLabel}\nNom : ${nom}\nEmail : ${email}\n\n${message}`)
    window.location.href = `mailto:amely.attias@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  const canSend = raison && nom.trim() && email.trim() && message.trim()

  if (sent) {
    return (
      <div className="page">
        <div className="page-header">
          <button onClick={() => navigate('/app/explorer')} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: 'var(--foret)', padding: 0, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>← <span style={{ fontSize: 14, fontFamily: 'var(--font-corps)' }}>Explorer</span></button>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 48 }}>✉️</span>
          <h2 style={{ fontFamily: 'var(--font-titre)', color: 'var(--foret)', fontSize: 'var(--fs-2xl)' }}>
            Message prêt à envoyer
          </h2>
          <p style={{ fontSize: 16, color: 'var(--texte-sec)', lineHeight: 1.65 }}>
            Votre application mail vient de s'ouvrir avec votre message pré-rempli. Il vous suffit d'appuyer sur Envoyer.
          </p>
          <button onClick={() => { setSent(false); setRaison(''); setNom(''); setEmail(''); setMessage('') }}
            style={{
              background: 'none', border: '1px solid var(--gris)', borderRadius: 'var(--radius)',
              padding: '10px 20px', fontSize: 16, cursor: 'pointer', color: 'var(--texte-sec)',
            }}>
            Nouveau message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: 'var(--foret)', padding: 0, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 14, fontFamily: 'var(--font-corps)' }}>Explorer</span></button>
        <PageHeading label="une question ?" title="Contact" accentColor={VERT} traitColor={VERT} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginBottom: 16 }}>
          Une question ? On vous répond sous 48h.
        </p>
      </div>

      {/* Sélection raison */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foret)', marginBottom: 10 }}>
          Quel est le motif de votre message ?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RAISONS.map(r => (
            <button
              key={r.id}
              onClick={() => setRaison(r.id)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                border: raison === r.id ? '2px solid var(--foret)' : '1px solid var(--gris)',
                background: raison === r.id ? 'var(--foret)' : '#fff',
                color: raison === r.id ? '#fff' : 'var(--noir)',
                fontSize: 16,
                fontFamily: 'var(--font-corps)',
                fontWeight: raison === r.id ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Champs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--foret)' }}>Votre nom</label>
          <input
            type="text"
            placeholder="Marie Dupont"
            value={nom}
            onChange={e => setNom(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--foret)' }}>Votre email</label>
          <input
            type="email"
            placeholder="marie@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--foret)' }}>Votre message</label>
          <textarea
            placeholder="Décrivez votre demande…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.50 }}
          />
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          marginTop: 24,
          width: '100%',
          padding: '14px',
          background: canSend ? 'var(--foret)' : 'var(--gris)',
          color: canSend ? '#fff' : 'var(--texte-sec)',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-corps)',
          cursor: canSend ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        Envoyer le message ✉️
      </button>
    </div>
  )
}
