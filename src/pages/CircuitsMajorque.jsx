import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'

const CIRCUITS = [
  {
    id: 'sud-authentique',
    emoji: '🌿',
    titre: 'Le Sud Authentique',
    soustitre: 'Campos, Ses Salines, Cap Blanc',
    desc: 'Villages blancs, salines millénaires et calanques sauvages du sud — loin des bus touristiques.',
    duree: '1 journée',
    niveau: 'Famille',
    couleur: VERT,
    bg: 'rgba(90,173,165,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: true,
  },
  {
    id: 'tramuntana-secrete',
    emoji: '⛰️',
    titre: 'Tramuntana Secrète',
    soustitre: 'Valldemossa, Deyà, Sóller',
    desc: 'Les villages perchés classés UNESCO sans la foule — les heures exactes pour y être seul.',
    duree: '1 journée',
    niveau: 'Tous niveaux',
    couleur: '#7BA05B',
    bg: 'rgba(123,160,91,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: true,
  },
  {
    id: 'palma-initiee',
    emoji: '🏛️',
    titre: 'Palma comme une Initiée',
    soustitre: 'Palma de Mallorca',
    desc: 'Les patios cachés, les marchés de producteurs, les bars à tapas que les Palmesans gardent pour eux.',
    duree: 'Demi-journée',
    niveau: 'Tous niveaux',
    couleur: TERRA,
    bg: 'rgba(199,110,78,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: true,
  },
  {
    id: 'nord-sauvage',
    emoji: '🚗',
    titre: 'Le Nord Sauvage',
    soustitre: 'Cap Formentor, Pollença, Alcúdia',
    desc: 'Road trip sur la péninsule de Formentor avec les arrêts secrets et les timings parfaits.',
    duree: '1 journée',
    niveau: 'Aventurier',
    couleur: '#2D7BA5',
    bg: 'rgba(45,123,165,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: true,
  },
  {
    id: 'gastronomie-locale',
    emoji: '🍽️',
    titre: 'Route Gastronomique',
    soustitre: 'Marchés, bodegas & restaurants de village',
    desc: 'Les marchés hebdomadaires, les producteurs locaux et les tables qui font manger les Majorquins.',
    duree: 'Flexible',
    niveau: 'Tous niveaux',
    couleur: '#8B4513',
    bg: 'rgba(139,69,19,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: false,
    badge: 'Bientôt',
  },
  {
    id: 'famille-enfants',
    emoji: '👨‍👩‍👧',
    titre: 'Majorque en Famille',
    soustitre: 'Activités & sorties avec enfants',
    desc: 'Les vraies activités pour enfants — sans les pièges à touristes, validées par une maman expat.',
    duree: 'Flexible',
    niveau: 'Famille',
    couleur: '#7B68AA',
    bg: 'rgba(123,104,170,0.08)',
    link: 'https://mallorcacherie.netlify.app',
    available: false,
    badge: 'Bientôt',
  },
]

function CircuitCard({ circuit }) {
  const handleClick = () => {
    if (circuit.available) {
      window.open(circuit.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${circuit.couleur}28`,
        overflow: 'hidden',
        cursor: circuit.available ? 'pointer' : 'default',
        opacity: circuit.available ? 1 : 0.7,
        transition: 'transform 0.15s',
        marginBottom: 12,
      }}
      onMouseEnter={e => { if (circuit.available) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Trait coloré haut */}
      <div style={{ height: 4, background: circuit.couleur }} />

      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icône */}
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: circuit.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            {circuit.emoji}
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 16, color: FORET, fontWeight: 400, lineHeight: 1.2,
              }}>
                {circuit.titre}
              </p>
              {circuit.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  color: circuit.couleur,
                  background: circuit.bg,
                  border: `1px solid ${circuit.couleur}30`,
                  padding: '2px 8px', borderRadius: 20,
                  fontFamily: 'var(--font-corps)',
                }}>
                  {circuit.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: circuit.couleur, fontWeight: 600, marginBottom: 6 }}>
              {circuit.soustitre}
            </p>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.45, marginBottom: 10 }}>
              {circuit.desc}
            </p>

            {/* Pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: circuit.couleur,
                background: circuit.bg,
                padding: '3px 9px', borderRadius: 20,
                fontFamily: 'var(--font-corps)',
              }}>
                ⏱ {circuit.duree}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--texte-sec)',
                background: 'var(--bg)',
                padding: '3px 9px', borderRadius: 20,
                border: '1px solid var(--gris)',
                fontFamily: 'var(--font-corps)',
              }}>
                👥 {circuit.niveau}
              </span>
            </div>
          </div>

          {circuit.available && (
            <span style={{ color: circuit.couleur, fontSize: 18, flexShrink: 0, opacity: 0.8, marginTop: 4 }}>›</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CircuitsMajorque() {
  useSEO({
    title: "Circuits Majorque — Itinéraires pour francophones",
    description: "Circuits personnalisés à Majorque par Adeline de mallorcacherie : le Sud authentique, Tramuntana secrète, Palma comme une initiée. Itinéraires pour résidents et visiteurs francophones.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/circuits",
  })
  const navigate = useNavigate()

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 24 }}>
        <button onClick={() => navigate('/app/explorer/boutiques')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: VERT, fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', marginBottom: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Boutique
        </button>

        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          par Adeline
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Circuits Majorque
        </h1>
        <div style={{ width: 36, height: 3, background: TERRA, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          Des itinéraires personnalisés conçus par Adeline, française installée depuis 8 ans à Majorque. Elle connaît chaque village, chaque cala, chaque heure parfaite.
        </p>
      </div>

      {/* ── Carte Adeline ── */}
      <a
        href="https://mallorcacherie.netlify.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}
      >
        <div style={{
          background: FORET,
          borderRadius: 18, padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(90,173,165,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>
            🌺
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 16, color: '#F7F2EB', marginBottom: 3,
            }}>
              @mallorcacherie
            </p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,235,0.65)', lineHeight: 1.4 }}>
              Voir tous les itinéraires sur son site →
            </p>
          </div>
          <span style={{ color: VERT, fontSize: 20, opacity: 0.8 }}>›</span>
        </div>
      </a>

      {/* ── Circuits disponibles ── */}
      <SectionHead title="Itinéraires" />
      {CIRCUITS.filter(c => c.available).map(c => (
        <CircuitCard key={c.id} circuit={c} />
      ))}

      {/* ── Circuits à venir ── */}
      {CIRCUITS.some(c => !c.available) && (
        <>
          <SectionHead title="Prochainement" style={{ marginTop: 8 }} />
          {CIRCUITS.filter(c => !c.available).map(c => (
            <CircuitCard key={c.id} circuit={c} />
          ))}
        </>
      )}

      {/* ── Note de bas de page ── */}
      <div style={{
        padding: '14px 16px',
        background: 'rgba(90,173,165,0.06)',
        border: '1px solid rgba(90,173,165,0.2)',
        borderRadius: 14, marginTop: 8,
      }}>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          🤝 Ces circuits sont créés par <strong>Adeline (@mallorcacherie)</strong>, notre partenaire locale. Partenariat de confiance — Adeline connaît l'île depuis 8 ans et partage ses adresses en exclusivité avec la communauté Vivre à Majorque.
        </p>
      </div>
    </div>
  )
}
