import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { TERRA, VERT } from '../components/WaveTitle'
import AccompagnementBanner from '../components/AccompagnementBanner'

const FORET = '#0F3D35'
const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/*
 * Sources juridiques :
 * Convention fiscale France-Espagne (BOE-A-1995-25511, JORF 1er avril 1996)
 *   art. 17 : pensions privées → imposables en Espagne si résident fiscal ES
 *   art. 19 : pensions publiques (fonctionnaires État) → imposables en France même si résident ES
 *   art. 18 : pensions Sécu → imposables en Espagne
 * Conventions Belgique-Espagne (BOE-A-1972-802) et Suisse-Espagne (BOE-A-1967-16078) : mêmes principes
 * Règlement UE 883/2004 : formulaire S1 = accès soins ES pris en charge par pays d'origine
 * Règlement UE 987/2009 : procédure S1
 * LIRPF (Ley 35/2006) art. 14, 17, 20, 57 : règles IRPF résidents
 * Ley Beckham (art. 93 LIRPF) : régime spécial — non applicable aux retraités "classiques"
 */

const PAYS = [
  { id: 'france',   label: '🇫🇷 France',   convention: true,  fonctEtat: 'art19_france' },
  { id: 'belgique', label: '🇧🇪 Belgique', convention: true,  fonctEtat: 'art19_belgique' },
  { id: 'suisse',   label: '🇨🇭 Suisse',   convention: true,  fonctEtat: 'art19_suisse' },
  { id: 'quebec',   label: '🇨🇦 Québec',   convention: true,  fonctEtat: 'art19_canada' },
  { id: 'luxembourg', label: '🇱🇺 Luxembourg', convention: true, fonctEtat: 'art19_luxembourg' },
  { id: 'autre',    label: '🌍 Autre pays', convention: false, fonctEtat: null },
]

const TYPE_RETRAITE = [
  {
    id: 'salarie_prive',
    label: 'Salarié privé',
    desc: 'Retraite complémentaire AGIRC-ARRCO, caisse privée, mutuelle entreprise',
    imposable_es: true,
    note: null,
  },
  {
    id: 'salarie_public',
    label: 'Fonctionnaire d\'État',
    desc: 'Fonction publique d\'État (enseignant, magistrat, militaire, diplomate…)',
    imposable_es: false,
    note: 'art. 19 convention',
  },
  {
    id: 'fonct_territorial',
    label: 'Fonctionnaire territorial / hospitalier',
    desc: 'Collectivités locales, hôpitaux publics — CNRACL',
    imposable_es: true,
    note: 'Imposable en Espagne — vérifier votre caisse',
  },
  {
    id: 'independant',
    label: 'Indépendant / libéral',
    desc: 'RSI / SSI, CIPAV, CARPIMKO, CARMF, CARCDSF…',
    imposable_es: true,
    note: null,
  },
  {
    id: 'retraite_base',
    label: 'Retraite de base uniquement',
    desc: 'Régime général Sécu uniquement, sans complémentaire',
    imposable_es: true,
    note: null,
  },
]

// Tranches IRPF 2024 (État + communauté autonome Baléares — taux combiné)
const TRANCHES_IRPF = [
  { max: 12450,  taux: 0.19 },
  { max: 20200,  taux: 0.24 },
  { max: 35200,  taux: 0.30 },
  { max: 60000,  taux: 0.37 },
  { max: 300000, taux: 0.45 },
  { max: Infinity, taux: 0.47 },
]

function calcIRPF(base) {
  if (base <= 0) return 0
  let impot = 0
  let prev = 0
  for (const t of TRANCHES_IRPF) {
    if (base <= prev) break
    const portion = Math.min(base, t.max) - prev
    impot += portion * t.taux
    prev = t.max
  }
  return Math.round(impot)
}

// Réduction rendimientos del trabajo (art. 20 LIRPF)
function reductionTravail(brut) {
  if (brut <= 13115) return 5565
  if (brut <= 16825) return Math.round(5565 - 1.5 * (brut - 13115))
  return 0
}

// Mínimo personal (art. 57 LIRPF) — 5550 + 1150 si plus de 65 ans = 6700
const MINIMO_PERSONAL = 6700

const BADGE = ({ color, bg, children }) => (
  <span style={{
    display: 'inline-block',
    fontSize: 11, fontWeight: 700,
    color, background: bg,
    padding: '3px 10px', borderRadius: 20,
    fontFamily: 'var(--font-corps)',
  }}>{children}</span>
)

const InfoBox = ({ icon, title, children, color = VERT }) => (
  <div style={{
    background: `${color}0D`, border: `1px solid ${color}30`,
    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
  }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 6, fontFamily: 'var(--font-corps)' }}>
      {icon} {title}
    </p>
    <div style={{ fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.65, fontFamily: 'var(--font-corps)' }}>
      {children}
    </div>
  </div>
)

const SourceBadge = ({ text }) => (
  <span style={{
    fontSize: 10, background: 'var(--gris)', color: 'var(--texte-sec)',
    border: '1px solid #D4CCC2', padding: '1px 7px', borderRadius: 4,
    fontFamily: 'var(--font-corps)', marginLeft: 4, whiteSpace: 'nowrap',
    display: 'inline-block', verticalAlign: 'middle',
  }}>{text}</span>
)

export default function RetraiteSimulator() {
  const navigate = useNavigate()
  useSEO({
    title: "Ma retraite change-t-elle si je pars en Espagne ? — Simulateur",
    description: "Convention fiscale franco-espagnole, impôts sur la pension en Espagne, formulaire S1, fiscalité des fonctionnaires. Tout ce qui change (ou pas) quand vous partez à Majorque à la retraite.",
    url: "https://vivre-a-majorque.vercel.app/app/outils/retraite",
  })

  const [pays, setPays] = useState('france')
  const [typeRetraite, setTypeRetraite] = useState(null)
  const [pension, setPension] = useState(1800)
  const [autreRevenu, setAutreRevenu] = useState(0)
  const [step, setStep] = useState(1) // 1 = pays, 2 = type, 3 = montant, 4 = résultat

  const paysData = PAYS.find(p => p.id === pays)
  const typeData = TYPE_RETRAITE.find(t => t.id === typeRetraite)

  const result = useMemo(() => {
    if (!typeData || step < 4) return null

    const pensionAnnuelle = pension * 12
    const autreAnnuel = autreRevenu * 12
    const totalBrut = pensionAnnuelle + autreAnnuel

    const imposableES = typeData.imposable_es && paysData?.convention

    // Si imposable en Espagne : calcul IRPF
    const redTravail = imposableES ? reductionTravail(pensionAnnuelle) : 0
    const baseImposable = imposableES ? Math.max(0, totalBrut - redTravail - MINIMO_PERSONAL) : 0
    const irpfAnnuel = imposableES ? calcIRPF(baseImposable) : 0
    const irpfMensuel = Math.round(irpfAnnuel / 12)

    // Taux effectif
    const txEffectif = totalBrut > 0 ? (irpfAnnuel / totalBrut * 100).toFixed(1) : 0

    // Estimation impôt en France (approximatif — barème 2024 IR)
    // On suppose pension seule, déclaration individuelle, abattement 10% plafonné
    const abattementFR = Math.min(pensionAnnuelle * 0.10, 4123)
    const baseFR = Math.max(0, pensionAnnuelle - abattementFR)
    const TRANCHES_FR = [
      { max: 11294, taux: 0 },
      { max: 28797, taux: 0.11 },
      { max: 82341, taux: 0.30 },
      { max: 177106, taux: 0.41 },
      { max: Infinity, taux: 0.45 },
    ]
    let irFR = 0; let prevFR = 0
    for (const t of TRANCHES_FR) {
      if (baseFR <= prevFR) break
      irFR += (Math.min(baseFR, t.max) - prevFR) * t.taux
      prevFR = t.max
    }
    // Décote et réductions — simplifiées
    const irFRAnnuel = Math.round(irFR * 0.9) // approximation décote
    const irFRMensuel = Math.round(irFRAnnuel / 12)

    const netES = pension + autreRevenu - irpfMensuel
    const netFR = pension - irFRMensuel

    const diff = netES - netFR
    const gain = diff > 0

    return {
      imposableES,
      baseImposable,
      irpfAnnuel,
      irpfMensuel,
      irFRAnnuel,
      irFRMensuel,
      netES,
      netFR,
      diff,
      gain,
      txEffectif,
      txFR: totalBrut > 0 ? (irFRAnnuel / pensionAnnuelle * 100).toFixed(1) : 0,
    }
  }, [typeData, paysData, pension, autreRevenu, step])

  const btnStyle = (active) => ({
    width: '100%', padding: '12px 14px',
    borderRadius: 10, cursor: 'pointer', textAlign: 'left',
    border: `1.5px solid ${active ? FORET : 'var(--gris)'}`,
    background: active ? `${FORET}08` : '#fff',
    fontFamily: 'var(--font-corps)', fontSize: 14,
    color: FORET, marginBottom: 8,
    display: 'flex', flexDirection: 'column', gap: 2,
  })

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
          s'installer à Majorque
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: FORET, lineHeight: 1.15, marginBottom: 6 }}>
          Ma retraite change-t-elle si je pars en Espagne ?
        </h1>
        <div style={{ width: 36, height: 3, background: VERT, borderRadius: 2, marginBottom: 14 }} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.6 }}>
          Le montant de votre pension ne change pas. Ce qui change, c'est où et comment vous êtes imposé. En quelques étapes, on démêle ça pour votre situation.
        </p>
      </div>

      {/* ÉTAPE 1 — Pays d'origine */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: 12, fontWeight: 700, color: 'var(--texte-sec)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Étape 1 — Votre pays de résidence actuel
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PAYS.map(p => (
            <button
              key={p.id}
              onClick={() => { setPays(p.id); if (step < 2) setStep(2) }}
              style={{
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${pays === p.id ? FORET : 'var(--gris)'}`,
                background: pays === p.id ? `${FORET}08` : '#fff',
                fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: pays === p.id ? 700 : 400,
                color: FORET, textAlign: 'left',
              }}
            >{p.label}</button>
          ))}
        </div>
        {pays === 'autre' && (
          <div style={{ background: '#FEF3E7', border: '1px solid rgba(176,100,42,0.25)', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>
            <p style={{ fontSize: 13, color: '#7a4510', fontFamily: 'var(--font-corps)' }}>
              Votre pays a probablement une convention fiscale avec l'Espagne, mais je n'ai pas les détails précis. Les principes généraux s'appliquent, mais vérifiez avec un gestor.
            </p>
          </div>
        )}
      </div>

      {/* ÉTAPE 2 — Type de retraite */}
      {step >= 2 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-corps)', fontSize: 12, fontWeight: 700, color: 'var(--texte-sec)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Étape 2 — Type de retraite
          </p>
          {TYPE_RETRAITE.map(t => (
            <button
              key={t.id}
              onClick={() => { setTypeRetraite(t.id); if (step < 3) setStep(3) }}
              style={btnStyle(typeRetraite === t.id)}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: FORET }}>{t.label}</span>
              <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{t.desc}</span>
              {t.note && (
                <span style={{ fontSize: 11, color: TERRA, fontWeight: 600, marginTop: 2 }}>
                  ⚠️ {t.note}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ÉTAPE 3 — Montant */}
      {step >= 3 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-corps)', fontSize: 12, fontWeight: 700, color: 'var(--texte-sec)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Étape 3 — Montant de la pension
          </p>
          <div style={{ background: '#fff', border: '1px solid var(--gris)', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8 }}>Pension brute mensuelle</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: FORET, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
              {fmt(pension)}<span style={{ fontSize: 14, fontWeight: 400 }}>/mois</span>
            </p>
            <input
              type="range" min={500} max={6000} step={50} value={pension}
              onChange={e => setPension(+e.target.value)}
              style={{ width: '100%', accentColor: FORET, marginBottom: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--texte-sec)', marginBottom: 16 }}>
              <span>500 €</span><span>6 000 €</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8 }}>Autre revenu mensuel (loyer, placement, autre pension…)</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: FORET, fontFamily: 'var(--font-corps)', marginBottom: 8 }}>
              {fmt(autreRevenu)}/mois
            </p>
            <input
              type="range" min={0} max={3000} step={50} value={autreRevenu}
              onChange={e => setAutreRevenu(+e.target.value)}
              style={{ width: '100%', accentColor: FORET, marginBottom: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--texte-sec)', marginBottom: 16 }}>
              <span>0 €</span><span>3 000 €</span>
            </div>

            <button
              onClick={() => setStep(4)}
              style={{
                width: '100%', padding: '13px', background: FORET,
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-corps)',
              }}
            >
              Voir ma situation →
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 4 — Résultat */}
      {step >= 4 && result && typeData && (
        <div>
          {/* --- CAS 1 : fonctionnaire d'État → imposable en France ---  */}
          {!result.imposableES && (
            <div>
              <div style={{ background: `${VERT}10`, border: `1px solid ${VERT}35`, borderRadius: 14, padding: '18px', marginBottom: 16 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: FORET, marginBottom: 8 }}>
                  Votre pension reste imposée en France
                </p>
                <p style={{ fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.65 }}>
                  En tant que fonctionnaire d'État, même si vous êtes résident fiscal en Espagne, votre pension reste imposable en France. C'est l'article 19 de la convention fiscale franco-espagnole.
                  <SourceBadge text="Art. 19 convention FR-ES" />
                </p>
              </div>
              <InfoBox icon="✅" title="Ce qui ne change pas" color={VERT}>
                <p>Votre pension est versée par la même caisse, au même montant. L'impôt est prélevé en France comme avant. Vous n'avez pas de déclaration IRPF espagnole à faire pour cette pension.</p>
              </InfoBox>
              <InfoBox icon="⚠️" title="Ce qui change quand même" color={TERRA}>
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Vous devez déclarer votre résidence fiscale en Espagne si vous y passez plus de 183 jours/an</li>
                  <li>La pension est <strong>exonérée en Espagne</strong> mais doit être déclarée dans votre déclaration IRPF (case "rentas exentas")</li>
                  <li>Si vous avez d'autres revenus (loyers, placements), ceux-ci peuvent être imposables en Espagne</li>
                  <li>Vous devez continuer à déposer votre déclaration en France</li>
                </ul>
              </InfoBox>
              <InfoBox icon="🏥" title="La santé avec le formulaire S1" color={VERT}>
                <p>En tant que retraité de la fonction publique française, vous avez droit au formulaire S1. Demandez-le à l'ANFH ou à votre caisse de retraite avant de partir. Il vous donne accès aux soins espagnols pris en charge par la France.
                  <SourceBadge text="Règlement UE 883/2004" />
                </p>
              </InfoBox>
            </div>
          )}

          {/* --- CAS 2 : imposable en Espagne --- */}
          {result.imposableES && (
            <div>
              {/* Résumé chiffré */}
              <div style={{ background: '#fff', border: '1px solid var(--gris)', borderRadius: 14, padding: '18px', marginBottom: 14 }}>
                <p style={{ fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 700, color: 'var(--texte-sec)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Comparaison net mensuel
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#F7F2EB', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginBottom: 6 }}>En France</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: FORET, fontFamily: 'var(--font-display)' }}>{fmt(result.netFR)}</p>
                    <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 4 }}>IR ≈ {fmt(result.irFRMensuel)}/mois ({result.txFR}%)</p>
                  </div>
                  <div style={{ background: `${VERT}10`, border: `1px solid ${VERT}30`, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginBottom: 6 }}>En Espagne</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: result.gain ? VERT : TERRA, fontFamily: 'var(--font-display)' }}>{fmt(result.netES)}</p>
                    <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 4 }}>IRPF ≈ {fmt(result.irpfMensuel)}/mois ({result.txEffectif}%)</p>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: result.gain ? `${VERT}10` : `${TERRA}10`,
                  border: `1px solid ${result.gain ? VERT : TERRA}30`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 22 }}>{result.gain ? '📈' : '📉'}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: FORET }}>
                      {result.gain ? `+${fmt(result.diff)}/mois en Espagne` : `${fmt(result.diff)}/mois en Espagne`}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                      {result.gain
                        ? 'La fiscalité espagnole est plus avantageuse pour votre profil'
                        : 'La fiscalité française reste légèrement plus favorable — mais d\'autres facteurs comptent'}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: 'var(--texte-sec)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                  Estimation indicative. IR France calculé au barème 2024 avec abattement 10%. IRPF Espagne : réductions art. 20 + mínimo personal art. 57 LIRPF. Hors cotisations sociales résiduelles éventuelles. Consultez un gestor pour votre situation exacte.
                </p>
              </div>

              {/* Ce qui change */}
              <InfoBox icon="🔄" title="Ce qui change concrètement" color={VERT}>
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <li>Vous devenez <strong>résident fiscal espagnol</strong> après 183 jours/an en Espagne</li>
                  <li>Votre pension est imposée en Espagne via l'IRPF — vous faites une déclaration annuelle (la "renta") entre avril et juin</li>
                  <li>La France cesse de prélever l'impôt à la source — vous signalez votre départ à votre centre des impôts</li>
                  <li>Vos revenus mondiaux sont déclarés en Espagne (convention de non-double imposition appliquée)
                    <SourceBadge text="Art. 17 convention FR-ES" />
                  </li>
                </ul>
              </InfoBox>

              {/* Ce qui ne change pas */}
              <InfoBox icon="✅" title="Ce qui ne change pas" color={FORET}>
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <li><strong>Le montant de votre pension</strong> — il est fixé définitivement par votre caisse de retraite</li>
                  <li>La caisse qui verse (CNAV, AGIRC-ARRCO…) continue à virer sur votre compte</li>
                  <li>Vos droits acquis en France restent acquis</li>
                  <li>Aucune nouvelle cotisation à payer en Espagne sur votre pension</li>
                </ul>
              </InfoBox>

              {/* Santé */}
              <InfoBox icon="🏥" title="La santé : le formulaire S1" color="#2D7BA5">
                <p style={{ marginBottom: 8 }}>
                  Votre droit : en tant que retraité percevant une pension d'un pays UE, vous avez droit au formulaire S1.
                  <SourceBadge text="Règlement UE 883/2004" />
                </p>
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Le S1 s'obtient auprès de votre caisse d'assurance maladie <strong>avant de partir</strong></li>
                  <li>Il vous donne accès aux soins en Espagne, pris en charge par votre caisse française</li>
                  <li>Vous vous inscrivez ensuite à l'INSS espagnol pour recevoir votre carte SIP (l'équivalent de la carte Vitale)</li>
                  <li>Résultat : couverture maladie complète en Espagne, sans payer de cotisation supplémentaire</li>
                </ul>
              </InfoBox>

              {/* Démarches */}
              <div style={{ background: '#fff', border: '1px solid var(--gris)', borderRadius: 14, padding: '18px', marginBottom: 14 }}>
                <p style={{ fontFamily: 'var(--font-corps)', fontSize: 14, fontWeight: 700, color: FORET, marginBottom: 14 }}>
                  📋 Les démarches dans l'ordre
                </p>
                {[
                  { n: 1, titre: 'Demandez le formulaire S1', detail: 'À votre CPAM ou MSA, avant le départ. Délai : 2-4 semaines.' },
                  { n: 2, titre: 'Obtenez le NIE en Espagne', detail: 'Obligatoire pour tout. Consulat espagnol en France ou Policía Nacional à Majorque.' },
                  { n: 3, titre: 'Signalez votre départ aux impôts français', detail: 'Formulaire 2042 NR l\'année du départ. Centre des impôts des non-résidents (DINR).' },
                  { n: 4, titre: 'Inscrivez-vous à l\'INSS espagnol', detail: 'Avec votre S1 + NIE + acte de naissance traduit. Vous recevez la carte SIP sous 3-6 semaines.' },
                  { n: 5, titre: 'Déclarez votre résidence à votre caisse de retraite', detail: 'Envoyez votre nouvelle adresse espagnole. Aucun impact sur le montant versé.' },
                  { n: 6, titre: 'Première déclaration IRPF en Espagne', detail: 'L\'année suivante (avril-juin). Un gestor peut le faire pour 150-300€.' },
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: FORET,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-corps)',
                    }}>{step.n}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 2 }}>{step.titre}</p>
                      <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.5 }}>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: FORET, borderRadius: 14, padding: '18px', marginBottom: 14 }}>
            <p style={{ fontFamily: 'var(--font-accent)', fontSize: 15, color: 'rgba(199,110,78,0.9)', marginBottom: 4 }}>
              vous avez des questions spécifiques ?
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: '#F7F2EB', lineHeight: 1.2, marginBottom: 10 }}>
              Cap Majorque — 249 €
            </p>
            <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.7)', lineHeight: 1.55, marginBottom: 14 }}>
              2 visios + dossier personnalisé + suivi 30 jours. Je connais les cas particuliers : double pension, revenus mixtes, fonctionnaire avec complémentaire privée. On regarde votre situation exacte.
            </p>
            <button
              onClick={() => window.open('https://buy.stripe.com/8x2fZgftO8BX4licHX6AM0K', '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%', padding: '12px', background: VERT, color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-corps)',
              }}
            >Réserver Cap Majorque →</button>
          </div>

          <button
            onClick={() => setStep(3)}
            style={{
              width: '100%', padding: '10px', background: 'transparent',
              border: '1px solid var(--gris)', borderRadius: 10, fontSize: 13,
              color: 'var(--texte-sec)', cursor: 'pointer', fontFamily: 'var(--font-corps)',
            }}
          >← Modifier mes paramètres</button>

          {/* Lien vers le guide complet */}
          <a
            href="/guide/retraite-majorque-francais.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 12,
              background: 'rgba(90,173,165,0.06)',
              border: '1px solid rgba(90,173,165,0.2)',
              borderRadius: 12, padding: '14px 16px',
              textDecoration: 'none',
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: FORET, marginBottom: 2, fontFamily: 'var(--font-corps)' }}>
                📖 Guide complet — Retraite à Majorque
              </p>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                Fiscalité détaillée, santé, démarches, budget — tout en un
              </p>
            </div>
            <span style={{ color: VERT, fontSize: 16, flexShrink: 0 }}>→</span>
          </a>
        </div>
      )}
    </div>
  )
}
