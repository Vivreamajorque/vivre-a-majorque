import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useUserData } from '../hooks/useUserData'
import { useQuizData, isEntrepreneurProfile } from '../hooks/useQuizData'
import { useNotionDB, parseCockpit, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait, SectionHead } from '../components/WaveTitle'
import QuizProfil from '../components/QuizProfil'

/* ── Mon Espace personnalisé ───────────────────────────── */
function MonEspaceCard({ profile, quiz, user, onPersonalize }) {
  const isEntrepreneur = isEntrepreneurProfile(quiz)

  /* Jauge Cockpit inline */
  const { data } = useNotionDB(NOTION_DB.cockpit)
  const [checked] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`vmaq_done_${profile?.id}`) || '[]')) }
    catch { return new Set() }
  })
  const steps = useMemo(() =>
    data.map(parseCockpit).filter(s => !profile?.notion || s.profilCible === profile.notion),
    [data, profile]
  )
  const total = steps.length
  const done  = steps.filter(s => checked.has(s.id)).length
  const pct   = total ? Math.round((done / total) * 100) : 0

  return (
    <Link to="/app/moi" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        border: `1.5px solid ${VERT}30`,
        padding: '18px 18px 16px',
        boxShadow: `0 2px 14px ${VERT}0D`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Deco fond */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: `${VERT}0A`, pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <ContextLabel color={VERT} size={12}>
              {quiz ? 'mon espace' : 'personnaliser'}
            </ContextLabel>
            <DisplayTitle size={22}>
              {user?.prenom ? user.prenom : 'Mon espace'}
            </DisplayTitle>
            {quiz && (
              <span style={{
                display: 'inline-block', marginTop: 4,
                fontFamily: 'var(--font-accent)', fontStyle: 'italic',
                fontSize: 13, color: TERRA,
              }}>
                {isEntrepreneur ? '🏢 Entrepreneur' : profile?.label || ''}
              </span>
            )}
          </div>
          {quiz && total > 0 ? (
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 26, color: VERT, lineHeight: 1,
            }}>
              {pct}%
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: TERRA,
              background: `${TERRA}15`,
              border: `1px solid ${TERRA}30`,
              padding: '4px 10px', borderRadius: 20,
              fontFamily: 'var(--font-corps)',
            }}>
              ✦ Personnaliser →
            </span>
          )}
        </div>

        {/* Barre progression si quiz fait */}
        {quiz && total > 0 && (
          <>
            <div style={{ height: 5, background: '#E8E2D9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: VERT, borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--texte-sec)', fontFamily: 'var(--font-titre)', fontStyle: 'italic' }}>
              {done}/{total} étapes validées
            </span>
          </>
        )}

        {/* Message si pas de quiz */}
        {!quiz && (
          <p style={{
            fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.5,
            fontFamily: 'var(--font-titre)', fontStyle: 'italic',
          }}>
            5 questions pour un espace adapté à votre situation →
          </p>
        )}
      </div>
    </Link>
  )
}

/* ── Carte Actu ─────────────────────────────────────────── */
function ActuCard({ actu, index }) {
  const color = index % 2 === 0 ? TERRA : VERT
  return (
    <div style={{
      minWidth: 220, maxWidth: 220,
      background: '#fff',
      border: `1px solid ${color}28`,
      borderRadius: 16,
      flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: `0 2px 10px rgba(28,20,16,0.06)`,
    }}>
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {actu.categorie && (
            <div>
              <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, fontSize: 15, color }}>
                {actu.categorie}
              </span>
              <div style={{ width: 20, height: 2, background: color, borderRadius: 2, marginTop: 2 }} />
            </div>
          )}
          {actu.date && (
            <span style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 11, color: 'var(--texte-sec)' }}>
              {new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 15, color: 'var(--texte)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
        }}>
          {actu.title}
        </p>
        {actu.resume && (
          <p style={{
            fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            fontSize: 13, color: 'var(--texte-sec)', lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
          }}>
            {actu.resume}
          </p>
        )}
        {actu.sourceDomain && (
          <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 11, color: 'var(--texte-sec)' }}>
              {actu.sourceDomain}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Carousel actus avec défilement auto ─────────────────── */
function ActuCarousel({ actus, loading }) {
  const trackRef = useRef(null)
  const timerRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const CARD_W = 220 + 12 // width + gap

  useEffect(() => {
    if (!actus.length) return
    timerRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % actus.length
        if (trackRef.current) {
          trackRef.current.scrollTo({ left: next * CARD_W, behavior: 'smooth' })
        }
        return next
      })
    }, 3800)
    return () => clearInterval(timerRef.current)
  }, [actus.length])

  const handleScroll = () => {
    if (!trackRef.current) return
    clearInterval(timerRef.current)
    const idx = Math.round(trackRef.current.scrollLeft / CARD_W)
    setActiveIdx(idx)
  }

  if (loading || !actus.length) return null

  return (
    <div style={{ marginBottom: 22 }}>
      <SectionHead title="Actus" cta="Toutes →" ctaTo="/app/actus" />

      {/* Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{
          display: 'flex', gap: 12,
          overflowX: 'auto', paddingBottom: 10,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
        }}
      >
        {actus.map((a, i) => (
          <div key={a.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ActuCard actu={a} index={i} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {actus.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIdx(i)
              trackRef.current?.scrollTo({ left: i * CARD_W, behavior: 'smooth' })
            }}
            style={{
              width: i === activeIdx ? 18 : 6,
              height: 6, borderRadius: 3,
              background: i === activeIdx ? TERRA : '#D0C8BC',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Grille accès rapide ───────────────────────────────── */
const NAV_CARDS = [
  { to: '/app/guides',               icon: '📚', context: '100+ fiches admin',     title: 'Guides',       color: TERRA },
  { to: '/app/explorer',             icon: '🌴', context: 'ressources & adresses', title: 'Explorer',     color: VERT  },
  { to: '/app/explorer/entreprendre',icon: '🏢', context: 'créer son activité',    title: 'Entreprendre', color: TERRA },
  { to: '/app/explorer/outils',      icon: '🧮', context: 'budget, autónoma…',     title: 'Simulateurs',  color: VERT  },
]

/* ── Page Home ──────────────────────────────────────────── */
export default function Home() {
  const { profile, prenom } = useProfile()
  const { user } = useUserData()
  const { quiz, saveQuiz, hasQuiz } = useQuizData()
  const [showQuiz, setShowQuiz] = useState(false)
  const navigate = useNavigate()

  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 8), [actusData])

  return (
    <div className="page">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        {profile ? (
          <div>
            <ContextLabel color={VERT} size={14}>bienvenue,</ContextLabel>
            <DisplayTitle size={38}>{user?.prenom || prenom || 'Bonjour'}</DisplayTitle>
            <AccentWord color={TERRA} size={22}>{profile.emoji} {profile.label}</AccentWord>
            <Trait color={TERRA} width={40} />
          </div>
        ) : (
          <div>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-titre)',
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 18, color: VERT,
              lineHeight: 1.25, marginBottom: 2,
            }}>
              l'appli pour
            </span>
            <DisplayTitle size={38}>s'installer</DisplayTitle>
            <AccentWord color={TERRA} size={38}>à Majorque</AccentWord>
            <Trait color={TERRA} width={40} />
          </div>
        )}
      </div>

      {/* ── Actus défilantes ───────────────────────────── */}
      <ActuCarousel actus={actus} loading={actusLoading} />

      {/* ── Mon espace personnalisé ─────────────────────── */}
      <MonEspaceCard
        profile={profile}
        quiz={quiz}
        user={user}
        onPersonalize={() => setShowQuiz(true)}
      />

      {/* ── Accès rapide ────────────────────────────────── */}
      <SectionHead title="Accès rapide" style={{ marginBottom: 12, marginTop: 4 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {NAV_CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              border: `1px solid ${card.color}28`,
              borderRadius: 16, padding: '16px 14px',
              boxShadow: '0 1px 6px rgba(28,20,16,0.05)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
              <DisplayTitle size={18}>{card.title}</DisplayTitle>
              <Trait color={card.color} width={24} />
              <span style={{
                display: 'block', marginTop: 6,
                fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                fontSize: 13, color: 'var(--texte-sec)',
              }}>
                {card.context}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quiz profil si déclenché */}
      {showQuiz && (
        <QuizProfil
          onComplete={(answers) => { saveQuiz(answers); setShowQuiz(false) }}
          onSkip={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}
