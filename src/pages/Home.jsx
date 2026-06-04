import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useUserData } from '../hooks/useUserData'
import { useQuizData, isEntrepreneurProfile } from '../hooks/useQuizData'
import { useNotionDB, parseActu } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { TERRA, VERT, AccentWord, DisplayTitle, ContextLabel, Trait, SectionHead } from '../components/WaveTitle'
import QuizProfil from '../components/QuizProfil'
import { useSEO } from '../hooks/useSEO'

/* ── Mon Espace personnalisé ───────────────────────────── */
function MonEspaceCard({ profile, quiz, user, onPersonalize }) {
  const isEntrepreneur = isEntrepreneurProfile(quiz)
  const greeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'
  const prenom = user?.prenom

  // Calcul progression cockpit depuis localStorage
  const profileId = profile?.id
  const progress = React.useMemo(() => {
    if (!profileId) return null
    try {
      const done = JSON.parse(localStorage.getItem(`vmaq_done_${profileId}`) || '[]')
      return done.length
    } catch { return 0 }
  }, [profileId])

  return (
    <Link to="/app/moi" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
      <div style={{
        background: '#0F3D35',
        borderRadius: 18,
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Deco */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(90,173,165,0.10)', pointerEvents: 'none',
        }} />

        {/* Avatar initial */}
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'rgba(90,173,165,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 18, color: '#7EC8C0',
        }}>
          {prenom ? prenom[0].toUpperCase() : '👤'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 14, color: 'rgba(199,110,78,0.9)',
            lineHeight: 1, marginBottom: 3,
          }}>
            {greeting}{prenom ? ` ${prenom}` : ''} 👋
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 16, color: '#F7F2EB', fontWeight: 400,
            lineHeight: 1, marginBottom: quiz ? 5 : 0,
          }}>
            Mon espace
          </p>
          {quiz ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {isEntrepreneur && (
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: '#E8956E', background: 'rgba(199,110,78,0.2)',
                  border: '1px solid rgba(199,110,78,0.3)',
                  padding: '2px 8px', borderRadius: 20,
                  fontFamily: 'var(--font-corps)',
                }}>
                  🏢 Entrepreneur
                </span>
              )}
              {profile?.label && !isEntrepreneur && (
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: '#7EC8C0', background: 'rgba(90,173,165,0.2)',
                  border: '1px solid rgba(90,173,165,0.3)',
                  padding: '2px 8px', borderRadius: 20,
                  fontFamily: 'var(--font-corps)',
                }}>
                  {profile.emoji} {profile.label}
                </span>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.5)', fontFamily: 'var(--font-corps)' }}>
              Personnaliser mon espace →
            </p>
          )}
          {/* Barre de progression cockpit */}
          {progress !== null && progress > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 4 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, progress * 10)}%`,
                  background: 'rgba(90,173,165,0.8)',
                  borderRadius: 2,
                  transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(90,173,165,0.7)', fontFamily: 'var(--font-corps)' }}>
                {progress} étape{progress > 1 ? 's' : ''} cochée{progress > 1 ? 's' : ''} dans votre cockpit
              </p>
            </div>
          )}
        </div>

        <span style={{ color: 'rgba(90,173,165,0.7)', fontSize: 18, flexShrink: 0 }}>›</span>
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
            <span style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 13, color: 'var(--texte-sec)' }}>
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
            <span style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 13, color: 'var(--texte-sec)' }}>
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
  { to: '/app/guides',               icon: '📚', context: '100+ fiches admin',        title: 'Guides',         color: TERRA },
  { to: '/app/explorer',             icon: '🧮', context: 'simulateurs & annuaire',   title: 'Outils',         color: VERT  },
  { to: '/app/explorer/entreprendre',icon: '🏢', context: 'créer son activité',       title: 'Entreprendre',   color: TERRA },
  { to: '/app/moi',                  icon: '📋', context: 'votre plan d\'installation', title: 'Cockpit',      color: VERT  },
  { to: '/app/premium',              icon: '💎', context: 'guides · outils · accompagnement', title: 'Premium', color: '#b07d2a' },
]

/* ── Page Home ──────────────────────────────────────────── */
export default function Home() {
  useSEO({
    title: "Vivre à Majorque — Guides et accompagnement pour s'installer",
    description: "L'app des francophones qui s'installent à Majorque. Guides administratifs, simulateur budget, cockpit installation. Par Amely, française à Campos.",
    url: "https://vivre-a-majorque.vercel.app/",
  })
  const { profile, prenom } = useProfile()
  const { user } = useUserData()
  const { quiz, saveQuiz, hasQuiz } = useQuizData()
  const [showQuiz, setShowQuiz] = useState(false)
  const navigate = useNavigate()

  const { data: actusData, loading: actusLoading } = useNotionDB(NOTION_DB.actus)
  const actus = useMemo(() => actusData.map(parseActu).slice(0, 8), [actusData])

  return (
    <div className="page">

      {/* ── Logo + Header ───────────────────────────────── */}
      <div style={{ paddingTop: 28, paddingBottom: 8, textAlign: 'center' }}>
        <style>{`
          @keyframes spinOnce {
            0%   { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
          .logo-spin {
            animation: spinOnce 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
          }
        `}</style>
        <img
          src="/logo_vivre_a_majorque.png"
          alt="Vivre à Majorque"
          className="logo-spin"
          loading="lazy"
          style={{ width: 150, height: 'auto', marginBottom: 12 }}
        />

        {profile ? (
          <div style={{ textAlign: 'left' }}>
            <DisplayTitle size={36}>{user?.prenom || prenom || 'Bonjour'}</DisplayTitle>
            <AccentWord color={TERRA} size={20}>{profile.emoji} {profile.label}</AccentWord>
            <Trait color={TERRA} width={40} />
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: 'var(--font-accent)', fontSize: 13, color: VERT, marginBottom: 4, letterSpacing: '0.04em' }}>
              l'appli des francophones
            </p>
            <p style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 14, color: 'var(--texte-sec)', marginBottom: 16 }}>
              guides · simulateurs · accompagnement
            </p>
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
      <SectionHead title="Accès rapide" style={{ marginBottom: 14, marginTop: 4 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {NAV_CARDS.slice(0, 4).map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div className="card-tap" style={{
              background: '#fff',
              border: `1px solid ${card.color}28`,
              borderTop: `3px solid ${card.color}`,
              borderRadius: 14, padding: '16px 14px',
              boxShadow: '0 1px 6px rgba(28,20,16,0.05)',
              height: '100%',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, color: 'var(--foret)', lineHeight: 1.2, marginBottom: 4 }}>{card.title}</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4 }}>{card.context}</p>
            </div>
          </Link>
        ))}
      </div>
      {/* 5e carte pleine largeur */}
      <Link to={NAV_CARDS[4].to} style={{ textDecoration: 'none', display: 'block', marginBottom: 28 }}>
        <div className="card-tap" style={{
          background: '#fff',
          border: `1px solid ${NAV_CARDS[4].color}28`,
          borderTop: `3px solid ${NAV_CARDS[4].color}`,
          borderRadius: 14, padding: '14px 18px',
          boxShadow: '0 1px 6px rgba(28,20,16,0.05)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 24 }}>{NAV_CARDS[4].icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, color: 'var(--foret)', marginBottom: 2 }}>{NAV_CARDS[4].title}</p>
            <p style={{ fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontSize: 12, color: 'var(--texte-sec)' }}>{NAV_CARDS[4].context}</p>
          </div>
          <span style={{ color: TERRA, fontSize: 20 }}>›</span>
        </div>
      </Link>

      {/* ── Bannière Premium ────────────────────────────── */}
      <Link to="/app/premium" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
        <div style={{
          background: '#0F3D35', borderRadius: 16, padding: '18px 20px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(176,125,42,0.12)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>💎</span>
            <span style={{ fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 800, color: '#c9a84c', letterSpacing: '0.06em' }}>PREMIUM — 9,90€/MOIS PENDANT 3 MOIS</span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: '#F7F2EB', lineHeight: 1.2, marginBottom: 6 }}>
            Débloquez tous les guides<br />et le cockpit complet
          </p>
          <p style={{ fontSize: 13, color: 'rgba(247,242,235,0.6)', marginBottom: 14, fontFamily: 'var(--font-corps)' }}>
            100+ guides · simulateurs avancés · alertes · annuaire · accompagnement
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#b07d2a', borderRadius: 30, padding: '8px 18px' }}>
            <span style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: 13, color: '#fff' }}>Démarrer maintenant →</span>
          </div>
        </div>
      </Link>

      {/* ── Réseaux sociaux ─────────────────────────────── */}
      <div style={{ marginBottom: 28, padding: '16px 0', borderTop: '1px solid var(--gris)' }}>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12, fontFamily: 'var(--font-corps)' }}>
          Suivez Amely sur les réseaux
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { href: 'https://www.instagram.com/amely_mallorca_raw/', label: 'Instagram', bg: '#E1306C', emoji: '📸' },
            { href: 'https://www.tiktok.com/@amelymallorcaraw', label: 'TikTok', bg: '#000000', emoji: '🎵' },
            { href: 'https://www.facebook.com/vivre.a.majorque', label: 'Facebook', bg: '#1877F2', emoji: '👥' },
            { href: 'https://wa.me/message/AMELYMAJORQUE', label: 'WhatsApp', bg: '#25D366', emoji: '💬' },
          ].map(({ href, label, bg, emoji }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 10,
                background: '#fff', border: '1px solid var(--gris)',
                textDecoration: 'none',
                fontFamily: 'var(--font-corps)', fontSize: 13, fontWeight: 600,
                color: 'var(--texte)',
              }}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>
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
