import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotionBlocks, useNotionDB, parseGuide } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import NotionBlocks, { extractHeadings, estimateReadingTime } from '../components/NotionBlocks'
import AccompagnementBanner from '../components/AccompagnementBanner'
import PremiumGate from '../components/PremiumGate'
import { NOTION_DB } from '../config'

/* ── Barre de progression de lecture ── */
function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = document.querySelector('.guide-scroll-area')
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      setPct(Math.min(100, Math.round((el.scrollTop / max) * 100)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, height: 3, background: 'var(--gris)' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, var(--vert), var(--terra))',
        borderRadius: '0 2px 2px 0',
        transition: 'width 0.15s linear',
      }} />
    </div>
  )
}

/* ── Table des matières ── */
function TableOfContents({ headings }) {
  const [open, setOpen] = useState(true)
  if (!headings.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--gris)',
      borderRadius: 'var(--radius-sm)',
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 14px',
          fontSize: 13, fontWeight: 600, color: 'var(--texte)',
          cursor: 'pointer', background: 'none', border: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📋</span> Sommaire
        </span>
        <span style={{
          color: 'var(--texte-sec)', fontSize: 11,
          transition: 'transform 0.2s',
          display: 'inline-block',
          transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
        }}>▲</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--gris)', padding: '6px 0' }}>
          {headings.map(h => (
            <div
              key={h.id}
              onClick={() => {
                const el = document.getElementById(`notion-${h.id}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', fontSize: 13,
                color: 'var(--texte-sec)', cursor: 'pointer',
              }}
            >
              <div style={{
                width: h.level === 1 ? 6 : 4,
                height: h.level === 1 ? 6 : 4,
                borderRadius: '50%',
                background: h.level === 1 ? 'var(--vert)' : 'var(--gris-mid)',
                flexShrink: 0,
                marginLeft: h.level === 2 ? 4 : 0,
              }} />
              <span style={{ lineHeight: 1.4 }}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Page principale ── */
export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blocks, loading } = useNotionBlocks(id)
  const { data } = useNotionDB(NOTION_DB.guides)
  const { canAccess } = usePremium()

  const guide = data.map(parseGuide).find(g => g.id === id)
  const headings = extractHeadings(blocks)
  const readingTime = estimateReadingTime(blocks)
  const sectionCount = headings.filter(h => h.level === 1).length

  /* Injecte les IDs sur les headings pour la navigation TOC */
  const blocksWithIds = blocks.map(b => {
    if (b.type === 'heading_1' || b.type === 'heading_2') {
      return { ...b, _anchorId: `notion-${b.id}` }
    }
    return b
  })

  return (
    <div className="page" style={{ padding: 0 }}>
      <ReadingProgress />

      <div style={{ padding: '0 20px 100px' }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 48, marginBottom: 4 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--vert)', fontSize: 13, fontWeight: 500,
              marginBottom: 20, cursor: 'pointer',
              background: 'none', border: 'none', padding: 0,
            }}
          >
            ← Retour aux guides
          </button>

          {guide && (
            <>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                {guide.category && (
                  <span className="badge badge-gris">
                    {guide.category}
                  </span>
                )}
                {guide.isPiege && (
                  <span className="badge badge-ocre">⚠️ Piège fréquent</span>
                )}
                {guide.access !== '🟢 Public' && (
                  <span className="badge badge-miel">💎 Premium</span>
                )}
              </div>

              {/* Titre */}
              <h1 style={{
                fontFamily: 'var(--font-titre)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 26,
                color: 'var(--foret)',
                lineHeight: 1.25,
                marginBottom: 14,
              }}>
                {guide.title}
              </h1>

              {/* Stats pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: guide.lien ? 14 : 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--bg-card)', border: '1px solid var(--gris)',
                  borderRadius: 20, padding: '4px 12px',
                  fontSize: 12, color: 'var(--texte-sec)', fontWeight: 500,
                }}>
                  <span>⏱</span>
                  <span>~{readingTime} min</span>
                </div>
                {sectionCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'var(--bg-card)', border: '1px solid var(--gris)',
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 12, color: 'var(--texte-sec)', fontWeight: 500,
                  }}>
                    <span>📑</span>
                    <span>{sectionCount} section{sectionCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {guide.source && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'var(--bg-card)', border: '1px solid var(--gris)',
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 12, color: 'var(--texte-sec)', fontWeight: 500,
                  }}>
                    <span>✅</span>
                    <span>{guide.source}</span>
                  </div>
                )}
              </div>

              {/* Lien officiel */}
              {guide.lien && (
                <a
                  href={guide.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(45,80,22,0.07)',
                    border: '1px solid rgba(45,80,22,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 13, color: 'var(--foret)', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <span>🔗</span>
                  <span style={{ flex: 1 }}>Formulaire officiel</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>↗</span>
                </a>
              )}

              {/* Table des matières */}
              {!loading && headings.length >= 3 && (
                <TableOfContents headings={headings} />
              )}
            </>
          )}
        </div>

        <div className="divider" />

        {/* ── Contenu ── */}
        {loading ? (
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

/* Wrapper qui injecte des ancres sur les headings pour la TOC */
function NotionBlocksWithAnchors({ blocks }) {
  if (!blocks?.length) return null
  return (
    <div>
      {blocks.map((b, i) => {
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
