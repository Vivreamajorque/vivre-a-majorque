import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { PageHeading, TERRA, VERT } from '../components/WaveTitle'
import AccompagnementBanner from '../components/AccompagnementBanner'

const FORET = '#0F3D35'
const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/*
 * Sources :
 * Convention fiscale franco-espagnole (BOE-A-1995-25511) — art. 17 : pensions privées imposables en Espagne
 * Règlement UE 883/2004 : S1 = accès soins pays résidence pour retraités UE
 * IRPF : rendimientos del trabajo art. 17 LIRPF — réductions : art. 20 LIRPF
 * Régime Ley Beckham : Ley 35/2006 art. 93 — non applicable aux retraités classiques
 */

const TRANCHES_IRPF = [
  { min: 0,      max: 12450,  taux: 0.19 },
  { min: 12450,  max: 20200,  taux: 0.24 },
  { min: 20200,  max: 35200,  taux: 0.30 },
  { min: 35200,  max: 60000,  taux: 0.37 },
  { min: 60000,  max: 300000, taux: 0.45 },
  { min: 300000, max: Infinity, taux: 0.47 },
]

function calcIRPF(base) {
  let impot = 0
  for (const t of TRANCHES_IRPF) {
    if (base <= t.min) break
    const portion = Math.min(base, t.max) - t.min
    impot += portion * t.taux
  }
  return Math.round(impot)
}

function calcReductionTravail(brut) {
  if (brut <= 13115) return 5565
  if (brut <= 16825) return Math.round(5565 - 1.5 * (brut - 13115))
  return 0
}

export default function RetraiteSimulator() {
  const navigate = useNavigate()
  useSEO({
    title: "Simulateur retraite à Majorque — fiscalité et budget",
    description: "Calculez votre pension nette à Majorque : convention fiscale franco-espagnole, IRPF, S1 européen, budget mensuel retraité. Simulateur gratuit sourcé BOE.",
    url: "https://vivre-a-majorque.vercel.app/app/outils/retraite",
  })

  const [pension, setPension] = useState(2000)
  const [autreRevenu, setAutreRevenu] = useState(0)
  const [typeRetraite, setTypeRetraite] = useState('salarie') // salarie | independant | fonctionnaire
  const [situation, setSituation] = useState('seul') // seul | couple
  const [zone, setZone] = useState('rural') // rural | palma

  const result = useMemo(() => {
    const pensionAnnuelle = pension * 12
    const autreAnnuel = autreRevenu * 12
    const totalBrut = pensionAnnuelle + autreAnnuel

    // Réduction pour rendimientos del trabajo (art. 20 LIRPF)
    const reductionTravail = calcReductionTravail(pensionAnnuelle)
    // Mínimo personal (art. 57 LIRPF) — 5550€ de base, +1150 si >65 ans
    const minPersonal = 6700

    const baseImposable = Math.max(0, totalBrut - reductionTravail - minPersonal)
    const irpfAnnuel = calcIRPF(baseImposable)
    const irpfMensuel = Math.round(irpfAnnuel / 12)

    const netMensuel = pension + autreRevenu - irpfMensuel

    // Budget mensuel selon zone et situation
    const loyer = zone === 'palma'
      ? (situation === 'couple' ? 1700 : 1200)
      : (situation === 'couple' ? 1100 : 800)
    const charges = 160
    const alim = situation === 'couple' ? 580 : 320
    const transport = 180
    const sante = 50 // avec S1 : mutuelle complémentaire uniquement
    const loisirs = situation === 'couple' ? 280 : 180
    const divers = 150
    const totalDepenses = loyer + charges + alim + transport + sante + loisirs + divers
    const solde = netMensuel - totalDepenses

    const txEffectif = totalBrut > 0 ? (irpfAnnuel / totalBrut * 100).toFixed(1) : 0

    return {
      pensionBrute: pension,
      totalBrut,
      baseImposable,
      irpfMensuel,
      netMensuel,
      loyer, charges, alim, transport, sante, loisirs, divers,
      totalDepenses,
      solde,
      txEffectif,
    }
  }, [pension, autreRevenu, typeRetraite, situation, zone])

  const sliderStyle = { width: '100%', accentColor: FORET }
  const labelStyle = { fontSize: 13, color: 'var(--texte-sec)', fontFamily: 'var(--font-corps)', display: 'block', marginBottom: 6 }
  const valueStyle = { fontSize: 18, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)' }

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer/outils')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: VERT, fontSize: 13, fontWeight: 600,
          padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-corps)',
        }}>
          ← Outils
        </button>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 18, color: TERRA, marginBottom: 2 }}>
          projet retraite
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: FORET, lineHeight: 1.1, marginBottom: 6 }}>
          Simulateur retraite
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.55 }}>
          Estimez votre pension nette et votre budget mensuel à Majorque.
          Sources : Convention fiscale franco-espagnole (BOE-A-1995-25511) · LIRPF art. 17, 20, 57 · Règlement UE 883/2004.
        </p>
      </div>

      {/* Paramètres */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gris)', padding: '18px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 14 }}>⚙️ Votre situation</p>

        {/* Type retraite */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>Type de pension</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'salarie', label: '👔 Salarié privé' },
              { id: 'fonctionnaire', label: '🏛️ Fonctionnaire' },
              { id: 'independant', label: '🧾 Indépendant' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setTypeRetraite(opt.id)} style={{
                padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 600,
                background: typeRetraite === opt.id ? FORET : 'transparent',
                color: typeRetraite === opt.id ? '#fff' : FORET,
                border: `1.5px solid ${FORET}`,
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Pension mensuelle */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>Pension mensuelle brute</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={valueStyle}>{fmt(pension)}/mois</span>
            <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{fmt(pension * 12)}/an</span>
          </div>
          <input type="range" min={500} max={6000} step={50} value={pension} onChange={e => setPension(+e.target.value)} style={sliderStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--texte-sec)' }}>
            <span>500 €</span><span>6 000 €</span>
          </div>
        </div>

        {/* Autre revenu */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>Autre revenu mensuel (loyer, dividendes…)</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={valueStyle}>{fmt(autreRevenu)}/mois</span>
          </div>
          <input type="range" min={0} max={3000} step={50} value={autreRevenu} onChange={e => setAutreRevenu(+e.target.value)} style={sliderStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--texte-sec)' }}>
            <span>0 €</span><span>3 000 €</span>
          </div>
        </div>

        {/* Situation */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>Situation</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ id: 'seul', label: '👤 Seul(e)' }, { id: 'couple', label: '👫 En couple' }].map(opt => (
              <button key={opt.id} onClick={() => setSituation(opt.id)} style={{
                flex: 1, padding: '8px 0', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 600,
                background: situation === opt.id ? FORET : 'transparent',
                color: situation === opt.id ? '#fff' : FORET,
                border: `1.5px solid ${FORET}`,
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Zone */}
        <div>
          <span style={labelStyle}>Zone souhaitée</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ id: 'rural', label: '🌿 Hors Palma' }, { id: 'palma', label: '🏙️ Palma' }].map(opt => (
              <button key={opt.id} onClick={() => setZone(opt.id)} style={{
                flex: 1, padding: '8px 0', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 600,
                background: zone === opt.id ? FORET : 'transparent',
                color: zone === opt.id ? '#fff' : FORET,
                border: `1.5px solid ${FORET}`,
              }}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultat fiscal */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gris)', padding: '18px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 14 }}>📊 Fiscalité IRPF estimée</p>
        {[
          ['Pension brute mensuelle', fmt(result.pensionBrute)],
          ['Base imposable annuelle (après réductions légales)', fmt(result.baseImposable)],
          ['IRPF estimé / mois', `-${fmt(result.irpfMensuel)}`],
          ['Taux effectif', `${result.txEffectif} %`],
        ].map(([label, val], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--gris)' }}>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: val.startsWith('-') ? '#C74E4E' : FORET }}>{val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: FORET }}>Pension nette mensuelle</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: VERT }}>{fmt(result.netMensuel)}</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 8, fontStyle: 'italic' }}>
          Calcul indicatif. Réductions art. 20 + mínimo personal art. 57 LIRPF appliqués. Fonctionnaires : pension imposable en France (art. 19 convention FR-ES). Consultez un gestor pour votre situation.
        </p>
      </div>

      {/* Budget mensuel */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gris)', padding: '18px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 14 }}>🏡 Budget mensuel estimé</p>
        {[
          ['🏠 Loyer', result.loyer],
          ['💡 Charges (eau, élec, internet)', result.charges],
          ['🛒 Alimentation', result.alim],
          ['🚗 Transport', result.transport],
          ['💊 Santé (mutuelle complémentaire)', result.sante],
          ['🎭 Loisirs & sorties', result.loisirs],
          ['🎲 Divers & imprévus', result.divers],
        ].map(([label, val], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid var(--gris)' }}>
            <span style={{ fontSize: 13, color: 'var(--texte-sec)' }}>{label}</span>
            <span style={{ fontSize: 13, color: FORET }}>{fmt(val)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: FORET }}>Total dépenses</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#C74E4E' }}>{fmt(result.totalDepenses)}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '12px',
          borderRadius: 10, marginTop: 8,
          background: result.solde >= 0 ? 'rgba(90,173,165,0.08)' : 'rgba(199,78,78,0.08)',
          border: `1px solid ${result.solde >= 0 ? 'rgba(90,173,165,0.3)' : 'rgba(199,78,78,0.3)'}`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: FORET }}>
            {result.solde >= 0 ? '✅ Solde mensuel' : '⚠️ Déficit mensuel'}
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: result.solde >= 0 ? VERT : '#C74E4E' }}>
            {result.solde >= 0 ? '+' : ''}{fmt(result.solde)}
          </span>
        </div>
      </div>

      {/* Info S1 */}
      <div style={{
        background: 'rgba(90,173,165,0.06)', border: '1px solid rgba(90,173,165,0.2)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: FORET, lineHeight: 1.6, fontFamily: 'var(--font-corps)' }}>
          <strong>🏥 Santé avec le formulaire S1 (Règlement UE 883/2004)</strong><br/>
          En tant que retraité(e) touchant une pension française, vous avez droit au formulaire S1. Il vous donne accès au système de santé espagnol public aux mêmes conditions que les résidents espagnols — entièrement pris en charge par la Sécurité Sociale française. Aucune cotisation supplémentaire. Demandez-le à votre CPAM avant de partir.
        </p>
      </div>

      <AccompagnementBanner
        texte="Vous voulez valider votre projet retraite à Majorque avec un regard expert ?"
        cta="Cap Majorque 249 € — 2 visios + dossier →"
        style={{ marginBottom: 16 }}
      />
    </div>
  )
}
