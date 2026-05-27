import React from 'react'
import { useNavigate } from 'react-router-dom'

const MALLORCA_CHERIE_URL = 'https://mallorcacherie.com'

const SCENARIOS = [
  {
    id: 'avant',
    emoji: '🔭',
    titre: 'Je rêve de m\'installer',
    sous: 'Je veux découvrir l\'île avant de décider',
    desc: 'Avant de vous lancer, rien de mieux que de vivre Majorque de l\'intérieur. Adelina vous compose un itinéraire sur-mesure pour tomber amoureux des bons coins — loin des circuits touristiques.',
    cta: 'Préparer mon voyage découverte',
    bg: 'var(--vert-light)',
    border: 'rgba(90,122,64,0.18)',
    accent: 'var(--foret)',
    tag: 'Avant l\'installation',
    tagBg: '#EBF3E4',
    tagColor: '#2D5016',
  },
  {
    id: 'redecouvrir',
    emoji: '🌿',
    titre: 'Je vis ici',
    sous: 'Je veux redécouvrir l\'île autrement',
    desc: 'On s\'installe, on s\'habitue, et on finit par ne plus explorer. Adelina connaît des adresses que même les résidents ignorent — spas cachés, villages oubliés, restos où seuls les locaux vont.',
    cta: 'Redécouvrir mon île',
    bg: 'var(--ocre-light)',
    border: 'rgba(196,122,90,0.18)',
    accent: '#7a3e22',
    tag: 'Pour les résidents',
    tagBg: '#F5E8E0',
    tagColor: '#7a3e22',
  },
  {
    id: 'famille',
    emoji: '👨‍👩‍👧',
    titre: 'Ma famille débarque',
    sous: 'Je veux leur faire vivre la vraie Majorque',
    desc: 'Vos proches arrivent pour la semaine et vous voulez leur montrer votre île — pas les plages bondées. Adelina conçoit un programme adapté : balades, tables locales, spots confidentiels.',
    cta: 'Créer leur programme sur-mesure',
    bg: 'var(--lin, #F5F0E8)',
    border: 'rgba(110,80,180,0.12)',
    accent: '#3d2070',
    tag: 'Famille & amis',
    tagBg: '#EAE4F5',
    tagColor: '#3d2070',
  },
]

function ScenarioCard({ s }) {
  return (
    <a
      href={MALLORCA_CHERIE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}
    >
      <div style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: 16,
        padding: '20px 18px',
        transition: 'box-shadow 0.15s',
      }}>
        {/* Tag + emoji */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: s.tagBg, color: s.tagColor, letterSpacing: 0.3,
          }}>
            {s.tag}
          </span>
          <span style={{ fontSize: 28 }}>{s.emoji}</span>
        </div>

        {/* Titre */}
        <p style={{
          fontFamily: 'var(--font-titre)',
          fontSize: 18, fontWeight: 700,
          color: 'var(--foret)',
          lineHeight: 1.3, marginBottom: 4,
        }}>
          {s.titre}
        </p>
        <p style={{
          fontSize: 13, color: s.accent,
          fontWeight: 600, marginBottom: 12, lineHeight: 1.4,
        }}>
          {s.sous}
        </p>

        {/* Description */}
        <p style={{
          fontSize: 13, color: '#444',
          lineHeight: 1.65, marginBottom: 16,
        }}>
          {s.desc}
        </p>

        {/* CTA */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 700,
          color: 'var(--foret)',
          borderBottom: '1.5px solid var(--foret)',
          paddingBottom: 2,
        }}>
          {s.cta} →
        </div>
      </div>
    </a>
  )
}

export default function Boutiques() {
  const navigate = useNavigate()

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 500,
        }}>
          ← <span>Explorer</span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Bons plans
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
          Nos coups de cœur pour vivre Majorque autrement
        </p>
      </div>

      {/* Présentation Mallorca Chérie */}
      <div style={{
        background: 'white',
        border: '1.5px solid rgba(90,122,64,0.15)',
        borderRadius: 16,
        padding: '20px 18px',
        marginBottom: 24,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'var(--vert-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          🌺
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-titre)', fontSize: 17,
            fontWeight: 700, color: 'var(--foret)', marginBottom: 4,
          }}>
            Mallorca Chérie
          </p>
          <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
            Adelina, française installée à Majorque depuis 8 ans. Itinéraires personnalisés & adresses locales authentiques.
          </p>
        </div>
      </div>

      {/* Intro */}
      <p style={{
        fontSize: 13, color: 'var(--texte-sec)',
        lineHeight: 1.7, marginBottom: 20,
        paddingLeft: 4,
      }}>
        Vous installez-vous à Majorque, ou y vivez-vous déjà ? Adelina construit des itinéraires sur-mesure selon votre situation.
      </p>

      {/* 3 scénarios */}
      {SCENARIOS.map(s => (
        <ScenarioCard key={s.id} s={s} />
      ))}

      {/* Footer lien direct */}
      <div style={{
        textAlign: 'center',
        marginTop: 8, marginBottom: 8,
        padding: '16px',
        background: 'var(--gris)',
        borderRadius: 12,
      }}>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginBottom: 8 }}>
          Envie de voir toutes les offres ?
        </p>
        <a
          href={MALLORCA_CHERIE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13, fontWeight: 700,
            color: 'var(--foret)', textDecoration: 'underline',
          }}
        >
          Visiter mallorcacherie.com →
        </a>
      </div>
    </div>
  )
}
