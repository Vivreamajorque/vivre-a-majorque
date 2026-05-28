import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotionBlocks, useNotionDB, parseGuide } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import { useSavedGuides } from '../hooks/useSavedGuides'
import NotionBlocks, { extractHeadings, estimateReadingTime } from '../components/NotionBlocks'
import AccompagnementBanner from '../components/AccompagnementBanner'
import PremiumGate from '../components/PremiumGate'
import { NOTION_DB } from '../config'

/* ── Barre de progression lecture ── */
function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      setPct(Math.min(100, Math.round((window.scrollY / max) * 100)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 3, background: 'var(--gris)' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'linear-gradient(90deg, var(--vert), var(--terra))',
        borderRadius: '0 2px 2px 0', transition: 'width 0.15s linear',
      }} />
    </div>
  )
}

/* ── Table des matières ── */
function TableOfContents({ headings }) {
  const [open, setOpen] = useState(true)
  if (!headings.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--gris)', borderRadius: 'var(--radius-sm)', marginBottom: 20, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '12px 14px',
        fontSize: 13, fontWeight: 600, color: 'var(--texte)',
        cursor: 'pointer', background: 'none', border: 'none',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📋 Sommaire</span>
        <span style={{ color: 'var(--texte-sec)', fontSize: 11, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--gris)', padding: '6px 0' }}>
          {headings.map(h => (
            <div key={h.id} onClick={() => { const el = document.getElementById(`notion-${h.id}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', fontSize: 13, color: 'var(--texte-sec)', cursor: 'pointer' }}
            >
              <div style={{ width: h.level === 1 ? 6 : 4, height: h.level === 1 ? 6 : 4, borderRadius: '50%', background: h.level === 1 ? 'var(--vert)' : 'var(--gris-mid)', flexShrink: 0, marginLeft: h.level === 2 ? 4 : 0 }} />
              <span style={{ lineHeight: 1.4 }}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Bouton bookmark ── */
function BookmarkButton({ guide, email }) {
  const { isSaved, toggle } = useSavedGuides(email)
  const saved = isSaved(guide.id)
  const [showTip, setShowTip] = useState(false)
  const tipRef = useRef(null)

  const handleClick = () => {
    const wasNew = !saved
    toggle(guide)
    if (wasNew) {
      setShowTip(true)
      clearTimeout(tipRef.current)
      tipRef.current = setTimeout(() => setShowTip(false), 2800)
    }
  }
  useEffect(() => () => clearTimeout(tipRef.current), [])

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleClick} title={saved ? 'Retirer des favoris' : 'Sauvegarder ce guide'} style={{
        width: 36, height: 36, borderRadius: '50%',
        background: saved ? 'var(--vert-light)' : 'var(--bg-card)',
        border: `1.5px solid ${saved ? 'var(--vert)' : 'var(--gris)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
      }}>
        {saved ? '🔖' : '🏷'}
      </button>
      {showTip && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
          background: 'var(--encre)', color: 'white',
          fontSize: 12, lineHeight: 1.45, padding: '8px 12px', borderRadius: 10,
          whiteSpace: 'nowrap', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          animation: 'fadeInUp 0.2s ease',
        }}>
          ✅ Sauvegardé dans <strong>Mon espace</strong>
          <div style={{ position: 'absolute', bottom: -5, right: 12, width: 10, height: 10, background: 'var(--encre)', transform: 'rotate(45deg)', borderRadius: 2 }} />
        </div>
      )}
    </div>
  )
}

/* ── Skeleton header pendant le chargement des métadonnées ── */
function HeaderSkeleton() {
  return (
    <div style={{ paddingTop: 52, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, opacity: 0.4 }}>
        <span style={{ color: 'var(--vert)', fontSize: 13 }}>← Retour aux guides</span>
      </div>
      <div style={{ height: 14, background: 'var(--gris)', borderRadius: 8, width: '40%', marginBottom: 14 }} />
      <div style={{ height: 28, background: 'var(--gris)', borderRadius: 8, width: '90%', marginBottom: 10 }} />
      <div style={{ height: 22, background: 'var(--gris)', borderRadius: 8, width: '70%', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 26, background: 'var(--gris)', borderRadius: 20, width: 80 }} />
        <div style={{ height: 26, background: 'var(--gris)', borderRadius: 20, width: 100 }} />
      </div>
    </div>
  )
}

/* ── Page principale ── */
export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blocks, loading: blocksLoading } = useNotionBlocks(id)
  const { data, loading: dataLoading } = useNotionDB(NOTION_DB.guides)
  const { canAccess, isPremium, email } = usePremium()

  const normalize = s => s?.replace(/-/g, '')
  const guide = data.map(parseGuide).find(g => normalize(g.id) === normalize(id))

  const headings = extractHeadings(blocks)
  const readingTime = estimateReadingTime(blocks)
  const sectionCount = headings.filter(h => h.level === 1).length

  /* Chargement combiné — on attend les métadonnées ET les blocs */
  const metaReady = !dataLoading
  const contentReady = !blocksLoading

  return (
    <div className="page" style={{ padding: 0 }}>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <ReadingProgress />

      <div style={{ padding: '0 20px 100px' }}>

        {/* ── Header ── */}
        {!metaReady ? (
          <HeaderSkeleton />
        ) : (
          <div style={{ paddingTop: 52, marginBottom: 4 }}>
            <button onClick={() => navigate(-1)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--vert)', fontSize: 13, fontWeight: 500,
              marginBottom: 20, cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            }}>
              ← Retour aux guides
            </button>

            {guide ? (
              <>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {guide.category && <span className="badge badge-gris">{guide.category}</span>}
                  {guide.isPiege && <span className="badge badge-ocre">⚠️ Piège fréquent</span>}
                  {guide.access !== '🟢 Public' && <span className="badge badge-miel">💎 Premium</span>}
                </div>

                {/* Titre + bookmark */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <h1 style={{
                    flex: 1, fontFamily: 'var(--font-titre)', fontStyle: 'italic',
                    fontWeight: 300, fontSize: 'var(--fs-2xl)', color: 'var(--foret)', lineHeight: 1.25,
                  }}>
                    {guide.title}
                  </h1>
                  {isPremium && <BookmarkButton guide={guide} email={email} />}
                </div>

                {/* Stats pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    { icon: '⏱', text: `~${readingTime} min` },
                    sectionCount > 0 && { icon: '📑', text: `${sectionCount} section${sectionCount > 1 ? 's' : ''}` },
                    guide.source && { icon: '✅', text: guide.source },
                  ].filter(Boolean).map((pill, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'var(--bg-card)', border: '1px solid var(--gris)',
                      borderRadius: 20, padding: '4px 12px',
                      fontSize: 12, color: 'var(--texte-sec)', fontWeight: 500,
                    }}>
                      <span>{pill.icon}</span><span>{pill.text}</span>
                    </div>
                  ))}
                </div>

                {/* TOC */}
                {contentReady && headings.length >= 3 && (
                  <TableOfContents headings={headings} />
                )}
              </>
            ) : (
              /* Guide non trouvé dans la DB — affiche juste le titre générique */
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--texte-sec)', marginBottom: 16 }}>
                Chargement du guide…
              </p>
            )}
          </div>
        )}

        <div className="divider" />

        {/* ── Contenu ── */}
        {!contentReady ? (
          <div className="spinner">Chargement du contenu…</div>
        ) : guide && !canAccess(guide.access) ? (
          <PremiumGate accessLevel={guide.access}>
            <div style={{ height: 200 }} />
          </PremiumGate>
        ) : (
          <>
            <NotionBlocksWithAnchors blocks={blocks} />
            <div style={{ margin: '32px 0 0' }}>
              <AccompagnementBanner
                texte="Cette démarche vous semble complexe à appliquer à votre situation personnelle ?"
                cta="Je vous accompagne pas à pas →"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function NotionBlocksWithAnchors({ blocks }) {
  if (!blocks?.length) return null
  return (
    <div>
      {blocks.map(b => {
        if (b.type === 'heading_1' || b.type === 'heading_2') {
          return (
            <div key={b.id} id={`notion-${b.id}`} style={{ scrollMarginTop: 20 }}>
              <NotionBlocks blocks={[b]} />
            </div>
          )
        }
        return <NotionBlocks key={b.id} blocks={[b]} />
      })}
    </div>
  )
}
