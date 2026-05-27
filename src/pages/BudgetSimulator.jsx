import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   DONNÃES DE RÃFÃRENCE
   Source : INE Encuesta de Presupuestos Familiares 2023 (Illes Balears)
   https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176806&menu=resultados&secc=1254736195147&idp=1254735976608
   Tarifs transports officiels : EMT Palma (emtpalma.cat) Â· TIB BalÃ©ares (tib.org)
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const INE_SOURCE = 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176806&menu=resultados&secc=1254736195147&idp=1254735976608'

const MODES = [
  { id: 'eco', label: 'Ãconomique', emoji: 'ð¿', desc: 'MarchÃ©s locaux, peu de sorties, transport public' },
  { id: 'std', label: 'Standard', emoji: 'ð´', desc: 'Vie normale, quelques restos, activitÃ©s rÃ©guliÃ¨res' },
  { id: 'cft', label: 'Confortable', emoji: 'â¨', desc: 'Bon standing, sorties frÃ©quentes, activitÃ©s premium' },
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

// Enfant : coÃ»t marginal mensuel par tranche d'Ã¢ge et mode de vie
const ENFANT = {
  '0-2': { eco: 450, std: 680, cft: 950 },   // crÃ¨che/garde + couches + lait
  '3-5': { eco: 120, std: 210, cft: 380 },   // maternelle publique + cantine + activitÃ©s
  '6-11': { eco: 130, std: 230, cft: 400 },  // primaire + cantine + activitÃ©s
  '12-17': { eco: 150, std: 270, cft: 450 }, // collÃ¨ge/lycÃ©e + transport + sorties
}

const TRANCHES = ['0-2', '3-5', '6-11', '12-17']
const TRANCHE_LABELS = { '0-2': 'BÃ©bÃ© (0â2 ans)', '3-5': 'Maternelle (3â5 ans)', '6-11': 'Primaire (6â11 ans)', '12-17': 'Ado (12â17 ans)' }

const CATS = [
  { id: 'loyer', label: 'Loyer', emoji: 'ð ', color: '#7EC8C0', group: 'Logement' },
  { id: 'charges', label: 'Charges (eau, Ã©lec, internet)', emoji: 'ð¡', color: '#9dd5ce', group: 'Logement' },
  { id: 'alimentation', label: 'Courses alimentaires', emoji: 'ð', color: '#C76E4E', group: 'Alimentation' },
  { id: 'restaurants', label: 'Restaurants & sorties repas', emoji: 'ð½ï¸', color: '#d4886a', group: 'Alimentation' },
  { id: 'transport', label: 'Transport (voiture ou bus)', emoji: 'ð', color: '#b07d2a', group: 'Transport' },
  { id: 'sante', label: 'SantÃ© & mutuelle privÃ©e', emoji: 'â¤ï¸', color: '#e57373', group: 'SantÃ©' },
  { id: 'enfants', label: 'Enfants (garde, activitÃ©sâ¦)', emoji: 'ð¶', color: '#81b29a', group: 'Famille' },
  { id: 'loisirs', label: 'Loisirs & sport', emoji: 'ð', color: '#2D5016', group: 'Loisirs' },
  { id: 'beaute', label: 'VÃªtements & beautÃ©', emoji: 'âï¸', color: '#9c7c5c', group: 'Perso' },
  { id: 'abonnements', label: 'TÃ©lÃ©phone & abonnements', emoji: 'ð±', color: '#6a8caf', group: 'Perso' },
  { id: 'divers', label: 'Divers & imprÃ©vus', emoji: 'ð', color: '#aaa', group: 'Perso' },
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

  // ââ Ãtape
  const [step, setStep] = useState(1)

  // ââ Composition
  const [adultes, setAdultes] = useState(2)
  const [enfants, setEnfants] = useState([]) // tableau de tranches ex: ['3-5', '6-11']

  // ââ Mode de vie
  const [mode, setMode] = useState('std')

  // ââ Budget ajustable (null = utilise le default calculÃ©)
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

  // ââ Barre de progression
  const maxVal = Math.max(...Object.values(budget), 1)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'var(--foret)', padding: '20px 16px 14px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>â</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-titre)', color: '#fff', fontWeight: 600 }}>Budget mensuel</h1>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
              {step === 1 ? 'Ãtape 1 / 3 â Composition familiale' : step === 2 ? 'Ãtape 2 / 3 â Mode de vie' : 'Ãtape 3 / 3 â Mon budget dÃ©taillÃ©'}
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
        <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent