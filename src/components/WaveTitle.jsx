// Composant partagé — style carrousel sur toute l'appli
export const TERRA = '#C76E4E'
export const VERT  = '#5AADA5'

export function Wave({ color }) {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 8, marginTop: -3 }}>
      <path d="M0,5 C20,0 40,10 60,5 C80,0 100,10 120,5"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Mot Caveat Bold + vague SVG
export function AccentWord({ children, color, size = 26 }) {
  return (
    <span style={{ display: 'inline-block' }}>
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700, fontSize: size,
        color, lineHeight: 1, display: 'block',
      }}>
        {children}
      </span>
      <Wave color={color} />
    </span>
  )
}

// Titre de page complet : label Cormorant italic + mot Caveat+wave
export function PageHeading({ label, accent, color = TERRA, labelSize = 15, accentSize = 34 }) {
  return (
    <div>
      {label && (
        <span style={{
          display: 'block',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: labelSize, color: 'var(--texte-sec)',
          lineHeight: 1.3, marginBottom: 2,
        }}>
          {label}
        </span>
      )}
      <AccentWord color={color} size={accentSize}>{accent}</AccentWord>
    </div>
  )
}

// Section title inline (labels de section plus petits)
export function SectionAccent({ children, color, size = 20 }) {
  return <AccentWord color={color} size={size}>{children}</AccentWord>
}
