import React, { useState, useMemo } from 'react'
import AccompagnementBanner from '../components/AccompagnementBanner'
import { useNavigate } from 'react-router-dom'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

/* ─────────────────────────────────────────────────────────────────
   DONNÉES DE RÉFÉRENCE
   Source principale : INE Encuesta de Presupuestos Familiares 2023 (Illes Balears)
   https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176806&menu=resultados&secc=1254736195147&idp=1254735976608
   Transports : EMT Palma (emtpalma.cat) · TIB Baléares (tib.org)
   ScolariTé LFP : Lycée Français de Palma (lfp.edu.es) · barème AEFE Espagne
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

// Coût marginal mensuel enfant hors scolarité (nourriture, vêtements, activités extra)
const ENFANT = {
  '0-2': { eco: 450, std: 680, cft: 950 },
  '3-5': { eco: 90,  std: 150, cft: 280 },
  '6-11': { eco: 95, std: 165, cft: 290 },
  '12-17': { eco: 110, std: 195, cft: 320 },
}

const TRANCHES = ['0-2', '3-5', '6-11', '12-17']
const TRANCHE_LABELS = { '0-2': 'Bébé (0–2 ans)', '3-5': 'Maternelle (3–5 ans)', '6-11': 'Primaire (6–11 ans)', '12-17': 'Ado (12–17 ans)' }

// Frais de scolarité mensuels par type d'école et tranche d'âge
// Sources :
//   Public/concertée : Govern Balear — dades estadístiques ensenyament 2024
//   Lycée Français de Palma : lfp.edu.es — barème AEFE Espagne 2024-2025
//   International : moyenne établissements Baléares (Agora International, Bellver Int'l)
const SCOLARITE = {
  public:        { '3-5': 65,   '6-11': 65,   '12-17': 70   }, // cantina + matériel uniquement
  concertee:     { '3-5': 130,  '6-11': 140,  '12-17': 160  }, // frais association + cantina
  lfp:           { '3-5': 320,  '6-11': 360,  '12-17': 415  }, // Lycée Français de Palma (barème AEFE)
  international: { '3-5': 620,  '6-11': 720,  '12-17': 870  }, // écoles internationales Majorque
}

const ECOLE_OPTIONS = [
  { id: 'public',        label: '🏛️ École publique espagnole', sub: 'Gratuit · cantina ~65–70€/mois' },
  { id: 'concertee',     label: '✝️ École concertée / privée', sub: '~130–160€/mois (frais association + cantina)' },
  { id: 'lfp',           label: '🇫🇷 Lycée Français de Palma',  sub: '~320–415€/mois · barème AEFE 2024-2025' },
  { id: 'international', label: '🌍 École internationale',     sub: '~620–870€/mois (Agora, Bellver…)' },
]

const CATS = [
  { id: 'loyer',        label: 'Loyer',                          emoji: '🏡', color: '#e07a5f', group: 'Logement' },
  { id: 'charges',      label: 'Charges (eau, élec, internet)',  emoji: '💡', color: '#f2cc8f', group: 'Logement' },
  { id: 'alimentation', label: 'Alimentation (courses)',         emoji: '🛒', color: '#81b29a', group: 'Alimentation' },
  { id: 'restaurants',  label: 'Restaurants & cafés',            emoji: '🍽️', color: '#a8dadc', group: 'Alimentation' },
  { id: 'transport',    label: 'Transport',                      emoji: '🚌', color: '#457b9d', group: 'Transport' },
  { id: 'sante',        label: 'Santé & pharmacie',              emoji: '💊', color: '#e63946', group: 'Santé' },
  { id: 'enfants',      label: 'Enfants (vie courante)',         emoji: '👶', color: '#81b29a', group: 'Famille' },
  { id: 'scolarite',    label: 'Scolarité',                      emoji: '📚', color: '#2d6a4f', group: 'Famille' },
  { id: 'loisirs',      label: 'Loisirs & sorties',              emoji: '🏖️', color: '#48cae4', group: 'Loisirs' },
  { id: 'beaute',       label: 'Beauté & coiffure',              emoji: '💇', color: '#cdb4db', group: 'Perso' },
  { id: 'abonnements',  label: 'Abonnements (streaming…)',       emoji: '📱', color: '#9b5de5', group: 'Perso' },
  { id: 'divers',       label: 'Divers & imprévus',              emoji: '🎲', color: '#f77f00', group: 'Perso' },
]

function calcDefaults(adultes, enfants, mode, ecoleType) {
  const loyer = LOYER_BASE[Math.min(adultes + Math.ceil(enfants.length / 2), 4)]?.[mode] ?? LOYER_BASE[4][mode]
  const charges = CHARGES_BASE[mode]
  const adulteCosts = ADULTE[mode]
  const nbAdultes = adultes

  const baseEnfants = enfants.reduce((sum, t) => sum + (ENFANT[t]?.[mode] ?? 0), 0)

  // Scolarité : uniquement pour les enfants d'âge scolaire (3-17 ans)
  const scolTranches = enfants.filter(t => t !== '0-2')
  const scolarite = scolTranches.reduce((sum, t) => sum + (SCOLARITE[ecoleType]?.[t] ?? 0), 0)

  return {
    loyer,
    charges,
    alimentation: Math.round(adulteCosts.alimentation * nbAdultes),
    restaurants:  Math.round(adulteCosts.restaurants  * nbAdultes),
    transport:    Math.round(adulteCosts.transport    * nbAdultes),
    sante:        Math.round((adulteCosts.sante + 15 * enfants.length) * nbAdultes),
    enfants:      baseEnfants,
    scolarite,
    loisirs:      Math.round(adulteCosts.loisirrs  * nbAdultes),
    beaute:       Math.round(adulteCosts.beaute   * nbAdultes),
    abonnements:  Math.round(adulteCosts.abonnements * nbAdultes),
    divers:       Math.round(adulteCosts.divers   * nbAdultes),
  }
}

const fmt = n => `${Math.round(n).toLocaleString('fr-FR')} €`

export default function BudgetSimulator() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [adultes, setAdultes] = useState(2)
  const [enfants, setEnfants] = useState([])
  const [ecoleType, setEcoleType] = useState('public')
  const [mode, setMode]       = useState(null)
  const [overrides, setOverrides] = useState({})

  const hasScolaires = enfants.some(t => t !== '0-2')

  const defaults = useMemo(
    () => calcDefaults(adultes, enfants, mode || 'std', ecoleType),
    [adultes, enfants, mode, ecoleType]
  )

  const budget = useMemo(() => {
    const base = defaults
    const merged = {}
    for (const k of Object.keys(base)) {
      merged[k] = overrides[k] !== undefined ? overrides[k] : base[k]
    }
    return merged
  }, [defaults, overrides])

  const total = useMemo(() => Object.values(budget).reduce((a, b) => a + b, 0), [budget])
  const maxVal = useMemo(() => Math.max(...Object.values(budget)), [budget])

  function setVal(id, v) { setOverrides(o => ({ ...o, [id]: Math.max(0, v) })) }
  function resetOverrides() { setOverrides({}) }

  function addEnfant(tranche) {
    setEnfants(prev => [...prev, tranche])
  }
  function removeEnfant(i) {
    setEnfants(prev => prev.filter((_, idx) => idx !== i))
  }

  const visibleCats = CATS.filter(c => {
    if (c.id === 'enfants' && enfants.length === 0) return false
    if (c.id === 'scolarite' && !hasScolaires) return false
    return true
  })

  /* ── RENDER ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: step === 3 ? 120 : 80 }}>
      {/* Header */}
      <div style={{ background: 'var(--foret)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-titre)', color: '#fff', fontWeight: 600 }}>Budget mensuel</h1>
        {step === 3 && (
          <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Inter, sans-serif' }}>{fmt(total)}</span>
        )}
      </div>

      <div style={{ padding: '16px', maxWidth: 540, margin: '0 auto' }}>

        {/* ── STEP 1 : Composition ── */}
        {step === 1 && (
          <div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>Étape 1 / 3 — Composition familiale</h2>

              {/* Adultes */}
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>Combien d'adultes ?</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[{ n: 1, label: '🧑 Seul(e)' }, { n: 2, label: '👫 En couple' }].map(o => (
                  <button key={o.n} onClick={() => setAdultes(o.n)} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${adultes === o.n ? 'var(--vert)' : '#ddd'}`,
                    background: adultes === o.n ? 'var(--vert)' : '#fff', color: adultes === o.n ? '#fff' : 'var(--noir)',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, cursor: 'pointer', fontWeight: adultes === o.n ? 700 : 400,
                  }}>{o.label}</button>
                ))}
              </div>

              {/* Enfants */}
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>Enfants à charge</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>Cliquez sur une tranche d'âge pour ajouter un enfant</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {TRANCHES.map(t => (
                  <button key={t} onClick={() => addEnfant(t)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                    borderRadius: 10, border: '1.5px solid var(--gris)', background: 'var(--lin)',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>
                    <span style={{ fontSize: 16 }}>+</span>
                    <span style={{ lineHeight: 1.2, textAlign: 'left', fontSize: 12, color: 'var(--noir)' }}>{TRANCHE_LABELS[t]}</span>
                  </button>
                ))}
              </div>
              {enfants.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {enfants.map((t, i) => (
                    <button key={i} onClick={() => removeEnfant(i)} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                      borderRadius: 20, background: 'var(--foret)', border: 'none', cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 12, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{TRANCHE_LABELS[t]}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>✕</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--texte-sec)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '6px 0' }}>
                  Aucun enfant — modifiez si besoin
                </p>
              )}
            </div>

            {/* Choix d'école — visible seulement si enfants d'âge scolaire */}
            {hasScolaires && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>🏫 Type d'école</h2>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                  Pour {enfants.filter(t => t !== '0-2').length} enfant{enfants.filter(t => t !== '0-2').length > 1 ? 's' : ''} d'âge scolaire
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ECOLE_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setEcoleType(opt.id)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '11px 14px', borderRadius: 11,
                      border: `2px solid ${ecoleType === opt.id ? 'var(--vert)' : '#ddd'}`,
                      background: ecoleType === opt.id ? '#f0faf9' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--noir)' }}>{opt.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  📋 Sources : <a href="https://www.lfp.edu.es" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>Lycée Français de Palma</a> (barème AEFE 2024-2025) · Govern Balear Educació
                </p>
              </div>
            )}

            <button onClick={() => setStep(2)} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'var(--foret)', color: '#fff', fontSize: 15, fontWeight: 700,
              fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}>
              Choisir mon mode de vie →
            </button>
          </div>
        )}

        {/* ── STEP 2 : Mode de vie ── */}
        {step === 2 && (
          <div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>Étape 2 / 3 — Mode de vie</h2>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                {adultes === 1 ? '🧑 Seul(e)' : '👫 En couple'}
                {enfants.length > 0 && ` + ${enfants.length} enfant${enfants.length > 1 ? 's' : ''}`}
                {hasScolaires && ` · ${ECOLE_OPTIONS.find(o => o.id === ecoleType)?.label}`}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MODES.map(m => {
                  const preview = calcDefaults(adultes, enfants, m.id, ecoleType)
                  const previewTotal = Object.values(preview).reduce((a, b) => a + b, 0)
                  return (
                    <button key={m.id} onClick={() => setMode(m.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px',
                      borderRadius: 12, border: `2px solid ${mode === m.id ? 'var(--vert)' : '#ddd'}`,
                      background: mode === m.id ? '#f0faf9' : '#fff', cursor: 'pointer', textAlign: 'left',
                    }}>
                      <span style={{ fontSize: 28 }}>{m.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--noir)', fontSize: 14 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{m.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foret)', fontFamily: 'Inter, sans-serif' }}>{fmt(previewTotal)}</div>
                        <div style={{ fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>/mois</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => { if (!mode) setMode('std'); setStep(3) }}
              disabled={false}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--foret)', color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>
              Voir le détail et ajuster →
            </button>
          </div>
        )}

        {/* ── STEP 3 : Ajustement ── */}
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
              {hasScolaires && (
                <span style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif' }}>
                  {ECOLE_OPTIONS.find(o => o.id === ecoleType)?.label.split(' ').slice(0, 3).join(' ')}
                </span>
              )}
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--vert)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>Modifier</button>
            </div>

            {/* Barres visuelles */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)' }}>📊 Répartition mensuelle</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleCats.filter(c => budget[c.id] > 0).sort((a, b) => budget[b.id] - budget[a.id]).map(c => (
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

              {visibleCats.map(cat => (
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
                      🚌 Abonnement mensuel EMT Palma ~30 € · <a href="https://www.emtpalma.cat/fr/tarifs" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)', textDecoration: 'none' }}>emtpalma.cat/tarifs</a>
                    </p>
                  )}
                  {cat.id === 'scolarite' && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      🏫 {ECOLE_OPTIONS.find(o => o.id === ecoleType)?.label} — {ECOLE_OPTIONS.find(o => o.id === ecoleType)?.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Total récapitulatif */}
            <div style={{ background: 'var(--foret)', borderRadius: 16, padding: '20px 16px', marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-titre)', fontSize: 19, color: '#fff' }}>💶 Mon budget estimé</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {['Logement', 'Alimentation', 'Transport', 'Santé', 'Famille', 'Loisirs', 'Perso'].map(group => {
                  const cats = visibleCats.filter(c => c.group === group)
                  const groupTotal = cats.reduce((s, c) => s + (budget[c.id] || 0), 0)
                  if (groupTotal === 0) return null
                  return (
                    <div key={group} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                        {cats[0]?.emoji} {group}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{fmt(groupTotal)}</span>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Total mensuel</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)', fontFamily: 'Inter, sans-serif' }}>{fmt(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>Soit par an</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif' }}>{fmt(total * 12)}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', marginTop: 14 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>💡 Revenu net nécessaire</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  Budget + 15 % d'épargne → viser ≥ <strong style={{ color: '#fff' }}>{fmt(Math.round(total * 1.15))}/mois net</strong>.
                  {' '}En autónomo (RETA), prévoir 41 % supplémentaires (IVA + IRPF + cotización).
                </p>
              </div>
            </div>

            {/* Sources */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--gris)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--texte-sec)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                📋 <strong>Sources :</strong> <a href={INE_SOURCE} target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>INE EPF 2023 — Illes Balears</a> · <a href="https://www.emtpalma.cat/fr/tarifs" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>EMT Palma</a> · <a href="https://www.tib.org/ca/el-tib/tarifes" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>TIB Baléares</a> · <a href="https://www.lfp.edu.es" target="_blank" rel="noreferrer" style={{ color: 'var(--vert)' }}>LFP — barème AEFE 2024-2025</a>. Ce simulateur est indicatif.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ── BARRE STICKY TOTAL (step 3 uniquement) ── */}
      {step === 3 && (
        <div style={{
          position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 20,
          background: 'var(--foret)', boxShadow: '0 -2px 12px rgba(0,0,0,0.2)',
          padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total mensuel</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }}>{fmt(total)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>Par an</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif' }}>{fmt(total * 12)}</div>
          </div>
        </div>
      )}

      <AccompagnementBanner
        texte="Ces chiffres soulèvent des questions sur votre projet ? Je peux vous aider à valider votre budget et votre situation avant de vous lancer."
        cta="Réserver une visio conseil →"
        style={{ marginBottom: 80 }}
      />
    </div>
  )
}
