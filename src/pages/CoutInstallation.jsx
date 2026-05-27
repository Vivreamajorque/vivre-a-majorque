import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AccompagnementBanner from '../components/AccompagnementBanner'

/* ──────────────────────────────────────────────
   DONNÉES OFFICIELLES — Sources primaires uniquement
   ──────────────────────────────────────────────
   LAU art.36 (BOE-A-1994-14687, modif. Ley 4/2013) : fianza 1 mois, garantie additionnelle max 2 mois
   Ley 12/2023 (BOE núm.124, 25 mayo 2023) modif. LAU art.20.1 : frais agence = 0€ pour locataire personne physique
   Sede Policía Nacional (sede.policia.gob.es) Modelo 790 : NIE 9,84€ · Cert.UE 3,27€ · TIE 1ère concession 16,08€
   Real Decreto 2822/1998 Reglamento General de Vehículos art.28 : réimmatriculation obligatoire dans 30j
   Orden PRE/3288/2010 : tasa DGT matriculación 99,64€
   Ley 38/1992 Impuestos Especiales (IEDMT) : taxe matriculation 0%/4,75%/9,75%/14,75% selon CO2
   Real Decreto-ley 13/2022 (BOE-A-2022-14683) art.38ter LGSS : tarifa plana autónomo 80€/mois 12 premiers mois
   INE IPV T3 2025 : +12,8% variation annuelle prix résidentiel Illes Balears
   ────────────────────────────────────────────── */

const SOURCES = {
  lau36: { label: 'LAU art.36', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1994-14687' },
  ley12: { label: 'Ley 12/2023 art.20', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-12332' },
  policia: { label: 'sede.policia.gob.es — M790', url: 'https://sede.policia.gob.es/Tasa790_012/' },
  dgt: { label: 'Orden PRE/3288/2010', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-18869' },
  iedmt: { label: 'Ley 38/1992 IEDMT', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-25159' },
  reta: { label: 'RD-ley 13/2022 art.38ter', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-14683' },
  rveh: { label: 'RD 2822/1998 art.28', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1999-2872' },
}

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const fmtDec = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

function SourceBadge({ src }) {
  return (
    <a href={src.url} target="_blank" rel="noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, color: 'var(--texte-sec)', background: 'var(--gris)',
      borderRadius: 4, padding: '1px 6px', textDecoration: 'none',
      fontFamily: 'Inter, sans-serif', border: '1px solid #e0ddd8',
      marginLeft: 4, verticalAlign: 'middle', whiteSpace: 'nowrap',
    }}>
      📋 {src.label}
    </a>
  )
}

function SectionCard({ title, emoji, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 8,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-titre)', fontSize: 16, fontWeight: 600, color: 'var(--foret)' }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          {title}
        </span>
        <span style={{ color: 'var(--texte-sec)', fontSize: 13, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

function InputRow({ label, source, note, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--noir)', fontFamily: 'Inter, sans-serif' }}>{label}</label>
        {source && <SourceBadge src={source} />}
      </div>
      {note && <p style={{ fontSize: 11, color: 'var(--texte-sec)', margin: '0 0 5px', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{note}</p>}
      {children}
    </div>
  )
}

function NumInput({ value, onChange, min = 0, max, step = 1, suffix = '€' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8,
          fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
          background: 'var(--lin)', color: 'var(--noir)', boxSizing: 'border-box',
        }}
      />
      {suffix && <span style={{ fontSize: 13, color: 'var(--texte-sec)', whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  )
}

function FixedRow({ label, amount, source, sublabel, green }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '8px 0', borderBottom: '1px solid var(--gris)', gap: 8,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--noir)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          {source && <SourceBadge src={source} />}
        </div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{sublabel}</div>}
      </div>
      <div style={{
        fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif',
        color: green ? '#2e7d32' : (amount === 0 ? '#2e7d32' : 'var(--noir)'),
        whiteSpace: 'nowrap',
      }}>
        {amount === 0 ? '0 €' : fmtDec(amount)}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, background: checked ? 'var(--vert)' : '#ccc',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3, width: 18, height: 18,
          borderRadius: 9, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>{label}</span>
    </label>
  )
}

function SubTotal({ label, amount, recoverable }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: 'var(--lin)', borderRadius: 8, marginTop: 10,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foret)', fontFamily: 'Inter, sans-serif' }}>{label}</div>
        {recoverable > 0 && <div style={{ fontSize: 11, color: '#2e7d32', fontFamily: 'Inter, sans-serif' }}>dont {fmt(recoverable)} récupérables (dépôts)</div>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--foret)', fontFamily: 'Inter, sans-serif' }}>{fmt(amount)}</div>
    </div>
  )
}

export default function CoutInstallation() {
  const navigate = useNavigate()

  // ── Section 1 : Logement ──
  const [loyer, setLoyer] = useState(950)
  const [garantieAdd, setGarantieAdd] = useState(1)    // 0, 1 ou 2 mois
  const [chevauchement, setChevauchement] = useState(0) // mois de double loyer

  // ── Section 2 : Déménagement ──
  const [demenagement, setDemenagement] = useState(1200)
  const [fraisTransport, setFraisTransport] = useState(0)

  // ── Section 3 : Démarches ──
  const [nationalite, setNationalite] = useState('UE') // UE ou non-UE
  const [wantsTIE, setWantsTIE] = useState(false)

  // ── Section 4 : Véhicule ──
  const [withVehicule, setWithVehicule] = useState(false)
  const [co2Tranche, setCo2Tranche] = useState('0') // 0%, 4.75%, 9.75%, 14.75%
  const [valeurFiscaleVehicule, setValeurFiscaleVehicule] = useState(8000)

  // ── Section 5 : Autónomo ──
  const [withAutonoma, setWithAutonoma] = useState(false)
  const [moisTarifaPlana, setMoisTarifaPlana] = useState(12)

  // ── Section 6 : Trésorerie ──
  const [moisReserve, setMoisReserve] = useState(3)

  // ── Calculs ──
  const calculs = useMemo(() => {
    // Logement
    const fianza = loyer * 1                          // LAU art.36
    const premierLoyer = loyer * 1
    const garantieAddMontant = loyer * garantieAdd    // LAU art.36 max 2 mois
    const loyersChevauchement = loyer * chevauchement
    const fraisAgence = 0                             // Ley 12/2023
    const sousLogement = fianza + premierLoyer + garantieAddMontant + loyersChevauchement
    const recoverablesLogement = fianza + garantieAddMontant

    // Déménagement
    const sousDemenagement = demenagement + fraisTransport

    // Démarches admin
    let fraisAdmin = 0
    if (nationalite === 'UE') {
      fraisAdmin = 3.27 // Certificado Registro Ciudadano UE
      if (wantsTIE) fraisAdmin += 16.08 // TIE optionnel pour UE longue durée
    } else {
      fraisAdmin = 9.84 + 16.08 // NIE + TIE
    }
    const empadronamiento = 0 // gratuit

    // Véhicule
    let sousVehicule = 0
    let tasesDGT = 0
    let taxeIEDMT = 0
    let coutITV = 0
    if (withVehicule) {
      tasesDGT = 99.64                                // Orden PRE/3288/2010
      coutITV = 45.00                                 // tarif moyen ITV Baléares (Llei 14/2000 CAIB)
      const tauxIEDMT = parseFloat(co2Tranche) / 100 // Ley 38/1992
      taxeIEDMT = valeurFiscaleVehicule * tauxIEDMT
      sousVehicule = tasesDGT + coutITV + taxeIEDMT
    }

    // Autónomo
    let sousAutonoma = 0
    if (withAutonoma) {
      sousAutonoma = 80 * moisTarifaPlana             // RD-ley 13/2022 art.38ter
    }

    // Charges mensuelles fixes (pour calcul réserve)
    const chargesMensuelles = loyer + (withAutonoma ? 80 : 0)

    // Trésorerie de sécurité
    const tresorerie = chargesMensuelles * moisReserve

    // Total
    const totalAvantTresorerie = sousLogement + sousDemenagement + fraisAdmin + sousVehicule + sousAutonoma
    const totalAvecTresorerie = totalAvantTresorerie + tresorerie

    return {
      fianza, premierLoyer, garantieAddMontant, loyersChevauchement, fraisAgence,
      sousLogement, recoverablesLogement,
      sousDemenagement,
      fraisAdmin, empadronamiento,
      tasesDGT, coutITV, taxeIEDMT, sousVehicule,
      sousAutonoma,
      chargesMensuelles, tresorerie,
      totalAvantTresorerie, totalAvecTresorerie,
      recoverables: recoverablesLogement,
    }
  }, [loyer, garantieAdd, chevauchement, demenagement, fraisTransport, nationalite, wantsTIE,
      withVehicule, co2Tranche, valeurFiscaleVehicule, withAutonoma, moisTarifaPlana, moisReserve])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'var(--foret)', padding: '20px 16px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-titre)', color: '#fff', fontWeight: 600 }}>Coût d'installation</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>Données sources officielles uniquement</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ─── SECTION 1 : LOGEMENT ─── */}
        <SectionCard title="Logement" emoji="🏠">

          <InputRow
            label="Loyer mensuel (hors charges)"
            note="Variation annuelle Illes Balears : +12,8 % (INE, IPV T3 2025). Saisissez le loyer de votre futur logement."
          >
            <NumInput value={loyer} onChange={setLoyer} min={500} max={5000} step={50} />
          </InputRow>

          <FixedRow
            label="Dépôt de garantie (fianza légale)"
            amount={calculs.fianza}
            source={SOURCES.lau36}
            sublabel="1 mois de loyer — obligatoire pour tout bail d'habitation"
            green={false}
          />

          <FixedRow
            label="Frais d'agence (honoraires)"
            amount={0}
            source={SOURCES.ley12}
            sublabel="À la charge du bailleur/professionnel — 0 € pour le locataire personne physique"
            green
          />

          <FixedRow
            label="Premier loyer"
            amount={calculs.premierLoyer}
          />

          <InputRow
            label="Garantie additionnelle (optionnelle)"
            source={SOURCES.lau36}
            note="Maximum 2 mois supplémentaires autorisés par la loi. Souvent demandée par les propriétaires."
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2].map(m => (
                <button
                  key={m}
                  onClick={() => setGarantieAdd(m)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    fontSize: 13, fontWeight: garantieAdd === m ? 600 : 400,
                    background: garantieAdd === m ? 'var(--vert)' : 'var(--gris)',
                    color: garantieAdd === m ? '#fff' : 'var(--noir)',
                    border: garantieAdd === m ? '2px solid var(--vert)' : '2px solid transparent',
                  }}
                >
                  {m === 0 ? 'Aucune' : `${m} mois`}
                </button>
              ))}
            </div>
          </InputRow>

          {garantieAdd > 0 && (
            <FixedRow label={`Garantie additionnelle (${garantieAdd} mois)`} amount={calculs.garantieAddMontant} />
          )}

          <InputRow label="Chevauchement (double loyer)" note="Si vous conservez un logement en France le temps du déménagement. 0 si vous arrivez directement.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(m => (
                <button
                  key={m}
                  onClick={() => setChevauchement(m)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    fontSize: 13, fontWeight: chevauchement === m ? 600 : 400,
                    background: chevauchement === m ? 'var(--terra)' : 'var(--gris)',
                    color: chevauchement === m ? '#fff' : 'var(--noir)',
                    border: chevauchement === m ? '2px solid var(--terra)' : '2px solid transparent',
                  }}
                >
                  {m === 0 ? '0 mois' : `${m} mois`}
                </button>
              ))}
            </div>
          </InputRow>

          {chevauchement > 0 && (
            <FixedRow label={`Double loyer × ${chevauchement} mois`} amount={calculs.loyersChevauchement} />
          )}

          <SubTotal
            label="Sous-total Logement"
            amount={calculs.sousLogement}
            recoverable={calculs.recoverablesLogement}
          />
        </SectionCard>

        {/* ─── SECTION 2 : DÉMÉNAGEMENT ─── */}
        <SectionCard title="Déménagement" emoji="🚚" defaultOpen={true}>

          <InputRow label="Frais de déménagement" note="Transport de meubles et affaires France → Majorque. Fourgon solo : 800–1500 €. Déménageur professionnel : 2000–4000 €.">
            <NumInput value={demenagement} onChange={setDemenagement} min={0} max={10000} step={100} />
          </InputRow>

          <InputRow label="Transport personnel (avion + bagages)" note="Billet(s) d'avion, excédents de bagages, frais de route.">
            <NumInput value={fraisTransport} onChange={setFraisTransport} min={0} max={2000} step={50} />
          </InputRow>

          <SubTotal label="Sous-total Déménagement" amount={calculs.sousDemenagement} />
        </SectionCard>

        {/* ─── SECTION 3 : DÉMARCHES ADMIN ─── */}
        <SectionCard title="Démarches administratives" emoji="📋">

          <InputRow label="Votre nationalité" note="Détermine le type de titre de séjour applicable.">
            <div style={{ display: 'flex', gap: 8 }}>
              {['UE', 'Non-UE'].map(n => (
                <button
                  key={n}
                  onClick={() => setNationalite(n)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    fontSize: 13, fontWeight: nationalite === n ? 600 : 400,
                    background: nationalite === n ? 'var(--vert)' : 'var(--gris)',
                    color: nationalite === n ? '#fff' : 'var(--noir)',
                    border: nationalite === n ? '2px solid var(--vert)' : '2px solid transparent',
                  }}
                >
                  {n === 'UE' ? '🇪🇺 Citoyen UE/EEE' : '🌍 Hors UE'}
                </button>
              ))}
            </div>
          </InputRow>

          <FixedRow label="Empadronamiento (inscription communale)" amount={0} sublabel="Service gratuit — Mairie de votre commune" green />

          {nationalite === 'UE' ? (
            <>
              <FixedRow
                label="Certificado de Registro de Ciudadano UE"
                amount={3.27}
                source={SOURCES.policia}
                sublabel="Modèle 790 código 012 — Obligatoire pour tout séjour > 3 mois"
              />
              <InputRow label="">
                <Toggle
                  checked={wantsTIE}
                  onChange={setWantsTIE}
                  label={`Demander aussi une TIE (carte physique) +${fmtDec(16.08)}`}
                />
              </InputRow>
              {wantsTIE && (
                <FixedRow
                  label="TIE — Tarjeta de Identidad de Extranjero (1ère concession)"
                  amount={16.08}
                  source={SOURCES.policia}
                  sublabel="Modèle 790 código 052 — Optionnel pour citoyens UE, recommandé"
                />
              )}
            </>
          ) : (
            <>
              <FixedRow
                label="NIE — Número de Identificación de Extranjero"
                amount={9.84}
                source={SOURCES.policia}
                sublabel="Modèle 790 código 012 — Obligatoire pour toute démarche fiscale"
              />
              <FixedRow
                label="TIE — Tarjeta de Identidad de Extranjero (1ère concession)"
                amount={16.08}
                source={SOURCES.policia}
                sublabel="Modèle 790 código 052 — Autorisation de séjour"
              />
            </>
          )}

          <SubTotal
            label="Sous-total Démarches"
            amount={calculs.fraisAdmin}
          />
        </SectionCard>

        {/* ─── SECTION 4 : VÉHICULE ─── */}
        <SectionCard title="Véhicule immatriculé en France" emoji="🚗" defaultOpen={false}>

          <Toggle
            checked={withVehicule}
            onChange={setWithVehicule}
            label="J'amène mon véhicule depuis la France"
          />

          {withVehicule && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 12 }}>
                ⚠️ La réimmatriculation est obligatoire dans les 30 jours suivant l'empadronamiento
                <SourceBadge src={SOURCES.rveh} />
              </p>

              <FixedRow
                label="Taxe DGT — Permis de circulation"
                amount={99.64}
                source={SOURCES.dgt}
                sublabel="Orden PRE/3288/2010 — Tasa de matriculación"
              />

              <FixedRow
                label="Inspection technique (ITV)"
                amount={45.00}
                sublabel="Tarif moyen Baléares — obligatoire avant matriculation espagnole"
              />

              <InputRow
                label="Taxe de matriculation IEDMT"
                source={SOURCES.iedmt}
                note="Basée sur les émissions de CO₂ du véhicule — applicable aux véhicules < 4 ans ou selon puissance."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {[
                    { val: '0', label: '0 % — CO₂ ≤ 120 g/km ou véhicule ≥ 4 ans', color: '#2e7d32' },
                    { val: '4.75', label: '4,75 % — CO₂ entre 121 et 159 g/km', color: '#f57c00' },
                    { val: '9.75', label: '9,75 % — CO₂ entre 160 et 199 g/km', color: '#e65100' },
                    { val: '14.75', label: '14,75 % — CO₂ ≥ 200 g/km', color: '#b71c1c' },
                  ].map(t => (
                    <label key={t.val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: co2Tranche === t.val ? 'var(--lin)' : 'transparent', border: co2Tranche === t.val ? '1px solid #ddd' : '1px solid transparent' }}>
                      <input type="radio" name="co2" value={t.val} checked={co2Tranche === t.val} onChange={() => setCo2Tranche(t.val)} style={{ accentColor: 'var(--vert)' }} />
                      <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: t.color }}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </InputRow>

              {co2Tranche !== '0' && (
                <InputRow
                  label="Valeur fiscale du véhicule"
                  note="Valeur utilisée par l'AEAT pour le calcul de la taxe. Consultez le tableau officiel aeat.es."
                >
                  <NumInput value={valeurFiscaleVehicule} onChange={setValeurFiscaleVehicule} min={500} max={200000} step={500} />
                </InputRow>
              )}

              {co2Tranche !== '0' && (
                <FixedRow
                  label={`Taxe IEDMT (${co2Tranche} % de la valeur fiscale)`}
                  amount={calculs.taxeIEDMT}
                  source={SOURCES.iedmt}
                />
              )}

              <SubTotal label="Sous-total Véhicule" amount={calculs.sousVehicule} />
            </div>
          )}
        </SectionCard>

        {/* ─── SECTION 5 : AUTÓNOMO ─── */}
        <SectionCard title="Statut autónomo (RETA)" emoji="📊" defaultOpen={false}>

          <Toggle
            checked={withAutonoma}
            onChange={setWithAutonoma}
            label="Je m'inscris comme autónomo en Espagne"
          />

          {withAutonoma && (
            <div style={{ marginTop: 14 }}>
              <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#2e7d32', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  <strong>Tarifa plana — 80 € / mois</strong> pendant les 12 premiers mois (nouveaux inscrits sans activité antérieure dans les 2 dernières années).
                  <SourceBadge src={SOURCES.reta} />
                </p>
              </div>

              <InputRow label="Durée tarifa plana souhaitée" note="12 mois maximum. Peut être prolongée jusqu'à 12 mois supplémentaires si revenus < SMI (950,30 €/mois en 2025).">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[6, 12].map(m => (
                    <button
                      key={m}
                      onClick={() => setMoisTarifaPlana(m)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        fontSize: 13, fontWeight: moisTarifaPlana === m ? 600 : 400,
                        background: moisTarifaPlana === m ? 'var(--vert)' : 'var(--gris)',
                        color: moisTarifaPlana === m ? '#fff' : 'var(--noir)',
                        border: moisTarifaPlana === m ? '2px solid var(--vert)' : '2px solid transparent',
                      }}
                    >
                      {m} mois ({fmt(80 * m)})
                    </button>
                  ))}
                </div>
              </InputRow>

              <FixedRow
                label={`Cotisation RETA × ${moisTarifaPlana} mois (tarifa plana)`}
                amount={calculs.sousAutonoma}
                source={SOURCES.reta}
                sublabel="80 € / mois — après : cotisation selon tranches de revenus nets réels"
              />

              <SubTotal label="Sous-total RETA (1re année)" amount={calculs.sousAutonoma} />
            </div>
          )}
        </SectionCard>

        {/* ─── SECTION 6 : TRÉSORERIE ─── */}
        <SectionCard title="Trésorerie de sécurité" emoji="🛡️">

          <p style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 12 }}>
            Réserve de trésorerie recommandée pour couvrir vos charges fixes pendant la période de lancement, sans pression financière.
          </p>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Nombre de mois : <strong>{moisReserve}</strong></span>
              <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--texte-sec)' }}>Charges : {fmt(calculs.chargesMensuelles)}/mois</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={moisReserve}
              onChange={e => setMoisReserve(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--vert)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
              <span>1 mois (minimum)</span>
              <span>3 mois (recommandé)</span>
              <span>12 mois</span>
            </div>
          </div>

          <FixedRow label={`Réserve de trésorerie (${moisReserve} × ${fmt(calculs.chargesMensuelles)})`} amount={calculs.tresorerie} />
        </SectionCard>

        {/* ─── RÉSULTAT TOTAL ─── */}
        <div style={{ background: 'var(--foret)', borderRadius: 16, padding: '20px 16px', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-titre)', fontSize: 20, color: '#fff', fontWeight: 700 }}>
            💶 Budget total estimé
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Logement (entrée)', val: calculs.sousLogement },
              { label: 'Déménagement', val: calculs.sousDemenagement },
              { label: 'Démarches admin', val: calculs.fraisAdmin },
              withVehicule && { label: 'Réimmatriculation véhicule', val: calculs.sousVehicule },
              withAutonoma && { label: `RETA tarifa plana (${moisTarifaPlana} mois)`, val: calculs.sousAutonoma },
              { label: `Trésorerie de sécurité (${moisReserve} mois)`, val: calculs.tresorerie, highlight: true },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: row.highlight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>
                  {row.highlight ? '⊕ ' : '·  '}{row.label}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{fmt(row.val)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>Avant trésorerie</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{fmt(calculs.totalAvantTresorerie)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 17, color: '#fff', fontFamily: 'var(--font-titre)', fontWeight: 600 }}>TOTAL RECOMMANDÉ</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Inter, sans-serif' }}>{fmt(calculs.totalAvecTresorerie)}</span>
            </div>
          </div>

          {calculs.recoverables > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>
                ♻️ <strong style={{ color: '#fff' }}>{fmt(calculs.recoverables)} récupérables</strong> — les dépôts de garantie vous sont restitués à votre départ (sous réserve d'état du logement).
              </p>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              📋 Toutes les données réglementaires (fianza, frais d'agence, taxes, cotisations) proviennent de sources officielles espagnoles. Vérifiez les sources via les badges ↗ et consultez un professionnel pour votre situation personnelle.
            </p>
          </div>
        </div>

        {/* Disclaimer sources */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--gris)' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontFamily: 'var(--font-titre)', color: 'var(--foret)' }}>Sources officielles utilisées</h3>
          {Object.values(SOURCES).map(s => (
            <div key={s.label} style={{ marginBottom: 4 }}>
              <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--vert)', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>
                ↗ {s.label}
              </a>
            </div>
          ))}
          <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
            Simulateur à titre indicatif. Les taux et montants officiels sont susceptibles d'évolution législative. Ce simulateur ne constitue pas un conseil juridique ou fiscal.
          </p>
        </div>

      <AccompagnementBanner
          texte="Ce budget d'installation vous semble impressionnant ? Je peux vous aider à le planifier étape par étape, selon votre situation."
          cta="Voir les accompagnements →"
        />
      </div>
    </div>
  )
}
