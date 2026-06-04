import React, { useState } from 'react'

const FORET = '#0F3D35'
const VERT  = '#5AADA5'
const TERRA = '#C76E4E'

/*
 * Temoignages — section preuve sociale
 * Alimentée statiquement ici pour commencer.
 * À mesure que tu as des clients → ajoute leur témoignage dans TEMOIGNAGES.
 *
 * Format : { prenom, situation, texte, offre, avatar (initiale) }
 */
const TEMOIGNAGES = [
  {
    prenom: 'Hervé',
    situation: 'Projet d\'installation à Majorque, 3 ans de réflexion',
    texte: 'Amely m\'a permis de déterminer que mon projet était viable, mais nécessitait des ajustements importants. Grâce à cette analyse hyper précise, chiffrée et sourcée, j\'ai pris conscience très rapidement de la direction à prendre. Ça fait trois ans qu\'on réfléchit à ce projet — maintenant on est prêts à sauter le pas. Et pouvoir la rencontrer directement sur l\'île, c\'est une vraie sécurité : avec elle, il n\'y a pas de problèmes, il n\'y a que des solutions.',
    offre: 'Audit Éclaireur',
    avatar: 'H',
    couleur: TERRA,
  },
  {
    prenom: 'Stéphane & Amélie',
    situation: 'Entrepreneurs, installés depuis 3 mois',
    texte: 'L\'Audit Éclaireur nous a évité de nombreuses erreurs sur notre statut. Amely a analysé notre situation en détail et on a eu des réponses concrètes en 5 jours. Indispensable avant de se lancer.',
    offre: 'Audit Éclaireur',
    avatar: 'SA',
    couleur: VERT,
  },
]

function TemoignageCard({ t }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid #E0D9CF',
      padding: '18px',
      position: 'relative',
    }}>
      {/* Guillemet décoratif */}
      <span style={{
        position: 'absolute', top: 14, right: 16,
        fontFamily: 'Georgia, serif', fontSize: 48,
        color: `${t.couleur}18`, lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        "
      </span>

      <p style={{
        fontSize: 14, color: 'var(--texte)',
        lineHeight: 1.65, marginBottom: 16,
        fontFamily: 'var(--font-titre)', fontStyle: 'italic',
      }}>
        "{t.texte}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar initiales */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `${t.couleur}18`,
          border: `1.5px solid ${t.couleur}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 13, color: t.couleur, flexShrink: 0,
        }}>
          {t.avatar}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 1 }}>
            {t.prenom}
          </p>
          <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
            {t.situation}
          </p>
        </div>
        {t.offre && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 12, fontWeight: 800,
            color: t.couleur,
            background: `${t.couleur}12`,
            border: `1px solid ${t.couleur}25`,
            padding: '3px 8px', borderRadius: 20,
            fontFamily: 'var(--font-corps)',
            flexShrink: 0,
          }}>
            {t.offre}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Temoignages({ style = {} }) {
  if (!TEMOIGNAGES.length) return null

  return (
    <div style={{ ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TEMOIGNAGES.map((t, i) => (
          <TemoignageCard key={i} t={t} />
        ))}
      </div>
      <p style={{
        fontSize: 13, color: 'var(--texte-sec)',
        textAlign: 'center', marginTop: 10,
        fontStyle: 'italic',
      }}>
        Francophones installés à Majorque ou en chemin — ils nous font confiance 🌿
      </p>
    </div>
  )
}
