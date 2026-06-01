import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TERRA, VERT, DisplayTitle, AccentWord, Trait } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'

export default function MerciVisio() {
  useSEO({
    title: "Merci — Votre Visio Conseil est confirmée",
    description: "Votre Visio Conseil avec Amely est confirmée. Vous recevrez votre questionnaire de préparation sous 24h. À très bientôt !",
    url: "https://vivre-a-majorque.vercel.app/app/merci-visio",
    robots: "noindex, nofollow",
  })
  const navigate = useNavigate()
  const [form, setForm] = useState({ prenom: '', email: '', whatsapp: '', projet: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.prenom || !form.email || !form.whatsapp || !form.projet) return
    setLoading(true)
    try {
      await fetch('https://formsubmit.co/ajax/lalignemallorca@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `🎉 Nouvelle Visio — ${form.prenom}`,
          Prénom: form.prenom,
          Email: form.email,
          WhatsApp: form.whatsapp,
          Projet: form.projet,
          _template: 'table',
        }),
      })
      setSent(true)
    } catch {
      setSent(true)
    }
    setLoading(false)
  }

  const allFilled = form.prenom && form.email && form.whatsapp && form.projet

  if (sent) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌴</div>
        <DisplayTitle size={32}>C'est bon !</DisplayTitle>
        <AccentWord color={TERRA} size={20}>À très vite</AccentWord>
        <Trait color={TERRA} width={40} />
        <p style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          fontSize: 16, color: 'var(--texte-sec)',
          lineHeight: 1.6, marginTop: 16, marginBottom: 28, maxWidth: 300,
        }}>
          Amely revient vers toi sous 24h avec le questionnaire de préparation.
        </p>
        <button
          onClick={() => navigate('/app')}
          style={{
            background: FORET, color: '#F7F2EB',
            border: 'none', borderRadius: 30,
            padding: '12px 28px', fontSize: 15,
            fontFamily: 'var(--font-corps)', fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{
          display: 'inline-block',
          background: 'rgba(199,110,78,0.15)',
          border: '1px solid rgba(199,110,78,0.3)',
          borderRadius: 20, padding: '3px 12px', marginBottom: 10,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TERRA, fontFamily: 'var(--font-corps)' }}>
            PAIEMENT CONFIRMÉ
          </span>
        </div>
        <DisplayTitle size={34}>Merci !</DisplayTitle>
        <AccentWord color={TERRA} size={22}>Plus qu'une étape</AccentWord>
        <Trait color={TERRA} width={40} />
        <p style={{
          fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          fontSize: 15, color: 'var(--texte-sec)',
          lineHeight: 1.6, marginTop: 10,
        }}>
          Pour préparer ta visio, j'ai besoin de quelques infos. 2 minutes, c'est tout.
        </p>
      </div>

      {/* Formulaire */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Prénom */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)', display: 'block', marginBottom: 6 }}>
            Ton prénom
          </label>
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Marie"
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              borderRadius: 12, fontSize: 15,
              fontFamily: 'var(--font-corps)',
              background: '#fff', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)', display: 'block', marginBottom: 6 }}>
            Ton email de contact
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="marie@email.com"
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              borderRadius: 12, fontSize: 15,
              fontFamily: 'var(--font-corps)',
              background: '#fff', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)', display: 'block', marginBottom: 6 }}>
            Ton numéro WhatsApp
          </label>
          <input
            name="whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="+33 6 12 34 56 78"
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              borderRadius: 12, fontSize: 15,
              fontFamily: 'var(--font-corps)',
              background: '#fff', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 4, fontFamily: 'var(--font-corps)' }}>
            Pour planifier la visio facilement
          </p>
        </div>

        {/* Projet */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)', display: 'block', marginBottom: 6 }}>
            Ton projet en 2-3 phrases
          </label>
          <textarea
            name="projet"
            value={form.projet}
            onChange={handleChange}
            placeholder="Ex : Je suis graphiste freelance, je vis à Lyon avec mon compagnon et notre fille de 4 ans. On veut s'installer à Majorque d'ici 6-8 mois mais je ne sais pas par où commencer..."
            rows={5}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              borderRadius: 12, fontSize: 14,
              fontFamily: 'var(--font-corps)',
              background: '#fff', outline: 'none',
              resize: 'vertical', lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled || loading}
          style={{
            background: allFilled ? FORET : 'rgba(0,0,0,0.12)',
            color: allFilled ? '#F7F2EB' : 'rgba(0,0,0,0.3)',
            border: 'none', borderRadius: 30,
            padding: '14px 28px', fontSize: 16,
            fontFamily: 'var(--font-corps)', fontWeight: 700,
            cursor: allFilled ? 'pointer' : 'default',
            transition: 'all 0.2s', width: '100%',
          }}
        >
          {loading ? 'Envoi...' : 'Envoyer mes infos →'}
        </button>

        <p style={{
          fontSize: 12, color: 'var(--texte-sec)',
          textAlign: 'center', fontFamily: 'var(--font-titre)',
          fontStyle: 'italic', lineHeight: 1.5,
        }}>
          Amely revient vers toi sous 24h avec le questionnaire de préparation et les créneaux disponibles.
        </p>
      </div>
    </div>
  )
}
