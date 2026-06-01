import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

/* ═══════════════════════════════════════════════════════════════
   MOTEUR DE CALCUL — Sources officielles 2024/2025
   ─────────────────────────────────────────────────────────────
   ESPAGNE : RD-ley 13/2022 (cotizaciones por ingresos reales)
             Ley 35/2006 IRPF (barème + Art. 68 rétention)
   FRANCE  : Art. L613-7 CSS (taux AE BNC 21,2%)
             CGI Art. 151-0 (versement libératoire 2,2%)
             CGI Art. 50-0 abattement 34% BNC
═══════════════════════════════════════════════════════════════ */

// ── ESPAGNE : Tranche RETA 2025 (RD 13/2022, annexe revisée 2025) ──
// Cotisation mensuelle selon revenu net annuel
const RETA_TRANCHES = [
  { min: 0,      max: 670,   cot: 200  },
  { min: 670,    max: 900,   cot: 250  },
  { min: 900,    max: 1166,  cot: 293  },
  { min: 1166,   max: 1300,  cot: 294  },
  { min: 1300,   max: 1500,  cot: 294  },
  { min: 1500,   max: 1700,  cot: 294  },
  { min: 1700,   max: 1850,  cot: 310  },
  { min: 1850,   max: 2030,  cot: 325  },
  { min: 2030,   max: 2330,  cot: 350  },
  { min: 2330,   max: 2760,  cot: 370  },
  { min: 2760,   max: 3190,  cot: 390  },
  { min: 3190,   max: 3620,  cot: 415  },
  { min: 3620,   max: 4050,  cot: 445  },
  { min: 4050,   max: 6000,  cot: 515  },
  { min: 6000,   max: Infinity, cot: 590 },
]

function getCotisacionMensuel(revenuNetMensuel) {
  const t = RETA_TRANCHES.find(t => revenuNetMensuel >= t.min && revenuNetMensuel < t.max)
  return t ? t.cot : 590
}

// ── ESPAGNE : Barème IRPF 2024 (Ley 35/2006 Art. 63, taux État + CC.AA. moyen) ──
const IRPF_TRANCHES = [
  { min: 0,      max: 12450,  taux: 0.19 },
  { min: 12450,  max: 20200,  taux: 0.24 },
  { min: 20200,  max: 35200,  taux: 0.30 },
  { min: 35200,  max: 60000,  taux: 0.37 },
  { min: 60000,  max: 300000, taux: 0.45 },
  { min: 300000, max: Infinity, taux: 0.47 },
]

// Minimum vital exonéré (mínimo personal 2024)
const MINIMO_PERSONAL_ES = 5550

function calcIRPF(baseImposable) {
  const base = Math.max(0, baseImposable - MINIMO_PERSONAL_ES)
  let impot = 0
  for (const t of IRPF_TRANCHES) {
    if (base <= t.min) break
    impot += (Math.min(base, t.max) - t.min) * t.taux
  }
  return Math.max(0, impot)
}

// ── FRANCE : Barème IR 2024 (CGI Art. 197, quotient familial 1 part) ──
const IR_FR_TRANCHES = [
  { min: 0,      max: 11294, taux: 0    },
  { min: 11294,  max: 28797, taux: 0.11 },
  { min: 28797,  max: 82341, taux: 0.30 },
  { min: 82341,  max: 177106, taux: 0.41 },
  { min: 177106, max: Infinity, taux: 0.45 },
]

function calcIR_France(revenuImposable) {
  let impot = 0
  for (const t of IR_FR_TRANCHES) {
    if (revenuImposable <= t.min) break
    impot += (Math.min(revenuImposable, t.max) - t.min) * t.taux
  }
  return Math.max(0, impot)
}

// ── Calcul Espagne ──
function calcEspagne({ caTTC, tauxIVA, gastos, annee1 }) {
  const caHT = caTTC / (1 + tauxIVA)          // CA HT (hors IVA)
  const ivaCollecte = caTTC - caHT             // IVA collecté → reversé intégralement
  const revenuBrut = caHT - gastos             // Revenu brut = CA HT - charges déductibles

  // Cotisation SS : calculée sur revenu net mensuel estimé
  // Revenu net mensuel estimé (avant cotisation) = revenuBrut / 12
  // On itère pour approcher le revenu réel (cotisation dépend du net)
  const revenuBrutMensuel = revenuBrut / 12
  // 1re estimation : cotisation sur revenu brut / 12
  const cotMensuelEst = getCotisacionMensuel(revenuBrutMensuel)
  const cotAnnuelEst = cotMensuelEst * 12
  // Revenu net après cotisation pour recalcul
  const revenuNetMensuel2 = (revenuBrut - cotAnnuelEst) / 12
  // 2e passe (convergence rapide)
  const cotMensuelFinal = annee1 ? 80 : getCotisacionMensuel(revenuNetMensuel2)
  const cotisationAnnuelle = cotMensuelFinal * 12

  // Base imposable IRPF = Revenu brut - Cotisations SS (déductibles à 100%)
  const baseIRPF = Math.max(0, revenuBrut - cotisationAnnuelle)
  const irpf = calcIRPF(baseIRPF)

  // Net en poche
  const netPoche = revenuBrut - cotisationAnnuelle - irpf

  // Taux effectif global
  const txEffectif = revenuBrut > 0 ? (cotisationAnnuelle + irpf) / revenuBrut : 0

  return {
    caHT: Math.round(caHT),
    ivaCollecte: Math.round(ivaCollecte),
    gastos: Math.round(gastos),
    revenuBrut: Math.round(revenuBrut),
    cotisationMensuelle: cotMensuelFinal,
    cotisationAnnuelle: Math.round(cotisationAnnuelle),
    baseIRPF: Math.round(baseIRPF),
    irpf: Math.round(irpf),
    netPoche: Math.round(netPoche),
    txEffectif: Math.round(txEffectif * 100),
  }
}

// ── Calcul France Auto-Entrepreneur ──
function calcFrance({ caTTC, categorieAE, versementLiberatoire, cfe }) {
  // En AE en France, si CA < seuil TVA (36 800 € services BNC), pas de TVA
  // Le CA déclaré = CA encaissé (= caTTC en AE car pas de TVA collectée sous seuil)
  const caAE = caTTC  // CA = TTC = HT pour l'AE sous seuil TVA

  // Taux cotisations sociales AE 2024
  const tauxCotisations = categorieAE === 'bnc' ? 0.212 : 0.121
  const cotisations = caAE * tauxCotisations

  // Abattement fiscal pour calcul IR
  const tauxAbattement = categorieAE === 'bnc' ? 0.34 : 0.71
  const abattement = caAE * tauxAbattement
  const revenuImposable = caAE * (1 - tauxAbattement)

  // Option versement libératoire (si eligible : RFR N-2 < 27 478 €)
  const taux_vl = categorieAE === 'bnc' ? 0.022 : 0.01
  let impotRevenu
  if (versementLiberatoire) {
    impotRevenu = caAE * taux_vl
  } else {
    impotRevenu = calcIR_France(revenuImposable)
  }

  // CFE (Cotisation Foncière des Entreprises) — exonérée 1re année
  // Montant moyen selon CA (base minimale commune, estimé)
  const cfeMontant = cfe

  // Net en poche
  const netPoche = caAE - cotisations - impotRevenu - cfeMontant

  // Taux effectif global
  const txEffectif = caAE > 0 ? (cotisations + impotRevenu + cfeMontant) / caAE : 0

  return {
    caAE: Math.round(caAE),
    cotisations: Math.round(cotisations),
    revenuImposable: Math.round(revenuImposable),
    abattement: Math.round(abattement),
    impotRevenu: Math.round(impotRevenu),
    cfeMontant: Math.round(cfeMontant),
    netPoche: Math.round(netPoche),
    txEffectif: Math.round(txEffectif * 100),
  }
}

/* ═══════════════════════════════════════════════════════
   COMPOSANTS UI
═══════════════════════════════════════════════════════ */

const VERT  = '#5AADA5'
const TERRA = '#C76E4E'
const FORET = '#0F3D35'

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €'
}

function fmtPct(n) { return n + ' %' }

function SliderInput({ label, value, onChange, min, max, step = 1, format, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: FORET, fontFamily: 'var(--font-corps)' }}>
          {label}
        </label>
        <span style={{
          fontSize: 14, fontWeight: 800, color: TERRA,
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
        }}>
          {format ? format(value) : fmt(value)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: VERT }}
      />
      {hint && (
        <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 4, fontStyle: 'italic' }}>{hint}</p>
      )}
    </div>
  )
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '12px 14px',
      background: value ? 'rgba(90,173,165,0.07)' : '#fff',
      border: `1.5px solid ${value ? 'rgba(90,173,165,0.3)' : 'var(--gris)'}`,
      borderRadius: 12, marginBottom: 10, cursor: 'pointer',
      transition: 'all 0.15s',
    }}
    onClick={() => onChange(!value)}
    >
      <div style={{ flex: 1, paddingRight: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: FORET, marginBottom: hint ? 2 : 0 }}>{label}</p>
        {hint && <p style={{ fontSize: 11, color: 'var(--texte-sec)', lineHeight: 1.4 }}>{hint}</p>}
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? VERT : '#D4CCC2',
        position: 'relative', flexShrink: 0, marginTop: 2,
        transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: value ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  )
}

function ResultLine({ label, value, bold, color, source, indent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: `${bold ? '10px' : '7px'} ${indent ? '24px' : '0'}`,
      borderBottom: bold ? 'none' : '1px solid #F0EAE0',
    }}>
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400,
          color: color || 'var(--texte)',
          fontFamily: 'var(--font-corps)',
        }}>{label}</span>
        {source && (
          <p style={{ fontSize: 10, color: 'var(--texte-sec)', marginTop: 1, fontStyle: 'italic' }}>{source}</p>
        )}
      </div>
      <span style={{
        fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 600,
        color: color || FORET, flexShrink: 0, marginLeft: 12,
        fontFamily: bold ? 'var(--font-display)' : 'var(--font-corps)',
        fontStyle: bold ? 'italic' : 'normal',
      }}>
        {typeof value === 'number' ? fmt(value) : value}
      </span>
    </div>
  )
}

function NetPocheBig({ label, value, color, sublabel }) {
  return (
    <div style={{
      background: color,
      borderRadius: 16, padding: '20px 18px',
      textAlign: 'center', marginBottom: 16,
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-corps)' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
        {fmt(value)}
      </p>
      {sublabel && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{sublabel}</p>
      )}
    </div>
  )
}

function SectionCard({ title, color, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: `1.5px solid ${color}30`,
      overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        background: color, padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 17, color: '#fff', fontWeight: 400,
        }}>{title}</p>
      </div>
      <div style={{ padding: '8px 18px 12px' }}>
        {children}
      </div>
    </div>
  )
}

function DiffBadge({ esVal, frVal, label }) {
  const diff = esVal - frVal
  const positive = diff > 0
  if (Math.abs(diff) < 10) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px',
      background: positive ? 'rgba(90,173,165,0.08)' : 'rgba(199,110,78,0.08)',
      border: `1px solid ${positive ? 'rgba(90,173,165,0.25)' : 'rgba(199,110,78,0.25)'}`,
      borderRadius: 10, marginBottom: 8,
    }}>
      <span style={{ fontSize: 13, color: 'var(--texte)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: 14, fontWeight: 800,
        color: positive ? VERT : TERRA,
        fontFamily: 'var(--font-corps)',
      }}>
        {positive ? '+' : ''}{fmt(diff)}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════ */

export default function AutonomaSimulator() {
  const navigate = useNavigate()

  useSEO({
    title: "Simulateur autónomo Espagne — net en poche",
    description: "Comparez auto-entrepreneur France vs autónomo Espagne. Calculez vos cotisations, IRPF, IVA et votre revenu net mensuel. Tarifa plana 80€/mois incluse.",
    url: "https://vivre-a-majorque.vercel.app/app/outils/autonoma",
  })

  // ── Paramètres communs ──
  const [caTTC, setCaTTC] = useState(40000)

  // ── Paramètres Espagne ──
  const [tauxIVA, setTauxIVA] = useState(0.21)
  const [gastos, setGastos] = useState(3000)
  const [annee1ES, setAnnee1ES] = useState(false)

  // ── Paramètres France ──
  const [categorieAE, setCategorieAE] = useState('bnc') // bnc ou vente
  const [versementLiberatoire, setVersementLiberatoire] = useState(false)
  const [cfe, setCfe] = useState(300)
  const [annee1FR, setAnnee1FR] = useState(false)

  // ── Calculs ──
  const es = useMemo(() =>
    calcEspagne({ caTTC, tauxIVA, gastos, annee1: annee1ES }),
    [caTTC, tauxIVA, gastos, annee1ES]
  )

  const fr = useMemo(() =>
    calcFrance({ caTTC, categorieAE, versementLiberatoire, cfe: annee1FR ? 0 : cfe }),
    [caTTC, categorieAE, versementLiberatoire, cfe, annee1FR]
  )

  const [tab, setTab] = useState('compare') // 'compare' | 'es' | 'fr'

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ paddingTop: 52, marginBottom: 4 }}>
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
          France vs Espagne
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6,
        }}>
          Simulateur autónomo
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5, marginBottom: 4 }}>
          Comparez votre net en poche : auto-entrepreneur France vs autónomo Espagne, à chiffre d'affaires identique.
        </p>
        <p style={{ fontSize: 11, color: 'var(--texte-sec)', fontStyle: 'italic' }}>
          Sources : RD-ley 13/2022, Ley 35/2006 IRPF, CGI Art. 50-0, Art. L613-7 CSS · Barèmes 2024/2025
        </p>
      </div>

      {/* ── CA commun ── */}
      <div style={{
        background: FORET, borderRadius: 18,
        padding: '20px 18px', marginBottom: 20,
        marginTop: 16,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 17, color: '#F7F2EB', marginBottom: 16,
        }}>
          Chiffre d'affaires annuel
        </p>
        <div style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(247,242,235,0.7)', fontFamily: 'var(--font-corps)' }}>
              CA encaissé (TTC / toutes taxes)
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 26, fontWeight: 900, color: '#F7F2EB', lineHeight: 1,
            }}>
              {fmt(caTTC)}
            </span>
          </div>
          <input
            type="range" min={5000} max={150000} step={1000}
            value={caTTC}
            onChange={e => setCaTTC(Number(e.target.value))}
            style={{ width: '100%', accentColor: VERT }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'rgba(247,242,235,0.4)' }}>5 000 €</span>
            <span style={{ fontSize: 11, color: 'rgba(247,242,235,0.4)' }}>150 000 €</span>
          </div>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div style={{
        display: 'flex', gap: 0,
        background: '#E8E2D9', borderRadius: 12,
        padding: 4, marginBottom: 20,
      }}>
        {[
          { id: 'compare', label: '⚖️ Comparatif' },
          { id: 'es',      label: '🇪🇸 Espagne' },
          { id: 'fr',      label: '🇫🇷 France' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 4px',
            borderRadius: 9, border: 'none',
            background: tab === t.id ? '#fff' : 'transparent',
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 12, color: tab === t.id ? FORET : 'var(--texte-sec)',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-corps)',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          ONGLET COMPARATIF
      ════════════════════════════════════════ */}
      {tab === 'compare' && (
        <>
          {/* Net en poche côte à côte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{
              background: FORET, borderRadius: 16, padding: '16px 14px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-corps)' }}>
                🇪🇸 Net poche
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#F7F2EB', lineHeight: 1, marginBottom: 4 }}>
                {fmt(es.netPoche)}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                {fmtPct(es.txEffectif)} prélevé
              </p>
            </div>
            <div style={{
              background: TERRA, borderRadius: 16, padding: '16px 14px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-corps)' }}>
                🇫🇷 Net poche
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#F7F2EB', lineHeight: 1, marginBottom: 4 }}>
                {fmt(fr.netPoche)}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                {fmtPct(fr.txEffectif)} prélevé
              </p>
            </div>
          </div>

          {/* Différence principale */}
          {Math.abs(es.netPoche - fr.netPoche) > 50 && (
            <div style={{
              background: es.netPoche > fr.netPoche ? 'rgba(90,173,165,0.08)' : 'rgba(199,110,78,0.08)',
              border: `1.5px solid ${es.netPoche > fr.netPoche ? 'rgba(90,173,165,0.3)' : 'rgba(199,110,78,0.3)'}`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 20, fontWeight: 400,
                color: es.netPoche > fr.netPoche ? VERT : TERRA,
                marginBottom: 4,
              }}>
                {es.netPoche > fr.netPoche ? 'Espagne plus favorable' : 'France plus favorable'}
              </p>
              <p style={{ fontSize: 26, fontWeight: 900, color: es.netPoche > fr.netPoche ? VERT : TERRA, fontFamily: 'var(--font-display)' }}>
                {es.netPoche > fr.netPoche ? '+' : ''}{fmt(es.netPoche - fr.netPoche)}/an
              </p>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 4 }}>
                soit {fmt(Math.round(Math.abs(es.netPoche - fr.netPoche) / 12))}/mois de différence
              </p>
            </div>
          )}

          {/* Tableau comparatif ligne par ligne */}
          <SectionCard title="Comparaison poste par poste" color={FORET}>
            {/* En-tête */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8, padding: '8px 0 6px', borderBottom: '2px solid #E0D9CF', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texte-sec)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Poste</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: FORET, textAlign: 'right' }}>🇪🇸</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: TERRA, textAlign: 'right' }}>🇫🇷</span>
            </div>

            {[
              { label: 'CA déclaré (HT)', es: es.caHT, fr: fr.caAE, note: '🇪🇸 hors IVA · 🇫🇷 = CA (pas de TVA sous seuil)' },
              { label: 'Charges déductibles', es: -es.gastos, fr: null, note: '🇪🇸 frais réels · 🇫🇷 inclus dans l\'abattement' },
              { label: 'Revenu professionnel net', es: es.revenuBrut, fr: fr.caAE, bold: true },
              { label: 'Cotisations sociales', es: -es.cotisationAnnuelle, fr: -fr.cotisations, note: '🇪🇸 RETA (revenus réels) · 🇫🇷 21,2% BNC' },
              { label: 'Impôt sur le revenu', es: -es.irpf, fr: -fr.impotRevenu, note: '🇪🇸 IRPF barème · 🇫🇷 IR barème ou VL' },
              { label: 'CFE / Taxes locales', es: 0, fr: -fr.cfeMontant, note: '🇪🇸 pas d\'équivalent · 🇫🇷 exonérée 1re année' },
              { label: '→ Net en poche', es: es.netPoche, fr: fr.netPoche, bold: true, color: true },
              { label: 'Taux de prélèvement', es: fmtPct(es.txEffectif), fr: fmtPct(fr.txEffectif), raw: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 80px',
                gap: 8, padding: '8px 0',
                borderBottom: row.bold ? '2px solid #E0D9CF' : '1px solid #F0EAE0',
                background: row.bold ? 'rgba(15,61,53,0.03)' : 'transparent',
              }}>
                <div>
                  <span style={{ fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 700 : 400, color: 'var(--texte)' }}>{row.label}</span>
                  {row.note && <p style={{ fontSize: 10, color: 'var(--texte-sec)', fontStyle: 'italic', marginTop: 1, lineHeight: 1.3 }}>{row.note}</p>}
                </div>
                <span style={{
                  fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 800 : 600,
                  color: row.color ? VERT : FORET,
                  textAlign: 'right', alignSelf: 'center',
                }}>
                  {row.raw ? row.es : (row.es === null ? '—' : fmt(row.es))}
                </span>
                <span style={{
                  fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 800 : 600,
                  color: row.color ? TERRA : FORET,
                  textAlign: 'right', alignSelf: 'center',
                }}>
                  {row.raw ? row.fr : (row.fr === null ? '—' : fmt(row.fr))}
                </span>
              </div>
            ))}
          </SectionCard>

          {/* Points clés à comprendre */}
          <SectionCard title="Ce qu'il faut comprendre" color="#7BA05B">
            {[
              {
                emoji: '🔄',
                titre: "L'IVA n'est pas un revenu",
                texte: `En Espagne, vous collectez ${fmt(es.ivaCollecte)} d'IVA sur vos factures mais vous la reversez intégralement à Hacienda. Ce n'est pas votre argent — votre vrai CA est ${fmt(es.caHT)}.`,
              },
              {
                emoji: '📊',
                titre: "Les cotisations SS sont très différentes",
                texte: `En France (AE), les cotisations sont proportionnelles au CA : ${fmtPct(21.2)} quel que soit votre niveau. En Espagne, elles sont fixes par tranche de revenu réel — ${fmt(es.cotisationMensuelle)}/mois pour vous — et déductibles fiscalement.`,
              },
              {
                emoji: '💰',
                titre: "La déductibilité des charges",
                texte: "En AE France, vous ne pouvez pas déduire vos charges réelles (seulement l'abattement forfaitaire de 34%). En Espagne, vos frais professionnels réels sont déductibles du revenu imposable.",
              },
              {
                emoji: '📅',
                titre: "Tarifa Plana (1re année en Espagne)",
                texte: "La 1re année comme autónomo, vous cotisez seulement 80€/mois à la SS (au lieu de " + fmt(es.cotisationMensuelle * 12) + "/an) — activez l'option Espagne pour simuler.",
              },
              {
                emoji: '⚖️',
                titre: "Obligations déclaratives",
                texte: "En AE France : 1 déclaration CA par mois/trimestre + 1 IR/an. En Espagne : déclaration IVA trimestrielle (Modelo 303) + IRPF trimestriel (Modelo 130) + annuel (Renta).",
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, paddingTop: i === 0 ? 4 : 12,
                borderTop: i === 0 ? 'none' : '1px solid #F0EAE0',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 3 }}>{item.titre}</p>
                  <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.5 }}>{item.texte}</p>
                </div>
              </div>
            ))}
          </SectionCard>

          {/* Disclaimer */}
          <div style={{
            padding: '12px 14px',
            background: 'rgba(176,125,42,0.06)',
            border: '1px solid rgba(176,125,42,0.2)',
            borderRadius: 12, marginTop: 4,
          }}>
            <p style={{ fontSize: 11, color: '#7A5A1A', lineHeight: 1.55 }}>
              ⚠️ Simulation indicative basée sur les barèmes officiels 2024/2025. Ne tient pas compte des conventions fiscales franco-espagnoles, des revenus du foyer, des crédits d'impôt ou situations particulières. Pour votre situation précise, consultez un gestor agréé.
            </p>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          ONGLET ESPAGNE
      ════════════════════════════════════════ */}
      {tab === 'es' && (
        <>
          {/* Paramètres */}
          <SectionCard title="🇪🇸 Paramètres Espagne" color={FORET}>
            <div style={{ paddingTop: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: FORET, display: 'block', marginBottom: 8 }}>
                  Taux IVA applicable
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: 0.21, label: '21 % — standard' },
                    { val: 0.10, label: '10 % — réduit' },
                    { val: 0,    label: '0 % — exonéré' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setTauxIVA(o.val)} style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                      background: tauxIVA === o.val ? FORET : '#F0EAE0',
                      color: tauxIVA === o.val ? '#fff' : 'var(--texte)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-corps)',
                    }}>
                      {o.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 6, fontStyle: 'italic' }}>
                  Prestations de services intellectuels : 21%. Restauration, hébergement : 10%. Exportations : 0%.
                </p>
              </div>

              <SliderInput
                label="Charges déductibles estimées / an"
                value={gastos}
                onChange={setGastos}
                min={0} max={30000} step={500}
                hint="Bureau, téléphone, déplacements, logiciels, formation… Frais réels justifiés."
              />

              <Toggle
                label="1re année — Tarifa Plana"
                value={annee1ES}
                onChange={setAnnee1ES}
                hint="80 €/mois de cotisation SS les 12 premiers mois (RD-ley 13/2022 art.38ter)"
              />
            </div>
          </SectionCard>

          {/* Résultats Espagne */}
          <NetPocheBig label="🇪🇸 Net en poche (Espagne)" value={es.netPoche} color={FORET}
            sublabel={`${fmt(Math.round(es.netPoche / 12))}/mois · ${fmtPct(es.txEffectif)} prélevé`} />

          <SectionCard title="Détail du calcul" color={FORET}>
            <ResultLine label="CA facturé TTC" value={caTTC} />
            <ResultLine label="IVA collectée (reversée à Hacienda)" value={-es.ivaCollecte}
              color={TERRA} indent source="Non imposable — juste transit" />
            <ResultLine label="CA hors IVA (votre vrai CA)" value={es.caHT} bold />
            <ResultLine label="Charges déductibles (gastos)" value={-es.gastos}
              source="Frais réels : bureau, téléphone, déplacements…" indent />
            <ResultLine label="Revenu professionnel net" value={es.revenuBrut} bold />
            <ResultLine
              label={`Cotisation SS — RETA (${annee1ES ? 'Tarifa Plana 80 €/mois' : fmt(es.cotisationMensuelle) + '/mois'})`}
              value={-es.cotisationAnnuelle}
              source={annee1ES ? 'RD-ley 13/2022 art.38ter — tarifa reducida 1re année' : 'RD-ley 13/2022 — tranche selon revenu net réel'}
              color={TERRA} indent
            />
            <ResultLine label="Base imposable IRPF" value={es.baseIRPF}
              source="Revenu net − cotisations SS (100% déductibles, Art. 30 LIRPF)" />
            <ResultLine label={`IRPF estimé (taux effectif ${fmtPct(es.baseIRPF > 0 ? Math.round(es.irpf / es.baseIRPF * 100) : 0)})`}
              value={-es.irpf}
              source="Barème progressif 19-47% · mínimo personal 5 550 € déduit (Art. 63 Ley 35/2006)"
              color={TERRA} indent
            />
            <ResultLine label="→ Net en poche" value={es.netPoche} bold color={VERT} />
            <ResultLine label="Taux global de prélèvement" value={fmtPct(es.txEffectif)} />
          </SectionCard>

          {/* IVA expliquée */}
          <div style={{
            background: 'rgba(90,173,165,0.06)', border: '1.5px solid rgba(90,173,165,0.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 6 }}>
              💡 L'IVA en détail
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
              Vous facturez <strong>{fmt(caTTC)}</strong> TTC à vos clients, dont <strong>{fmt(es.ivaCollecte)}</strong> d'IVA que vous reversez intégralement à Hacienda via le Modelo 303 (trimestriel). Votre CA réel est <strong>{fmt(es.caHT)}</strong>. Si vous avez des achats professionnels avec IVA, vous déduisez l'IVA payée (IVA soportado) — seule la différence est reversée.
            </p>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          ONGLET FRANCE
      ════════════════════════════════════════ */}
      {tab === 'fr' && (
        <>
          {/* Paramètres */}
          <SectionCard title="🇫🇷 Paramètres France" color={TERRA}>
            <div style={{ paddingTop: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: FORET, display: 'block', marginBottom: 8 }}>
                  Catégorie d'activité
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: 'bnc', label: 'BNC / Services', sub: '21,2% cot. · 34% abatt.' },
                    { val: 'vente', label: 'Vente / BIC', sub: '12,1% cot. · 71% abatt.' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setCategorieAE(o.val)} style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
                      background: categorieAE === o.val ? TERRA : '#F0EAE0',
                      color: categorieAE === o.val ? '#fff' : 'var(--texte)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-corps)',
                      textAlign: 'center',
                    }}>
                      <div>{o.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>{o.sub}</div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 6, fontStyle: 'italic' }}>
                  BNC = prestations intellectuelles, conseil, formation. Vente = achat-revente de marchandises.
                </p>
              </div>

              <Toggle
                label="Versement libératoire (IR)"
                value={versementLiberatoire}
                onChange={setVersementLiberatoire}
                hint={`Impôt IR fixe ${categorieAE === 'bnc' ? '2,2 %' : '1 %'} du CA en lieu et place du barème. Éligible si RFR N-2 < 27 478 € (1 part). Art. 151-0 CGI.`}
              />

              <SliderInput
                label="CFE annuelle estimée"
                value={cfe}
                onChange={setCfe}
                min={0} max={2000} step={50}
                hint="Cotisation Foncière des Entreprises — varie selon commune et CA. Base minimale 0 € à 244 € selon commune."
              />

              <Toggle
                label="1re année — exonération CFE"
                value={annee1FR}
                onChange={setAnnee1FR}
                hint="La CFE est exonérée la 1re année civile d'activité (Art. 1478 CGI)."
              />
            </div>
          </SectionCard>

          {/* Résultats France */}
          <NetPocheBig label="🇫🇷 Net en poche (France AE)" value={fr.netPoche} color={TERRA}
            sublabel={`${fmt(Math.round(fr.netPoche / 12))}/mois · ${fmtPct(fr.txEffectif)} prélevé`} />

          <SectionCard title="Détail du calcul" color={TERRA}>
            <ResultLine label="CA encaissé (= HT, pas de TVA sous seuil)" value={fr.caAE}
              source={`Seuil franchise TVA 2024 : 36 800 € services, 91 900 € vente (Art. 293B CGI)`} />
            <ResultLine
              label={`Cotisations sociales AE (${categorieAE === 'bnc' ? '21,2 %' : '12,1 %'} du CA)`}
              value={-fr.cotisations}
              source={`Art. L613-7 CSS — taux global incluant maladie, retraite, formation`}
              color={TERRA} indent
            />
            <ResultLine
              label={`Abattement fiscal forfaitaire (${categorieAE === 'bnc' ? '34 %' : '71 %'})`}
              value={-fr.abattement}
              source={`Art. 50-0 CGI — représente forfaitairement vos charges. Pas de déduction réelle possible.`}
              indent
            />
            <ResultLine label="Revenu imposable (après abattement)" value={fr.revenuImposable} bold />
            <ResultLine
              label={versementLiberatoire
                ? `IR — Versement libératoire (${categorieAE === 'bnc' ? '2,2 %' : '1 %'} du CA)`
                : 'Impôt sur le revenu (barème progressif)'}
              value={-fr.impotRevenu}
              source={versementLiberatoire
                ? `Art. 151-0 CGI — prélevé mensuellement avec les cotisations`
                : `Barème 2024 · sans quotient familial (simulation 1 part)`}
              color={TERRA} indent
            />
            <ResultLine label={`CFE${annee1FR ? ' (exonérée 1re année)' : ''}`}
              value={annee1FR ? 0 : -fr.cfeMontant}
              source="Art. 1478 CGI — cotisation foncière annuelle" color={TERRA} indent />
            <ResultLine label="→ Net en poche" value={fr.netPoche} bold color={TERRA} />
            <ResultLine label="Taux global de prélèvement" value={fmtPct(fr.txEffectif)} />
          </SectionCard>

          {/* Point important France */}
          <div style={{
            background: 'rgba(199,110,78,0.06)', border: '1.5px solid rgba(199,110,78,0.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 6 }}>
              💡 Le piège de l'abattement
            </p>
            <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
              En auto-entrepreneur, l'abattement forfaitaire de 34% (BNC) est censé représenter vos charges. Mais si vos charges réelles sont supérieures — ce qui est fréquent — vous payez trop d'impôt. En Espagne, vos charges réelles sont déductibles au centime près.
            </p>
          </div>

          {/* Seuils AE */}
          <div style={{
            background: 'rgba(176,125,42,0.06)', border: '1px solid rgba(176,125,42,0.2)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7A5A1A', marginBottom: 8 }}>
              📋 Seuils AE 2024 à connaître
            </p>
            {[
              { label: 'Plafond CA services (BNC)', val: '77 700 €/an', detail: 'Au-delà : basculement en régime réel (EIRL/EURL)' },
              { label: 'Franchise TVA services', val: '36 800 €/an', detail: 'Au-delà : obligation de facturer et reverser la TVA' },
              { label: 'Versement libératoire', val: 'RFR N-2 < 27 478 €', detail: 'Revenu fiscal de référence de l\'avant-dernière année' },
              { label: 'Exonération ACRE (1re année)', val: '50% de réduction', detail: 'Cotisations réduites 12 mois si conditions (Art. L131-6-4 CSS)' },
            ].map((s, i) => (
              <div key={i} style={{
                paddingTop: i === 0 ? 0 : 8,
                borderTop: i === 0 ? 'none' : '1px solid rgba(176,125,42,0.15)',
                paddingBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: FORET }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#7A5A1A' }}>{s.val}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--texte-sec)', fontStyle: 'italic' }}>{s.detail}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Disclaimer global */}
      <div style={{ marginTop: 24, padding: '12px 14px', background: 'rgba(176,125,42,0.06)', border: '1px solid rgba(176,125,42,0.2)', borderRadius: 12 }}>
        <p style={{ fontSize: 11, color: '#7A5A1A', lineHeight: 1.55 }}>
          ⚠️ Simulation pédagogique basée sur les barèmes officiels 2024/2025 (célibataire sans enfant, 1 part fiscale). Ne tient pas compte de la convention fiscale franco-espagnole (Art. 24), de la situation familiale, des revenus complémentaires, ni de la résidence fiscale en transition. Consultez un gestor agréé pour votre situation personnelle.
        </p>
      </div>
    </div>
  )
}
