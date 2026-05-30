// Style "slide Instagram" — Playfair 900 + Caveat italic + trait court
export const TERRA = '#C76E4E'
export const VERT  = '#5AADA5'

// Trait horizontal court à la place de la vague
export function Trait({ color, width = 36 }) {
  return (
    <div style={{
      width, height: 3,
      background: color,
      borderRadius: 2,
      marginTop: 6,
    }} />
  )
}

// Mot Caveat italic (l'accent "manuscrit")
export function AccentWord({ children, color = TERRA, size = 26 }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'var(--font-accent)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: size,
      color,
      lineHeight: 1.25,
    }}>
      {children}
    </span>
  )
}

// Titre Playfair 900 — grand et fort
export function DisplayTitle({ children, size = 32 }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size,
      color: '#1C1410',
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    }}>
      {children}
    </span>
  )
}

// Label Cormorant italic teal — contexte au-dessus
export function ContextLabel({ children, color = VERT, size = 14 }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'var(--font-titre)',
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: size,
      color,
      letterSpacing: '0.01em',
      marginBottom: 4,
    }}>
      {children}
    </span>
  )
}

// Bloc titre de page complet : label teal + Playfair 900 + AccentWord + trait
export function PageHeading({ label, title, accent, accentColor = TERRA, traitColor, size = 32 }) {
  const tc = traitColor || accentColor
  return (
    <div>
      {label && <ContextLabel>{label}</ContextLabel>}
      {title && <DisplayTitle size={size}>{title}</DisplayTitle>}
      {accent && (
        <AccentWord color={accentColor} size={size * 0.85}>{accent}</AccentWord>
      )}
      <Trait color={tc} />
    </div>
  )
}

// Section accent (plus petit, dans les cards)
export function SectionAccent({ children, color = TERRA, size = 20 }) {
  return (
    <div>
      <AccentWord color={color} size={size}>{children}</AccentWord>
      <Trait color={color} width={28} />
    </div>
  )
}

// Wave gardée pour compatibilité (remplacée par Trait)
export function Wave({ color }) {
  return <Trait color={color} width={32} />
}

/* ══════════════════════════════════════════════
   SectionHead — titre de section uniforme
   Utilisé sur TOUTES les pages de l'app.
   Playfair Display italic 20px foret + CTA optionnel.
══════════════════════════════════════════════ */
import { useNavigate } from 'react-router-dom'

export function SectionHead({ title, cta, ctaTo, onCta, style = {} }) {
  let navigate
  try { navigate = useNavigate() } catch (_) { navigate = null }

  const handleCta = () => {
    if (onCta) { onCta(); return }
    if (ctaTo && navigate) navigate(ctaTo)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 12,
      ...style,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 20,
        color: 'var(--foret, #0F3D35)',
        lineHeight: 1,
      }}>
        {title}
      </span>
      {cta && (
        <button
          onClick={handleCta}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--vert, #5AADA5)',
            fontFamily: 'var(--font-corps)',
            letterSpacing: '0.02em',
            padding: 0,
          }}
        >
          {cta}
        </button>
      )}
    </div>
  )
}
