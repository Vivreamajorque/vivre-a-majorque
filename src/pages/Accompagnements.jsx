import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const CONTACT_EMAIL = 'lalignemallorca@gmail.com'

const OFFRES = [
  {
    id: 'visio',
    label: 'Entrée',
    titre: 'Visio conseil',
    prix: '99 €',
    accroche: 'Une session pour y voir clair',
    couleur: 'var(--gris)',
    border: 'rgba(0,0,0,0.08)',
    textAccent: 'var(--foret)',
    highlight: false,
    inclus: [
      { ok: true,  texte: '1 visio 45 min — diagnostic de votre situation' },
      { ok: true,  texte: 'Email récap avec 3 priorités à la fin' },
      { ok: false, texte: 'Dossier personnalisé' },
      { ok: false, texte: 'Suivi email' },
    ],
    pour: 'Pour les indécis qui veulent tester avant de s\'engager',
    sujet: 'Demande Visio Conseil — 99€',
    stripeUrl: 'https://buy.stripe.com/bJeaEW1CYcSd8By0Zf6AM0J',
  },
  {
    id: 'cap',
    label: '⭐ Recommandé',
    titre: 'Cap Majorque',
    prix: '249 €',
    accroche: 'L\'accompagnement complet pour réussir votre installation',
    couleur: '#E8F5F4',
    border: 'rgba(126,200,192,0.4)',
    textAccent: '#0F6E56',
    highlight: true,
    inclus: [
      { ok: true, texte: 'Visio 1 — diagnostic complet 60 min' },
      { ok: true, texte: 'Dossier personnalisé livré sous 72h (roadmap, points de vigilance, contacts adaptés)' },
      { ok: true, texte: 'Visio 2 — prise de route 45 min' },
      { ok: true, texte: 'Suivi email 30 jours' },
      { ok: true, texte: 'Checklist imprimable + calendrier des démarches' },
    ],
    pour: 'Familles, salariés en remote, retraités — ceux qui ne veulent pas avancer seuls',
    sujet: 'Demande Cap Majorque — 249€',
    stripeUrl: 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K',
  },
  {
    id: 'eclaireur',
    label: 'Entrepreneurs',
    titre: 'Audit Éclaireur',
    prix: '290 €',
    accroche: 'Analyse de votre projet professionnel à Majorque',
    couleur: 'var(--ocre-light)',
    border: 'rgba(199,110,78,0.2)',
    textAccent: '#7a3e22',
    highlight: false,
    inclus: [
      { ok: true, texte: 'Analyse viabilité du projet pro en Espagne' },
      { ok: true, texte: 'Statut optimal (autónoma, SL, télétravailleur)' },
      { ok: true, texte: 'Fiscalité pro + obligations IRPF/IVA' },
      { ok: true, texte: 'Audit visibilité SEO marché francophone' },
    ],
    pour: 'Entrepreneurs, indépendants, créateurs d\'activité à Majorque',
    sujet: 'Demande Audit Éclaireur — 290€',
    stripeUrl: 'https://buy.stripe.com/dRmcN4gxS4lH196fU96AM0L',
  },
  {
    id: 'integrale',
    label: '💎 Meilleure valeur',
    titre: 'L\'Installation Intégrale',
    prix: '449 €',
    prixBarre: '539 €',
    accroche: 'Cap Majorque + Audit Éclaireur — vie et activité réunies',
    couleur: '#FBF5F0',
    border: 'rgba(199,110,78,0.35)',
    textAccent: '#7a3e22',
    highlight: false,
    inclus: [
      { ok: true, texte: 'Tout le Cap Majorque (2 visios + dossier)' },
      { ok: true, texte: 'Tout l\'Audit Éclaireur (pro + fiscal + SEO)' },
      { ok: true, texte: 'Dossier unique fusionné — vie perso + projet pro' },
      { ok: true, texte: 'Suivi email 60 jours (au lieu de 30)' },
      { ok: true, texte: 'Économie de 90 € vs achats séparés' },
    ],
    pour: 'Entrepreneurs qui déménagent leur vie ET leur activité à Majorque',
    sujet: 'Demande Installation Intégrale — 449€',
    stripeUrl: 'https://buy.stripe.com/eVq00i95q9G16tq6jz6AM0M',
  },
]

function OffreCard({ offre }) {
  const [ouvert, setOuvert] = useState(false)

  const handleReserver = () => {
    if (offre.stripeUrl) {
      window.open(offre.stripeUrl, '_blank', 'noopener,noreferrer')
    } else {
      const body = encodeURIComponent(
        `Bonjour Amely,\n\nJe souhaite réserver "${offre.titre}" à ${offre.prix}.\n\nMon projet : \n\nMa situation actuelle : \n\nMa timeline envisagée : \n\nMerci !`
      )
      window.open(
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(offre.sujet)}&body=${body}`,
        '_blank'
      )
    }
  }

  return (
    <div style={{
      background: offre.couleur,
      border: `1.5px solid ${offre.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
      boxShadow: offre.highlight ? '0 4px 20px rgba(126,200,192,0.18)' : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: offre.textAccent,
            background: offre.highlight ? 'rgba(126,200,192,0.25)' : 'rgba(0,0,0,0.07)',
            padding: '3px 10px', borderRadius: 20,
          }}>
            {offre.label}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-2xl)',
              fontWeight: 700, color: 'var(--foret)',
            }}>
              {offre.prix}
            </span>
            {offre.prixBarre && (
              <span style={{
                fontSize: 12, color: 'var(--texte-sec)',
                textDecoration: 'line-through', marginLeft: 6,
              }}>
                {offre.prixBarre}
              </span>
            )}
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-xl)',
          fontWeight: 700, color: 'var(--foret)', marginBottom: 6, lineHeight: 1.3,
        }}>
          {offre.titre}
        </p>

        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 14 }}>
          {offre.accroche}
        </p>

        {/* Inclus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {offre.inclus.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 13, flexShrink: 0, marginTop: 1,
                color: item.ok ? offre.textAccent : 'var(--texte-sec)',
                opacity: item.ok ? 1 : 0.4,
              }}>
                {item.ok ? '✓' : '✕'}
              </span>
              <span style={{
                fontSize: 13, lineHeight: 1.4,
                color: item.ok ? 'var(--foret)' : 'var(--texte-sec)',
                opacity: item.ok ? 1 : 0.5,
              }}>
                {item.texte}
              </span>
            </div>
          ))}
        </div>

        {/* Pour qui */}
        <p style={{
          fontSize: 11, color: offre.textAccent,
          background: 'rgba(0,0,0,0.05)', borderRadius: 8,
          padding: '7px 10px', lineHeight: 1.5, marginBottom: 14,
          fontStyle: 'italic',
        }}>
          {offre.pour}
        </p>

        {/* CTA */}
        <button
          onClick={handleReserver}
          style={{
            width: '100%',
            padding: '13px 0',
            background: offre.highlight ? 'var(--foret)' : 'transparent',
            color: offre.highlight ? '#fff' : 'var(--foret)',
            border: `1.5px solid var(--foret)`,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-corps)',
          }}
        >
          Réserver cette offre →
        </button>
      </div>
    </div>
  )
}

export default function Accompagnements() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: 'var(--foret)', padding: 0, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← <span style={{ fontSize: 13, fontFamily: 'var(--font-corps)' }}>Explorer</span>
        </button>
        <PageHeading label="nos" title="Accompagnements" accentColor={VERT} traitColor={VERT} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 4 }}>
          Vous ne voulez pas avancer seul ? Je vous accompagne personnellement dans votre installation à Majorque — de l'analyse de votre situation à la prise de route.
        </p>
      </div>

      {OFFRES.map(offre => (
        <OffreCard key={offre.id} offre={offre} />
      ))}

      <div style={{
        textAlign: 'center', padding: '16px 0 8px',
        borderTop: '0.5px solid var(--gris)',
        fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.6,
      }}>
        Une question avant de vous décider ?{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--foret)', fontWeight: 600 }}>
          Écrivez-moi →
        </a>
      </div>
    </div>
  )
}
