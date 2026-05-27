import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────────
   DONNÉES DE RÉFÉRENCE
   Source : INE Encuesta de Presupuestos Familiares 2023 (Illes Balears)
   https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176806&menu=resultados&secc=1254736195147&idp=1254735976608
   Tarifs transports officiels : EMT Palma (emtpalma.cat) · TIB Baléares (tib.org)
   ───────────────────────────────────────────────────────────────── */

const INE_SOURCE = 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176806&menu=resultados&secc=1254736195147&idp=1254735976608'

const MODES = [
  { id: 'eco', label: 'Économique', emoji: '🌿', desc: 'Marchés locaux, peu de sorties, transport public' },
  { id: 'std', label: 'Standard', emoji: '🌴', desc: 'Vie normale, quelques restos, activités régulières' },
  { id: 'cft', label: 'Confortable', emoji: '✨', desc: 'Bon standing, sorties fréquentes, activités premium' },
]

const LOYER_BASE = {
  1: { eco: 750, std: 1000, cft: 1300 },
  2: { eco: 950, std: 1300, cft: 1700 },
  3: { eco: 1350, std: 1750, cft: 2300 },
  4: { eco: 1700, std: 2200, cft: 3000 },
}

const CHARGES_BASE = { eco: 130, std: 175, cft: 240 }

const ADULTE = {
  eco: { alimentation: 200, restaurants: 55, transport: 120, sante: 65, loisirs: 40, beaute: 40, abonnements: 40, divers: 40 },
  std: { alimentation: 320, restaurants: 175, transport: 210, sante: 90, loisirs: 100, beaute: 85, abonnements: 65, divers: 75 },
  cft: { alimentation: 500, restaurants: 340, transport: 310, sante: 140, loisirs: 220, beaute: 170, abonnements: 100, divers: 145 },
}

// Enfant : coût marginal mensuel par tranche d'âge et mode de vie
const ENFANT = {
  '0-2': { eco: 450, std: 680, cft: 950 },   // crèche/garde + couches + lait
  '3-5': { eco: 120, std: 210, cft: 380 },   // maternelle publique + cantine + activités
  '6-11': { eco: 130, std: 230, cft: 400 },  // primaire + cantine + activités
  '12-17': { eco: 150, std: 270, cft: 450 }, // collège/lycée + transport + sorties
}

const TRANCHES = ['0-2', '3-5', '6-11', '12-17']
const TRANCHE_LABELS = { '0-2': 'Bébé (0–2 ans)', '3-5': 'Maternelle (3–5 ans)', '6-11': 'Primaire (6–11 ans)', '12-17': 'Ado (12–17 ans)' }

const CATS = [
  { id: 'loyer', label: 'Loyer', emoji: '🏠', color: '#7EC8C0', group: 'Logement' },
  { id: 'charges', label: 'Charges (eau, élec, internet)', emoji: '💡', color: '#9dd5ce', group: 'Logement' },
  { id: 'alimentation', label: 'Courses alimentaires', emoji: '🛒', color: '#C76E4E', group: 'Alimentation' },
  { id: 'restaurants', label: 'Restaurants & sorties repas', emoji: '🍽️', color: '#d4886a', group: 'Alimentation' },
  { id: 'transport', label: 'Transport (voiture ou bus)', emoji: '🚗', color: '#b07d2a', group: 'Transport' },
  { id: 'sante', label: 'Santé & mutuelle privée', emoji: '❤️', color: '#e57373', group: 'Santé' },
  { id: 'enfants', label: 'Enfants (garde, activités…)', emoji: '👶', color: '#81b29a', group: 'Famille' },
  { id: 'loisirs', label: 'Loisirs & sport', emoji: '🏄', color: '#2D5016', group: 'Loisirs' },
  { id: 'beaute', label: 'Vêtements & beauté', emoji: '✂️', color: '#9c7c5c', group: 'Perso' },
  { id: 'abonnements', label: 'Téléphone & abonnements', emoji: '📱', color: '#6a8caf', group: 'Perso' },
  { id: 'divers', label: 'Divers & imprévus', emoji: '🎁', color: '#aaa', group: 'Perso' },
]

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

function calcDefaults(adultes, enfants, mode) {
  const base = ADULTE[mode]
  const adultTotal = (k) => base[k] * adultes
  const enfantCost = enfants.reduce((sum, t) => sum + (ENFANT[t]?.[mode] ?? 0), 0)
  const nbPersonnes = adultes + enfants.length
  const loyer = LOYER_BASE[Math.min(nbPersonnes, 4)][mode]
  const charges = CHARGES_BASE[mode]
  return {
    loyer,
    charges,
    alimentation: adultTotal('alimentation'),
    restaurants: adultTotal('restaurants'),
    transport: adultTotal('transport'),
    sante: adultTotal('sante'),
    enfants: enfantCost,
    loisirs: adultTotal('loisirs'),
    beaute: adultTotal('beaute'),
    abonnements: adultTotal('abonnements'),
    divers: adultTotal('divers'),
  }
}

export default function BudgetSimulator() {
  const navigate = useNavigate()

  // ── Étape
  const [step, setStep] = useState(1)

  // ── Composition
  const [adultes, setAdultes] = useState(2)
  const [enfants, setEnfants] = useState([]) // tableau de tranches ex: ['3-5', '6-11']

  // ── Mode de vie
  const [mode, setMode] = useState('std')

  // ── Budget ajustable (null = utilise le default calculé)
  const [overrides, setOverrides] = useState({})

  const defaults = useMemo(() => calcDefaults(adultes, enfants, mode), [adultes, enfants, mode])

  const budget = useMemo(() => {
    const result = {}
    CATS.forEach(c => { result[c.id] = overrides[c.id] ?? defaults[c.id] })
    return result
  }, [defaults, overrides])

  const total = useMemo(() => Object.values(budget).reduce((a, b) => a + b, 0), [budget])

  function resetOverrides() { setOverrides({}) }

  function setVal(id, val) {
    setOverrides(prev => ({ ...prev, [id]: Math.max(0, val) }))
  }

  function addEnfant(tranche) {
    setEnfants(prev => [...prev, tranche])
    setOverrides({})
  }

  function removeEnfant(idx) {
    setEnfants(prev => prev.filter((_, i) => i !== idx))
    setOverrides({})
  }

  function goStep2() { resetOverrides(); setStep(2) }
  function goStep3() { resetOverrides(); setStep(3) }

  // ── Barre de progression
  const maxVal = Math.max(...Object.values(budget), 1)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'var(--foret)', padding: '20px 16px 14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>←</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-titre)', color: '#fff', fontWeight: 600 }}>Budget mensuel</h1>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
              {step === 1 ? 'Étape 1 / 3 — Composition familiale' : step === 2 ? 'Étape 2 / 3 — Mode de vie' : 'Étape 3 / 3 — Mon budget détaillé'}
            </p>
          </div>
          {step === 3 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>Total / mois</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Inter, sans-serif' }}>{fmt(total)}</div>
            </div>
          )}
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ width: s === step ? 24 : 8, height: 6, borderRadius: 3, background: s <= step ? 'var(--vert)' : 'rgba(255,255,255,0.25)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ═══════════════════════════════════
            ÉTAPE 1 — COMPOSITION FAMILIALE
            ═══════════════════════════════════ */}
        {step === 1 && (
          <div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-titre)', fontSize: 17, color: 'var(--foret)' }}>Combien d'adultes ?</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                {[1, 2].map(n => (
                  <button key={n} onClick={() => setAdultes(n)} style={{
                    flex: 1, padding: '14px 0', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: adultes === n ? 700 : 400,
                    background: adultes === n ? 'var(--vert)' : 'var(--gris)',
                    color: adultes === n ? '#fff' : 'var(--noir)',
                    border: adultes === n ? '2px solid var(--vert)' : '2px solid transparent',
                  }}>
                    {n === 1 ? '🧑 Seul(e)' : '👫 En couple'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-titre)', fontSize: 17, color: 'var(--foret)' }}>Enfants à charge</h2>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>Cliquez sur une tranche d'âge pour ajouter un enfant</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {TRANCHES.map(t => (
                  <button key={t} onClick={() => addEnfant(t)} style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer', border: '2px dashed #ccc',
                    background: 'var(--lin)', fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--foret)',
                    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 16 }}>+</span>
                    <span style={{ lineHeight: 1.2, textAlign: 'left' }}>{TRANCHE_LABELS[t]}</span>
                  </button>
                ))}
              </div>

              {enfants.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--foret)', fontFamily: 'Inter, sans-serif' }}>Enfants ajoutés :</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {enfants.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--vert)', borderRadius: 20, padding: '5px 10px' }}>
                        <span style={{ fontSize: 12, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{TRANCHE_LABELS[t]}</span>
                        <button onClick={() => removeEnfant(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enfants.length === 0 && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--texte-sec)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '6px 0' }}>Aucun enfant — modifiez si besoin</p>
              )}
            </div>

            <button onClick={goStep2} style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--foret)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}>
              Continuer → Mode de vie
            </button>
          </div>
        )}

        {/* 2 */}
        {step === 2 && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, textAlign: 'center' }}>
              Choisissez le niveau qui correspond à votre style de vie souhaité à Majorque.
              <br />Les montants sont ajustables à l'étape suivante.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
             {MODES.map(m => {
                const preview = calcDefaults(adultes, enfants, m.id)
                const previewTotal = Object.values(preview).reduce((a, b) => a + b, 0)
                return (
                  <button key={m.id} onClick={() => setMode(m.id)} style={{
                    background: mode === m.id ? 'var(--foret)' : '#fff',
                    border: mode === m.id ? '2px solid var(--foret)' : '2px solid var(--gris)',
                    borderRadius: 14, padding: '16px', cursor: 'pointer', textAlign: 'left',
                    boxShadow: mode === m.id ? '0 2px 8px rgba(45,80,22,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontFamily: 'var(--font-titre)', fontWeight: 600, color: mode === m.id ? '#fff' : 'var(--foret)' }}>
                        {m.emoji} {m.label}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: mode === m.id ? 'var(--gold)' : 'var(--foret)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        ~{fmt(previewTotal)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: mode === m.id ? 'rgba(255,255,255,0.75)' : 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>{m.desc}</p>
                  </button>
                )
              })}
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
              Estimations basées sur · <a href={INE_SOURCE} target="_blank" rel="noreferrer" style={{ color: 'var(--vert)', textDecoration: 'none' }}>INE Encuesta de Presupuestos Familiares 2023</a> · Illes Balears
            </p>

            <button onClick={goStep3} style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--foret)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}>
              Voir mon budget détaillé →
            </button>
          </div>
        )}

        {/* 3 */}
        {step === 3 && (
          <div>
            {/* Récap */}
            <div style={{ background: 'var(--lin)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                {adultes === 1 ? '🧑 Seul(e)' : '👫 En couple'}
                {enfants.length > 0 && ` + ${enfants.length} enfant${enfants.length > 1 ? 's' : ''}`}
              </span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                {MODES.find(m => m.id === mode)?.emoji} {MODES.find(m => m.id === mode)?.label}
              </span>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--vert)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>Modifier</button>
            </div>

            {/* Barres visuelles */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>📊 Répartition mensuelle</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATS.filter(c => budget[c.id] > 0).sort((a, b) => budget[b.id] - budget[a.id]).map(c => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>{c.emoji} {c.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>{fmt(budget[c.id])}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--gris)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(budget[c.id] / maxVal) * 100}%`, background: c.color, borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                Source : <a href={INE_SOURCE} target="_blank" rel="noreferrer" style={{ color: 'var(--vert)', textDecoration: 'none' }}>INE EPF 2023 — Illes Balears</a>
              </p>
            </div>

            {/* Ajustement par poste */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>✏️ Ajuster chaque poste</h2>
                <button onClick={resetOverrides} style={{ fontSize: 11, color: 'var(--vert)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>Réinitialiser</button>
              </div>

              {CATS.map(cat => (
                <div key={cat.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--noir)', fontWeight: 500 }}>{cat.emoji} {cat.label}</label>
                    {overrides[cat.id] !== undefined && <span style={{ fontSize: 10, color: 'var(--terra)', fontFamily: 'Inter, sans-serif' }}>✎ modifié</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(defaults[cat.id] * 3, 200)}
                      step={10}
                      value={budget[cat.id]}
                      onChange={e => setVal(cat.id, Number(e.target.value))}
                      style={{ flex: 1, accentColor: cat.color }}
                    />
                    <input
                      type="number"
                      value={budget[cat.id]}
                      onChange={e => setVal(cat.id, Number(e.target.value))}
                      min={0}
                      style={{
                        width: 72, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 7,
                        fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 600, textAlign: 'right',
                        background: overrides[cat.id] !== undefined ? '#fff8f0' : 'var(--lin)', color: 'var(--noir)',
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', minWidth: 14 }}>€</span>
                  </div>
                  {cat.id === 'loyer' && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      💡 Variation annuelle +12,8 % Illes Balears · Source : <a href="https://www.ine.es/jaxiT3/Datos.htm?t=25171" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)', textDecoration: 'none' }}>INE IPV T3 2025</a>
                    </p>
                  )}
                  {cat.id === 'sante' && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      💡 Résidents UE : accès santé publique avec carte européenne puis tarjeta sanitaria (IBSALUT)
                    </p>
                  )}
                  {cat.id === 'transport' && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      🚌 Abonnement mensuel EMT Palma ~30 ₢ · <a href="https://www.emtpalma.cat/fr/tarifs" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)', textDecoration: 'none' }}>emtpalma.cat/tarifs</a>
                    </p>
                  )}
                  {cat.id === 'enfants' && enfants.length === 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>Aucun enfant déclaré — ajustez si besoin</p>
                  )}
                </div>
              ))}
            </div>

            {/* Total recap */}
            <div style={{ background: 'var(--foret)', borderRadius: 16, padding: '20px 16px', marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-titre)', fontSize: 19, color: '#fff' }}>💶 Mon budget estimé</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {['Logement', 'Alimentation', 'Transport', 'Santé', 'Famille', 'Loisirs', 'Perso'].map(group => {
                  const cats = CATS.filter(c => c.group === group)
                  const groupTotal = cats.reduce((s, c) => s + budget[c.id], 0)
                  if (groupTotal === 0) return null
                  return (
                    <div key={group} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                        {cats[0].emoji} {group}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{fmt(groupTotal)}</span>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 15, color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Total mensuel</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Inter, sans-serif' }}>{fmt(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>Projection annuelle</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>{fmt(total * 12)}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', marginTop: 14 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>💡 Revenu net nécessaire</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  Pour couvrir ce budget + 15 % d'épargne recommandée, viser ≥ <strong style={{ color: '#fff' }}>{fmt(Math.round(total * 1.15))}/mois net</strong>.
                  {' '}En autónomo (régime RETA), prévoyez 41 % supplémentaires pour les charges (IVA, IRPF, cotización).
                </p>
              </div>
            </div>

            {/* Avertissement */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--gris)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                📋 <strong>Sources :</strong> Estimations fondées sur l'<a href={INE_SOURCE} target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>INE Encuesta de Presupuestos Familiares 2023 (Illes Balears)</a>, tarifs officiels <a href="https://www.emtpalma.cat/fr/tarifs" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>EMT Palma</a> et <a href="https://www.tib.org/ca/el-tib/tarifes" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>TIB Baléares</a>. Ce simulateur est indicatif — les dépenses réelles varient selon la zone géographique, la saison et les choix personnels.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
