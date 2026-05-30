import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

const FORET = '#0F3D35'
const GOLD  = '#b07d2a'

/* ═══════════════════════════════════════════════════════
   DONNÉES — Sources : AEAT, BOE, Seguridad Social 2025
═══════════════════════════════════════════════════════ */

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// ── PARTICULIERS (Persona Física — résidents fiscaux) ──
const PARTICULIERS = [
  {
    periode: 'Avril – Juin',
    mois: [3, 4, 5],
    echeances: [
      {
        date: '2 avril – 30 juin 2025',
        nom: 'Declaración de la Renta (IRPF)',
        modelo: null,
        desc: 'Déclaration annuelle des revenus. Obligatoire si revenus > 22 000 € (un seul payeur) ou > 15 000 € (plusieurs payeurs). Inclut tous les revenus mondiaux pour les résidents fiscaux.',
        source: 'Art. 96 Ley 35/2006 LIRPF',
        urgent: true,
        couleur: TERRA,
      },
      {
        date: '25 juin 2025 (si résultat à payer, domiciliation)',
        nom: 'Paiement IRPF fractionné',
        modelo: null,
        desc: 'Option de payer en 2 fois : 60% à la déclaration, 40% au 5 novembre. À demander lors de la déclaration.',
        source: 'Art. 97 LIRPF',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Mars',
    mois: [2],
    echeances: [
      {
        date: '31 mars',
        nom: 'Modelo 720 — Biens à l\'étranger',
        modelo: '720',
        desc: 'Déclaration obligatoire des comptes bancaires, immobilier et valeurs détenus hors d\'Espagne si la valeur totale dépasse 50 000 € par catégorie. Sanction : minimum 10 000 € par omission.',
        source: 'Ley 7/2012, DA 18e LIRPF',
        urgent: true,
        couleur: '#C74E4E',
      },
    ],
  },
  {
    periode: 'Tout au long de l\'année',
    mois: [0,1,2,3,4,5,6,7,8,9,10,11],
    echeances: [
      {
        date: 'Dans les 30 jours après acquisition',
        nom: 'Modelo 030 — Changement d\'adresse',
        modelo: '030',
        desc: 'À déposer lors de tout changement d\'adresse fiscale. Gratuit, déposable en ligne via Cl@ve.',
        source: 'Art. 48 Reglamento General de aplicación',
        urgent: false,
        couleur: VERT,
      },
      {
        date: 'Variable selon revenus immobiliers',
        nom: 'Impôt sur revenus locatifs (IRNR ou IRPF)',
        modelo: '210',
        desc: 'Si vous louez un bien : revenus à déclarer. Résidents : dans l\'IRPF annuel. Non-résidents : Modelo 210 trimestriel.',
        source: 'Art. 21-24 LIRPF / Ley 5/2004 LIRNR',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Achat immobilier',
    mois: [],
    echeances: [
      {
        date: 'Dans les 30 jours après achat',
        nom: 'ITP — Impôt Transferts Patrimoniaux',
        modelo: '600',
        desc: 'Taxe à l\'achat d\'un bien immobilier de seconde main aux Baléares : 8% jusqu\'à 400 000 €, 9% de 400 000 à 600 000 €, 10% au-delà. Neuf : IVA 10% + AJD 1,2%.',
        source: 'Ley 29/1987, DL 1/2014 Illes Balears',
        urgent: false,
        couleur: '#2D7BA5',
      },
      {
        date: 'Dans les 30 jours après achat',
        nom: 'Plusvalía Municipal',
        modelo: null,
        desc: 'Taxe municipale sur la plus-value du terrain. Payée par le vendeur en principe, mais peut être négociée à l\'achat. Calculée par la mairie selon le cadastre.',
        source: 'Art. 104-110 Ley Haciendas Locales',
        urgent: false,
        couleur: '#7BA05B',
      },
    ],
  },
]

// ── AUTÓNOMOS (Travailleurs indépendants) ──
const AUTONOMOS = [
  {
    periode: 'Chaque trimestre',
    mois: [0, 3, 6, 9],
    echeances: [
      {
        date: '1-20 janvier · 1-20 avril · 1-20 juillet · 1-20 octobre',
        nom: 'Déclaration IVA trimestrielle',
        modelo: '303',
        desc: 'IVA collectée auprès de vos clients moins IVA déductible sur vos achats professionnels. Si solde positif : paiement. Si négatif : report au trimestre suivant (remboursement uniquement en fin d\'année sur Modelo 390).',
        source: 'Art. 167 Ley 37/1992 LIVA',
        urgent: true,
        couleur: TERRA,
      },
      {
        date: '1-20 janvier · 1-20 avril · 1-20 juillet · 1-20 octobre',
        nom: 'Acompte IRPF trimestriel',
        modelo: '130',
        desc: 'Acompte sur votre impôt annuel. Calcul : 20% du bénéfice net du trimestre (CA − charges déductibles) moins les acomptes déjà versés. Si bénéfice négatif : néant à payer.',
        source: 'Art. 109-111 Reglamento IRPF',
        urgent: true,
        couleur: TERRA,
      },
    ],
  },
  {
    periode: 'Chaque mois',
    mois: [0,1,2,3,4,5,6,7,8,9,10,11],
    echeances: [
      {
        date: 'Dernier jour ouvré du mois',
        nom: 'Cotisation SS — RETA',
        modelo: null,
        desc: 'Cotisation mensuelle à la Sécuridad Social. Calculée sur vos revenus nets réels prévisionnels selon 15 tranches (80€ à 590€/mois). Régularisation annuelle en juin N+1. Tarifa Plana : 80€/mois les 12 premiers mois.',
        source: 'RD-ley 13/2022 art. 308-310 LGSS',
        urgent: true,
        couleur: '#C74E4E',
      },
    ],
  },
  {
    periode: 'Janvier',
    mois: [0],
    echeances: [
      {
        date: '30 janvier',
        nom: 'Récapitulatif annuel IVA',
        modelo: '390',
        desc: 'Résumé annuel de toutes les opérations IVA. Informatif — pas de paiement. Demande de remboursement si solde annuel négatif.',
        source: 'Art. 71.4 Reglamento IVA',
        urgent: false,
        couleur: GOLD,
      },
      {
        date: '31 janvier',
        nom: 'Récapitulatif retenues/revenus',
        modelo: '190',
        desc: 'Si vous avez des employés ou avez versé des honoraires avec retenue IRPF : résumé annuel des retenues opérées.',
        source: 'Art. 108 Reglamento IRPF',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Février',
    mois: [1],
    echeances: [
      {
        date: '28 février',
        nom: 'Opérations avec tiers > 3 000 €',
        modelo: '347',
        desc: 'Déclaration annuelle des clients et fournisseurs avec qui vous avez réalisé plus de 3 000 € de transactions sur l\'année. Obligatoire si vous êtes en régime général IVA.',
        source: 'Art. 31 Reglamento General de aplicación',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Mars',
    mois: [2],
    echeances: [
      {
        date: '31 mars',
        nom: 'Opérations intracomm. (UE)',
        modelo: '349',
        desc: 'Si vous facturez des clients professionnels dans l\'UE (inversion sujet passif) : déclaration mensuelle ou trimestrielle selon volume. Obligatoire à chaque facture B2B UE.',
        source: 'Art. 79 Reglamento IVA',
        urgent: false,
        couleur: VERT,
      },
    ],
  },
  {
    periode: 'Juin',
    mois: [5],
    echeances: [
      {
        date: 'Juin N+1',
        nom: 'Régularisation RETA annuelle',
        modelo: null,
        desc: 'La SS compare vos cotisations provisionnelles à votre revenu réel définitif. Si vous avez sous-déclaré : complément à payer. Si vous avez sur-déclaré : remboursement. Soyez prêt à un ajustement.',
        source: 'RD-ley 13/2022 art. 308 §4 LGSS',
        urgent: false,
        couleur: '#7BA05B',
      },
    ],
  },
  {
    periode: 'Toute l\'année — à retenir',
    mois: [],
    echeances: [
      {
        date: 'À conserver 4 ans minimum',
        nom: 'Conservation des justificatifs',
        modelo: null,
        desc: 'Toutes les factures émises et reçues, livres de comptabilité, relevés bancaires pro. Délai de prescription : 4 ans (AEAT peut contrôler jusqu\'à 4 ans en arrière).',
        source: 'Art. 66 Ley 58/2003 LGT',
        urgent: false,
        couleur: VERT,
      },
      {
        date: 'En cas de contrôle',
        nom: 'Livres comptables obligatoires',
        modelo: null,
        desc: 'Libro de ingresos y gastos (autónomo en estimación directa). Tenu par voie électronique via SII ou manuellement. Peut être demandé lors d\'un contrôle AEAT.',
        source: 'Art. 68 Reglamento IRPF',
        urgent: false,
        couleur: VERT,
      },
    ],
  },
]

// ── SOCIÉTÉS (Sociedad Limitada — SL) ──
const SOCIETES = [
  {
    periode: 'Chaque mois (si CA > 6M€) ou trimestre',
    mois: [0, 3, 6, 9],
    echeances: [
      {
        date: '1-20 du mois suivant la période',
        nom: 'IVA mensuelle ou trimestrielle',
        modelo: '303',
        desc: 'Même principe qu\'autónomo mais généralement mensuelle si CA > 6 M€ (REDEME) ou trimestrielle sinon. Récapitulatif annuel Modelo 390 en janvier.',
        source: 'Art. 167 LIVA — art. 30 Reglamento IVA',
        urgent: true,
        couleur: TERRA,
      },
    ],
  },
  {
    periode: 'Avril, octobre, décembre',
    mois: [3, 9, 11],
    echeances: [
      {
        date: '1-20 avril · 1-20 octobre · 1-20 décembre',
        nom: 'Acompte Impôt sur Sociétés (IS)',
        modelo: '202',
        desc: 'Paiements fractionnés de l\'IS. 3 versements : 18% du montant IS N-1 à chaque échéance (méthode art. 40.2). Alternative : 17% du résultat du trimestre (sur option). À partir de 6 M€ de CA : méthode obligatoire.',
        source: 'Art. 40 Ley 27/2014 LIS',
        urgent: true,
        couleur: TERRA,
      },
    ],
  },
  {
    periode: 'Juillet (clôture 31/12)',
    mois: [6],
    echeances: [
      {
        date: '1-25 juillet',
        nom: 'Déclaration Impôt sur Sociétés',
        modelo: '200',
        desc: 'Déclaration annuelle de l\'IS. Taux général 25% (23% si CA < 1M€). Nouveau taux 2023 : 15% les 2 premières années pour nouvelles entreprises. Déductibilité : salaires, amortissements, frais financiers.',
        source: 'Art. 124 LIS — Ley 27/2014',
        urgent: true,
        couleur: TERRA,
      },
    ],
  },
  {
    periode: 'Janvier',
    mois: [0],
    echeances: [
      {
        date: '30 janvier',
        nom: 'Récapitulatif retenues salariés',
        modelo: '190',
        desc: 'Résumé annuel des retenues IRPF opérées sur les salaires. Obligatoire si la société a des employés (y compris le gérant salarié).',
        source: 'Art. 108 Reglamento IRPF',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Février',
    mois: [1],
    echeances: [
      {
        date: '28 février',
        nom: 'Opérations avec tiers > 3 000 €',
        modelo: '347',
        desc: 'Déclaration annuelle des transactions > 3 000 € avec chaque client/fournisseur.',
        source: 'Art. 31 Reglamento General',
        urgent: false,
        couleur: GOLD,
      },
    ],
  },
  {
    periode: 'Tout au long de l\'année',
    mois: [0,1,2,3,4,5,6,7,8,9,10,11],
    echeances: [
      {
        date: 'Mensuel',
        nom: 'Retenues IRPF salariés (Modelo 111)',
        modelo: '111',
        desc: 'Si la société a des salariés ou paye des honoraires avec retenue : déclaration mensuelle (ou trimestrielle si < 6M€ CA) des retenues IRPF opérées.',
        source: 'Art. 106-107 Reglamento IRPF',
        urgent: false,
        couleur: '#7BA05B',
      },
      {
        date: 'Dans les 6 mois après clôture',
        nom: 'Comptes annuels — dépôt au Registro Mercantil',
        modelo: null,
        desc: 'Bilan, compte de résultat, mémoire. Dépôt obligatoire au Registro Mercantil dans les 7 mois après clôture (approbation en assemblée dans les 6 mois). Sanction : fermeture du registre + amende.',
        source: 'Art. 282 LSC — Ley de Sociedades de Capital',
        urgent: true,
        couleur: '#2D7BA5',
      },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
   COMPOSANTS
═══════════════════════════════════════════════════════ */

function EcheanceCard({ e, moisActuel }) {
  const isCurrentMonth = e.mois && e.mois.includes(moisActuel)
  return (
    <div style={{
      background: isCurrentMonth ? `${e.couleur}06` : '#fff',
      borderRadius: 14,
      border: `1.5px solid ${isCurrentMonth ? e.couleur + '40' : '#E0D9CF'}`,
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      {/* Trait coloré + date */}
      <div style={{
        borderLeft: `4px solid ${e.couleur}`,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 15, color: FORET, fontWeight: 400, lineHeight: 1.2,
              }}>
                {e.nom}
              </p>
              {e.urgent && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  color: e.couleur, background: `${e.couleur}15`,
                  border: `1px solid ${e.couleur}30`,
                  padding: '2px 7px', borderRadius: 20,
                  fontFamily: 'var(--font-corps)', flexShrink: 0,
                  letterSpacing: '0.04em',
                }}>
                  OBLIGATOIRE
                </span>
              )}
              {e.modelo && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  color: '#fff', background: FORET,
                  padding: '2px 8px', borderRadius: 20,
                  fontFamily: 'var(--font-corps)', flexShrink: 0,
                }}>
                  M.{e.modelo}
                </span>
              )}
            </div>
            <p style={{
              fontSize: 11, fontWeight: 600,
              color: e.couleur, fontFamily: 'var(--font-corps)',
              marginBottom: 6,
            }}>
              📅 {e.date}
            </p>
          </div>
          {isCurrentMonth && (
            <span style={{
              fontSize: 10, fontWeight: 800,
              color: e.couleur, background: `${e.couleur}15`,
              border: `1px solid ${e.couleur}40`,
              padding: '3px 8px', borderRadius: 20,
              fontFamily: 'var(--font-corps)', flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              Ce mois
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          {e.desc}
        </p>
        {e.source && (
          <p style={{ fontSize: 10, color: 'var(--texte-sec)', marginTop: 6, fontStyle: 'italic', opacity: 0.7 }}>
            Source : {e.source}
          </p>
        )}
      </div>
    </div>
  )
}

function ProfilSection({ data, moisActuel }) {
  return (
    <div>
      {data.map((bloc, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E0D9CF' }} />
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 15, color: 'var(--texte-sec)', fontWeight: 400,
              whiteSpace: 'nowrap', padding: '0 10px',
            }}>
              {bloc.periode}
            </p>
            <div style={{ flex: 1, height: 1, background: '#E0D9CF' }} />
          </div>
          {bloc.echeances.map((e, j) => (
            <EcheanceCard key={j} e={{ ...e, mois: bloc.mois }} moisActuel={moisActuel} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Vue frise annuelle ─────────────────────── */
function FriseAnnuelle({ data, moisActuel, couleur }) {
  // Extraire tous les mois actifs
  const moisActifs = new Set()
  data.forEach(bloc => bloc.mois.forEach(m => moisActifs.add(m)))

  return (
    <div style={{
      display: 'flex', gap: 4, flexWrap: 'wrap',
      marginBottom: 20,
    }}>
      {MOIS.map((m, i) => {
        const actif = moisActifs.has(i)
        const courant = i === moisActuel
        return (
          <div key={i} style={{
            width: 'calc((100% - 44px) / 12)',
            minWidth: 22,
            height: courant ? 32 : 24,
            borderRadius: 5,
            background: courant ? couleur : actif ? `${couleur}30` : '#E8E2D9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}>
            <span style={{
              fontSize: 8, fontWeight: courant ? 800 : actif ? 600 : 400,
              color: courant ? '#fff' : actif ? couleur : 'var(--texte-sec)',
              fontFamily: 'var(--font-corps)',
            }}>
              {m}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════ */

const PROFILS_CONFIG = [
  {
    id: 'particulier',
    emoji: '👤',
    label: 'Particuliers',
    sublabel: 'Résidents fiscaux en Espagne',
    couleur: '#2D7BA5',
    bg: 'rgba(45,123,165,0.08)',
    data: PARTICULIERS,
  },
  {
    id: 'autonomo',
    emoji: '💼',
    label: 'Autónomos',
    sublabel: 'Travailleurs indépendants',
    couleur: TERRA,
    bg: 'rgba(199,110,78,0.08)',
    data: AUTONOMOS,
  },
  {
    id: 'societe',
    emoji: '🏢',
    label: 'Sociétés (SL)',
    sublabel: 'Sociedad Limitada',
    couleur: FORET,
    bg: 'rgba(15,61,53,0.08)',
    data: SOCIETES,
  },
]

export default function CalendrierFiscal() {
  const navigate = useNavigate()
  const moisActuel = new Date().getMonth()
  const [profil, setProfil] = useState('autonomo')

  useSEO({
    title: 'Calendrier fiscal Espagne 2025 — Particuliers, Autónomos, Sociétés',
    description: 'Toutes les échéances fiscales espagnoles 2025 : IRPF, IVA, RETA, IS. Classées par profil : particuliers résidents, travailleurs indépendants autónomos, sociétés SL. Sources AEAT et BOE.',
    url: 'https://vivre-a-majorque.vercel.app/app/outils/fiscal',
  })

  const currentProfil = PROFILS_CONFIG.find(p => p.id === profil)

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 16 }}>
        <button onClick={() => navigate('/app/explorer/outils')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: VERT, fontSize: 13, fontWeight: 600,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', marginBottom: 20,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Outils
        </button>

        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          Espagne 2025
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Calendrier fiscal
        </h1>
        <div style={{ width: 36, height: 3, background: GOLD, borderRadius: 2, marginBottom: 10 }} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 4 }}>
          Toutes les échéances fiscales espagnoles classées par profil. Sources : AEAT, BOE, LGSS — barèmes 2025.
        </p>
      </div>

      {/* ── Sélecteur de profil ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {PROFILS_CONFIG.map(p => (
          <button
            key={p.id}
            onClick={() => setProfil(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: profil === p.id ? p.couleur : '#fff',
              border: `1.5px solid ${profil === p.id ? p.couleur : '#D4CCC2'}`,
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
          >
            <span style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: profil === p.id ? 'rgba(255,255,255,0.15)' : p.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {p.emoji}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 17, fontWeight: 400,
                color: profil === p.id ? '#fff' : FORET,
                lineHeight: 1.1, marginBottom: 2,
              }}>
                {p.label}
              </p>
              <p style={{
                fontSize: 12,
                color: profil === p.id ? 'rgba(255,255,255,0.7)' : 'var(--texte-sec)',
                fontFamily: 'var(--font-corps)',
              }}>
                {p.sublabel}
              </p>
            </div>
            <span style={{
              fontSize: 18,
              color: profil === p.id ? 'rgba(255,255,255,0.8)' : '#D4CCC2',
            }}>
              {profil === p.id ? '✓' : '›'}
            </span>
          </button>
        ))}
      </div>

      {/* ── Contenu du profil sélectionné ── */}
      {currentProfil && (
        <>
          {/* Frise annuelle */}
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1.5px solid #E0D9CF',
            padding: '16px', marginBottom: 20,
          }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: 'var(--texte-sec)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontFamily: 'var(--font-corps)', marginBottom: 10,
            }}>
              Mois avec échéances — {currentProfil.label}
            </p>
            <FriseAnnuelle
              data={currentProfil.data}
              moisActuel={moisActuel}
              couleur={currentProfil.couleur}
            />
            <p style={{ fontSize: 11, color: 'var(--texte-sec)', fontStyle: 'italic' }}>
              Mois en surbrillance = mois actuel ({MOIS[moisActuel]})
            </p>
          </div>

          {/* Échéances */}
          <ProfilSection data={currentProfil.data} moisActuel={moisActuel} />

          {/* Note légale */}
          <div style={{
            padding: '12px 14px',
            background: 'rgba(176,125,42,0.06)',
            border: '1px solid rgba(176,125,42,0.2)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 11, color: '#7A5A1A', lineHeight: 1.55 }}>
              ⚠️ Ce calendrier est indicatif et basé sur les textes officiels 2025 (BOE, AEAT). Les dates exactes peuvent varier selon votre exercice fiscal, votre domiciliation bancaire et les jours fériés. Consultez votre gestor pour votre situation précise.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
