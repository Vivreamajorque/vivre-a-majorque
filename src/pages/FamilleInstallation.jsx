import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { TERRA, VERT } from '../components/WaveTitle'
import AccompagnementBanner from '../components/AccompagnementBanner'

const FORET = '#0F3D35'
const CAP_STRIPE = 'https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K'

const ETAPES = [
  { emoji: '📋', titre: 'Le NIE pour toute la famille', desc: 'Un NIE par personne — adultes ET enfants. Démarche au consulat espagnol avant le départ. Délais : 3 semaines à 4 mois selon le consulat.' },
  { emoji: '🏠', titre: 'Trouver un logement adapté', desc: 'Marché tendu hors-saison. Dossier à préparer avant de chercher : NIE, justificatifs de revenus, garanties. Comptez 3-4 mois de recherche.' },
  { emoji: '📚', titre: 'Scolariser vos enfants', desc: 'Inscription via la conselleria (calendrier mars-avril pour septembre). École publique dès 3 ans, gratuite. Adaptation linguistique : 3 à 6 mois en moyenne.' },
  { emoji: '🏥', titre: 'Couverture santé', desc: 'Carte SIP (carte Vitale espagnole) via la Seguridad Social. Délai 3-6 semaines. Mutuelle complémentaire conseillée pendant la période d\'attente.' },
  { emoji: '💼', titre: 'Votre statut professionnel', desc: 'Autónoma, salarié en remote, portage — chaque situation a sa logique. À régler avant l\'arrivée pour ne pas rester sans revenus le mois 2.' },
  { emoji: '🚗', titre: 'Le véhicule', desc: 'Réimmatriculation obligatoire dans les 30 jours si vous conduisez en Espagne. Taxe DGT + IEDMT selon les émissions CO2. À anticiper dans le budget.' },
]

const SCHOOLS = [
  { type: 'École publique espagnole', prix: '65–70 €/mois', detail: 'Cantina + matériel uniquement. Gratuit sinon. Immersion espagnol/catalan. Adaptation rapide.', color: VERT },
  { type: 'École concertée', prix: '130–160 €/mois', detail: 'Frais association + cantina. Parfois bilingue. Encadrement intermédiaire.', color: '#7BA05B' },
  { type: 'Lycée Français de Palma', prix: '320–415 €/mois', detail: 'Barème AEFE 2024-2025. Programme français certifié. Sur Palma uniquement.', color: TERRA },
  { type: 'École internationale', prix: '620–870 €/mois', detail: 'Agora, Bellver International. Programme anglophone ou multilingue. Palma et environs.', color: '#b07d2a' },
]

export default function FamilleInstallation() {
  const navigate = useNavigate()
  useSEO({
    title: "S'installer à Majorque en famille — guide complet",
    description: "Comment s'installer à Majorque avec des enfants : NIE famille, scolarisation, logement, couverture santé. Guide complet et accompagnement dédié aux familles francophones. Cap Majorque 249€.",
    url: "https://vivre-a-majorque.vercel.app/app/famille",
  })

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: VERT, fontSize: 13, fontWeight: 600,
          padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Retour
        </button>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          projet de vie
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          S'installer à Majorque en famille
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          C'est faisable. C'est même l'une des meilleures décisions que vous pouvez prendre pour vos enfants. Mais ça se prépare. Voilà ce que personne ne vous dit.
        </p>
      </div>

      {/* Les 6 étapes */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 16, color: TERRA, marginBottom: 4 }}>dans l'ordre</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: FORET, marginBottom: 16 }}>
          Les 6 étapes clés pour une famille
        </h2>
        {ETAPES.map((e, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, marginBottom: 14,
            background: '#fff', borderRadius: 14,
            border: '1px solid var(--gris)',
            padding: '14px 16px',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(90,173,165,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{e.emoji}</div>
            <div>
              <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 4 }}>{e.titre}</p>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>{e.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scolarité */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 16, color: TERRA, marginBottom: 4 }}>sources : Govern Balear · barème AEFE 2024-2025</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: FORET, marginBottom: 4 }}>
          Quel type d'école pour vos enfants ?
        </h2>
        <div style={{ width: 30, height: 3, background: VERT, borderRadius: 2, marginBottom: 16 }} />
        {SCHOOLS.map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12,
            border: `1.5px solid ${s.color}30`,
            borderLeft: `4px solid ${s.color}`,
            padding: '12px 14px', marginBottom: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET }}>{s.type}</p>
              <span style={{
                fontSize: 12, fontWeight: 700, color: s.color,
                background: `${s.color}15`, padding: '2px 8px', borderRadius: 20,
                fontFamily: 'var(--font-corps)', whiteSpace: 'nowrap',
              }}>{s.prix}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5 }}>{s.detail}</p>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', fontStyle: 'italic', marginTop: 6 }}>
          Ces coûts s'intègrent automatiquement dans le simulateur budget → Outils
        </p>
      </div>

      {/* Budget famille */}
      <div style={{
        background: 'rgba(90,173,165,0.06)',
        border: '1px solid rgba(90,173,165,0.2)',
        borderRadius: 14, padding: '16px',
        marginBottom: 24,
      }}>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 8 }}>
          💶 Budget indicatif — famille 2 adultes + 1 enfant, hors Palma
        </p>
        {[
          ['Loyer (3 pièces standard)', '1 350 €'],
          ['Charges (eau, élec, internet)', '175 €'],
          ['Alimentation (2 adultes)', '640 €'],
          ['Scolarité (école publique)', '65 €'],
          ['Transport (2 véhicules)', '420 €'],
          ['Santé (autónoma + complémentaire)', '230 €'],
          ['Enfant (vie courante, activités)', '165 €'],
          ['Loisirs + divers', '350 €'],
        ].map(([label, val], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--gris)' }}>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: FORET }}>{val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: FORET }}>Total mensuel estimé</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: VERT }}>3 395 €</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 6, fontStyle: 'italic' }}>
          Source INE — Encuesta de Presupuestos Familiares Illes Balears 2023. Estimations basées sur le mode standard hors Palma.
        </p>
      </div>

      {/* CTA Cap Majorque */}
      <div style={{
        background: FORET, borderRadius: 16,
        padding: '20px', marginBottom: 16,
      }}>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 15, color: 'rgba(199,110,78,0.9)', marginBottom: 4 }}>
          recommandé pour les familles
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#F7F2EB', lineHeight: 1.15, marginBottom: 8 }}>
          Cap Majorque — 249 €
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {[
            'Visio 1 — diagnostic complet 60 min',
            'Dossier personnalisé livré sous 72h',
            'Visio 2 — prise de route 45 min',
            'Suivi email 30 jours',
            'Checklist famille + calendrier démarches',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: VERT, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: 'rgba(247,242,235,0.85)', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.open(CAP_STRIPE, '_blank', 'noopener,noreferrer')}
          style={{
            width: '100%', padding: '13px 0',
            background: VERT, color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-corps)',
          }}
        >
          Réserver Cap Majorque →
        </button>
        <p style={{ fontSize: 12, textAlign: 'center', color: 'rgba(247,242,235,0.5)', marginTop: 8 }}>
          ⚡ 3 places disponibles en juin
        </p>
      </div>

      {/* Lien vers simulateur */}
      <button
        onClick={() => navigate('/app/outils/budget')}
        style={{
          width: '100%', padding: '13px 0',
          background: 'transparent', color: FORET,
          border: `1.5px solid ${FORET}`, borderRadius: 10,
          fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-corps)',
          marginBottom: 8,
        }}
      >
        Calculer mon budget famille →
      </button>

      <AccompagnementBanner
        texte="Vous préférez commencer par une visio courte ?"
        cta="Visio Conseil 79 € →"
        style={{ marginTop: 16 }}
      />
    </div>
  )
}
