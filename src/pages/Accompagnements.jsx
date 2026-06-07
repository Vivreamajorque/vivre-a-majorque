import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { track } from '@vercel/analytics'
import { PageHeading, TERRA, VERT } from '../components/WaveTitle'
import Temoignages from '../components/Temoignages'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'
const CONTACT_EMAIL = 'lalignemallorca@gmail.com'

const VISIO = {
  id: 'visio',
  titre: 'Session conseil 45 min',
  prix: '79 €',
  accroche: 'Votre situation analysée, votre plan d\'action posé — en visio ou en rencontre physique à Campos',
  stripeUrl: 'https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W',
  inclus: [
    '45 min de diagnostic individuel — votre situation précise, pas un cas générique',
    'En visio depuis chez vous, ou en rencontre physique à Campos (Carrer de Santanyi 19)',
    'L\'ordre exact des démarches pour votre profil — évitez les erreurs coûteuses',
    'Compte-rendu écrit sous 48h — plan d\'action, contacts, points de vigilance',
  ],
}

const FAQS = [
  {
    q: "C'est quoi exactement ce que vous faites pendant la visio ?",
    a: "Je lis votre questionnaire avant l'appel. Je n'arrive pas les mains vides. Pendant 45 minutes on travaille votre situation spécifique : ordre des démarches, points de vigilance selon votre profil, budget réaliste, questions qu'on vous posera à la préfecture ou chez le banquier. À la fin vous avez une note de route livrée sous 48h avec vos 3 priorités dans l'ordre et la première action à faire dans les 7 jours.",
  },
  {
    q: "Je peux pas trouver les mêmes infos gratuitement sur internet ?",
    a: "Vous pouvez. Il vous faudra environ 40h à éplucher des forums, des blogs datés de 2019, des sites en espagnol et des groupes Facebook où tout le monde se contredit. Ce que je fais c'est vous sortir les informations qui s'appliquent à votre situation, dans votre langue, avec les sources officielles vérifiées. Certains préfèrent chercher seuls — c'est tout à fait valable. D'autres préfèrent 45 minutes et une réponse claire.",
  },
  {
    q: "Ma situation est trop particulière pour une visio de 45 minutes.",
    a: "C'est souvent ce que pensent les gens avant d'appeler. Dans 80% des cas, une situation qui semble complexe a une logique claire une fois qu'on la décompose. Si votre situation est vraiment hors-norme, je vous le dirai honnêtement — et je vous orienterai vers les bons interlocuteurs (gestor, avocat spécialisé).",
  },
  {
    q: "Je ne suis pas encore sûr(e) de vouloir m'installer à Majorque.",
    a: "C'est exactement pour ça que la session existe. Vous repartez avec une image réaliste de ce que représente votre projet — budget, délais, obstacles. Ça aide autant à décider d'y aller qu'à décider que ce n'est pas le bon moment.",
  },
  {
    q: "Pourquoi vous et pas un cabinet de conseil en expatriation ?",
    a: "Parce que je vis ici. J'ai fait les démarches il y a un an. J'ai un compte bancaire espagnol, un statut autónoma, une fille à l'école espagnole. Je connais les délais réels, les bonnes adresses, ce qui a changé depuis la loi de 2023. Un cabinet peut vous vendre un dossier générique. Moi je vous réponds depuis l'intérieur.",
  },
  {
    q: "Et si j'ai encore des questions après la session ?",
    a: "La note de route livrée sous 48h répond à 90% des questions qui émergent juste après. Si vous souhaitez un accompagnement plus long, écrivez-moi directement — on voit ensemble ce qui fait sens pour votre situation.",
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ borderBottom: '0.5px solid var(--gris)', paddingBottom: open ? 14 : 0, marginBottom: open ? 4 : 0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none',
          cursor: 'pointer', padding: '14px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 12, textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 600, color: FORET, lineHeight: 1.45, flex: 1 }}>{q}</span>
        <span style={{ fontSize: 18, color: 'var(--texte-sec)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.65, fontFamily: 'var(--font-corps)', paddingRight: 24 }}>{a}</p>
      )}
    </div>
  )
}

export default function Accompagnements() {
  const navigate = useNavigate()

  useSEO({
    title: 'Session conseil installation à Majorque — 79€',
    description: '45 min pour analyser votre situation, poser votre plan d\'action et éviter les erreurs coûteuses. En visio ou à Campos. Par Amely, française installée sur l\'île.',
    url: 'https://vivre-a-majorque.vercel.app/app/explorer/accompagnements',
  })

  const handleReserver = () => {
    track('accompagnement_clicked', { offre: 'visio', prix: '79€' })
    window.open(VISIO.stripeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: VERT, fontSize: 13, fontWeight: 600,
          padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Explorer
        </button>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>votre projet</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6 }}>
          Parlons de votre installation
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          Une session de 45 min pour sortir du flou — votre situation analysée, votre plan posé, les erreurs évitées.
        </p>
      </div>

      {/* Carte principale */}
      <div style={{
        background: FORET,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        boxShadow: '0 6px 30px rgba(15,61,53,0.18)',
      }}>
        <div style={{ padding: '24px 20px 20px' }}>

          {/* Prix */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 52, color: '#F7F2EB', lineHeight: 1 }}>79</span>
            <span style={{ fontSize: 20, color: 'rgba(247,242,235,0.7)', fontFamily: 'var(--font-corps)' }}>€</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.5)', marginBottom: 16 }}>Session unique · Sans abonnement</p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#F7F2EB', lineHeight: 1.2, marginBottom: 8 }}>
            {VISIO.titre}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(247,242,235,0.75)', lineHeight: 1.55, marginBottom: 20 }}>
            {VISIO.accroche}
          </p>

          {/* Ce qui est inclus */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {VISIO.inclus.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: VERT, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 14, color: 'rgba(247,242,235,0.9)', lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleReserver}
            style={{
              width: '100%', padding: '16px 0',
              background: TERRA, color: '#fff', border: 'none',
              borderRadius: 12, fontSize: 16, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'var(--font-corps)',
              boxShadow: '0 4px 20px rgba(199,110,78,0.4)',
            }}
          >
            Réserver ma session →
          </button>

          <p style={{ fontSize: 12, textAlign: 'center', color: 'rgba(90,173,165,0.8)', marginTop: 10, lineHeight: 1.5, fontFamily: 'var(--font-corps)' }}>
            📅 Après le paiement, choisissez votre créneau. En visio ou en rencontre physique à Campos — au choix.
          </p>
        </div>
      </div>

      {/* Preuve sociale */}
      <Temoignages style={{ marginBottom: 16 }} />

      {/* Encart périmètre */}
      <div style={{
        background: '#F7F2EB',
        border: '1px solid rgba(15,61,53,0.12)',
        borderLeft: '3px solid #0F3D35',
        borderRadius: '0 12px 12px 0',
        padding: '18px 18px 16px',
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#0F3D35', fontFamily: 'var(--font-corps)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          📌 Ce que je fais — et ce que je ne fais pas
        </p>
        <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.65, fontFamily: 'var(--font-corps)', marginBottom: 10 }}>
          Mon rôle est de <strong>conseiller, guider et analyser</strong> votre projet à Majorque. Je simplifie des démarches complexes, avec des sources officielles vérifiées (BOE, AEAT, Seguridad Social, Govern Balear).
        </p>
        <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.65, fontFamily: 'var(--font-corps)' }}>
          Je ne remplace pas le <strong>gestor, l'avocat ou le notaire</strong> pour les actes juridiques et fiscaux.
        </p>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 16, color: TERRA, marginBottom: 4 }}>vos questions</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: FORET, lineHeight: 1.1, marginBottom: 4 }}>
          Ce que tout le monde se demande
        </h2>
        <div style={{ width: 30, height: 3, background: VERT, borderRadius: 2, marginBottom: 16 }} />
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--gris)', padding: '0 16px' }}>
          {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0 8px', borderTop: '0.5px solid var(--gris)', fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.65 }}>
        Une question avant de vous décider ?{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: FORET, fontWeight: 600 }}>Écrivez-moi →</a>
      </div>

      <Link to="/app/cas-pratiques" style={{ display: 'block', textAlign: 'center', padding: '12px 0', marginTop: 4, fontSize: 13, color: 'var(--texte-sec)', textDecoration: 'none', fontFamily: 'var(--font-corps)' }}>
        🔍 Voir des cas concrets →
      </Link>
    </div>
  )
}
