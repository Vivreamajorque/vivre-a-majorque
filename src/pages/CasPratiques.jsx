import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TERRA = '#C76E4E'
const VERT  = '#5AADA5'
const FORET = '#0F3D35'
const CREME = '#F7F2EB'

const VISIO_LINK = 'https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W'

const CAS = [
  {
    id: 'famille',
    emoji: '👨‍👩‍👧‍👦',
    prenom: 'Sophie & Marc',
    age: '38 et 41 ans',
    ville: 'Lyon',
    tag: 'Famille avec enfants',
    couleur: TERRA,
    situation: 'Deux enfants (6 et 9 ans), Sophie enseignante, Marc graphiste freelance. Projet de départ dans 8 mois. Principale inquiétude : l\'école des enfants et la couverture santé.',
    problemes: [
      'Aucune idée du système scolaire espagnol — public en mallorquin ou lycée français ?',
      'Marc en micro-entreprise française, ne savait pas s\'il pouvait continuer depuis l\'Espagne',
      'Questions sur la Sécurité sociale espagnole et la carte SIP',
      'Budget flou — loyers, charges, vie quotidienne avec deux enfants',
    ],
    resolu: [
      'Choix éclairé : école publique espagnole pour les enfants (adaptation 3-4 mois, trilingues à terme)',
      'Marc : fermeture micro-entreprise → passage en autónomo espagnol, continuité d\'activité garantie',
      'Dossiers empadronamiento + carte SIP préparés avant l\'arrivée',
      'Budget réel calculé : 2 800€/mois pour 4 personnes dans le secteur de Campos',
    ],
    maintenant: 'Sophie et Marc sont arrivés en septembre. Les enfants sont à l\'école de Santanyí. Marc a ses premiers clients locaux. Ils ont trouvé une maison de village à 950€/mois.',
  },
  {
    id: 'entrepreneur',
    emoji: '🏢',
    prenom: 'Thomas',
    age: '34 ans',
    ville: 'Paris',
    tag: 'Entrepreneur / freelance',
    couleur: VERT,
    situation: 'Développeur web indépendant, clients 100% français, voulait s\'installer à Majorque pour le cadre de vie. Inquiet de perdre ses clients et de la complexité fiscale.',
    problemes: [
      'Croyait devoir fermer sa micro-entreprise française avant de partir',
      'Ne comprenait pas la différence entre autónomo et SL',
      'Avait peur de la double imposition France-Espagne',
      'Pas de NIE, ne savait pas par où commencer administrativement',
    ],
    resolu: [
      'Fermeture micro-entreprise → ouverture autónomo espagnol : séquence exacte et délais',
      'Choix autónomo validé (SL inutile sous 80K€/an de CA)',
      'Convention franco-espagnole expliquée : 0 double imposition si bien déclarée',
      'NIE obtenu au consulat de Lyon avant le départ — 3 semaines de délai',
    ],
    maintenant: 'Thomas est installé à Palma depuis 6 mois, autónomo depuis le 1er jour. Tarifa plana active (80€/mois SS). Tous ses clients français ont suivi. Il a trouvé deux clients locaux en prime.',
  },
  {
    id: 'teletravail',
    emoji: '💻',
    prenom: 'Camille',
    age: '31 ans',
    ville: 'Bordeaux',
    tag: 'Télétravailleurs salariés',
    couleur: TERRA,
    situation: 'Chargée de projet marketing dans une entreprise française, contrat CDI, accord télétravail obtenu. Son employeur lui a dit qu\'elle pouvait travailler depuis l\'Espagne — sans lui préciser les conditions légales.',
    problemes: [
      'Son employeur ne savait pas qu\'après 183 jours elle devait être déclarée en Espagne',
      'Risque de double cotisation SS si rien n\'est fait',
      'Questions sur le formulaire A1 (maintien au régime SS français)',
      'Couverture santé : carte vitale toujours valable ou pas ?',
    ],
    resolu: [
      'Formulaire A1 demandé à la CPAM avant le départ → maintien au régime SS français 2 ans',
      'Employeur informé : convention collective + avenant au contrat rédigé',
      'Résidence fiscale espagnole : timing exact calculé pour éviter les mauvaises surprises',
      'Carte européenne d\'assurance maladie activée comme couverture de transition',
    ],
    maintenant: 'Camille est à Majorque depuis 4 mois, toujours salariée française avec A1 valide. Elle a loué un appartement à Palma. Situation fiscale claire jusqu\'en 2026.',
  },
  {
    id: 'retraite',
    emoji: '🌅',
    prenom: 'Bernard & Françoise',
    age: '63 et 61 ans',
    ville: 'Nantes',
    tag: 'Retraités',
    couleur: VERT,
    situation: 'Bernard vient de prendre sa retraite (ancienne fonction publique), Françoise retraitée depuis 2 ans. Projet de vie à Majorque à l\'année. Grande question : leur pension sera-t-elle imposée en France ou en Espagne ?',
    problemes: [
      'Pension de la fonction publique de Bernard : règle spécifique méconnue',
      'Pension CNAV de Françoise : imposable en Espagne ou en France ?',
      'Modèle 720 : quels biens déclarer, quels risques si oubli ?',
      'Assurance maladie : que deviennent leurs droits CPAM une fois résidents ?',
    ],
    resolu: [
      'Bernard (fonctionnaire) : pension imposable en France — convention art. 18.2. Aucune surprise',
      'Françoise (privé) : pension imposable en Espagne. Déclaration IRPF préparée',
      'Modelo 720 : maison en France + assurance-vie déclarées, seuils vérifiés',
      'Inscription SS espagnole → carte SIP obtenue, mutuelle complémentaire Sanitas souscrite',
    ],
    maintenant: 'Bernard et Françoise sont à Majorque depuis 14 mois. Ils ont acheté un appartement à Alcúdia. Situation fiscale claire, aucune double imposition. Ils profitent de l\'île à l\'année.',
  },
  {
    id: 'couple',
    emoji: '💑',
    prenom: 'Julie & Romain',
    age: '29 et 32 ans',
    ville: 'Lille',
    tag: 'Couple sans enfants',
    couleur: TERRA,
    situation: 'Julie graphiste freelance, Romain en reconversion professionnelle. Projet impulsif — décidé en mars, départ prévu en juin. Tout à faire en 3 mois.',
    problemes: [
      'NIE pour les deux à obtenir en urgence',
      'Romain en formation → pas de revenus pendant 6 mois, quel statut ?',
      'Budget très serré : 2 200€/mois à deux, réaliste ?',
      'Trouver un logement à distance en 3 semaines',
    ],
    resolu: [
      'NIE de Julie au consulat de Lille (3 semaines). NIE de Romain : demande directe à Palma à l\'arrivée',
      'Romain : inscription autónomo différée, couverture via Julie le temps de la reconversion',
      'Budget validé : possible dans le Raiguer ou le sud de l\'île — pas à Palma',
      'Logement trouvé via Idealista + visite vidéo : T2 à Manacor, 780€/mois',
    ],
    maintenant: 'Julie et Romain sont à Majorque depuis 7 mois. Julie a deux clients locaux en plus de ses clients français. Romain a lancé son activité de coaching sportif. Ils sont dans les clous administrativement.',
  },
]

function CasCard({ cas }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      border: `1px solid ${cas.couleur}20`,
      boxShadow: '0 2px 16px rgba(28,20,16,0.07)',
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ background: cas.couleur, padding: '18px 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>{cas.emoji}</span>
          <div>
            <p style={{ fontFamily: 'var(--font-corps)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: 3 }}>
              {cas.tag.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: '#fff', lineHeight: 1.2 }}>
              {cas.prenom}
            </p>
            <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              {cas.age} · {cas.ville}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px' }}>
        {/* Situation */}
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic', borderLeft: `3px solid ${cas.couleur}40`, paddingLeft: 12 }}>
          {cas.situation}
        </p>

        {/* Problèmes */}
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 15, color: 'var(--texte)', marginBottom: 10 }}>
          Les questions de départ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {cas.problemes.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#C74E4E', fontSize: 14, flexShrink: 0, marginTop: 1 }}>?</span>
              <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'var(--texte)', lineHeight: 1.5 }}>{p}</p>
            </div>
          ))}
        </div>

        {/* Résolu */}
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 15, color: 'var(--texte)', marginBottom: 10 }}>
          Ce qu'on a résolu ensemble
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {cas.resolu.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: VERT, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'var(--texte)', lineHeight: 1.5 }}>{r}</p>
            </div>
          ))}
        </div>

        {/* Maintenant */}
        <div style={{ background: `${cas.couleur}10`, borderRadius: 12, padding: '12px 14px', marginBottom: 18, border: `1px solid ${cas.couleur}20` }}>
          <p style={{ fontFamily: 'var(--font-corps)', fontSize: 11, fontWeight: 700, color: cas.couleur, letterSpacing: '0.06em', marginBottom: 5 }}>
            AUJOURD'HUI
          </p>
          <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'var(--texte)', lineHeight: 1.55 }}>
            {cas.maintenant}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CasPratiques() {
  useEffect(() => {
    document.title = 'Cas pratiques — Vivre à Majorque'
  }, [])

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ paddingTop: 28, marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 14, color: VERT, marginBottom: 6 }}>
          situations réelles
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--texte)', lineHeight: 1.2, marginBottom: 8 }}>
          Cas pratiques
        </h1>
        <div style={{ width: 40, height: 3, background: TERRA, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.65 }}>
          Cinq profils, cinq situations différentes. Des questions que vous vous posez peut-être, des réponses concrètes. Ces cas sont fictifs mais construits à partir des vraies questions reçues chaque semaine.
        </p>
      </div>

      {/* CTA visio */}
      <a
        href={VISIO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: FORET,
          borderRadius: 16,
          padding: '16px 20px',
          textDecoration: 'none',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(90,173,165,0.12)', pointerEvents: 'none' }} />
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 11, fontWeight: 700, color: VERT, letterSpacing: '0.07em', marginBottom: 5 }}>
          VOTRE SITUATION · 79€ · 45 MIN
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: '#F7F2EB', lineHeight: 1.2, marginBottom: 6 }}>
          Vous vous reconnaissez dans un de ces cas ?
        </p>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'rgba(247,242,235,0.7)', lineHeight: 1.5, marginBottom: 12 }}>
          Réservez une visio conseil — on analyse votre situation spécifique et vous repartez avec un plan d'action clair.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: TERRA, borderRadius: 30, padding: '8px 18px' }}>
          <span style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 13, color: '#fff' }}>
            Réserver ma visio →
          </span>
        </div>
      </a>

      {/* Les cas */}
      {CAS.map(cas => (
        <CasCard key={cas.id} cas={cas} />
      ))}

      {/* CTA bas de page */}
      <a
        href={VISIO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: TERRA,
          borderRadius: 16,
          padding: '18px 20px',
          textDecoration: 'none',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
          Ma situation ressemble à ça
        </p>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
          Visio conseil 79€ · 45 min · lien de paiement sécurisé Stripe
        </p>
      </a>
    </div>
  )
}
