import React, { useState, useMemo } from 'react'

/* ─────────────────────────────────────────────
   RichText — rendu inline avec annotations
───────────────────────────────────────────── */
function RichText({ rt }) {
  if (!rt || !rt.length) return null
  return rt.map((t, i) => {
    const s = t.annotations || {}
    const style = {
      fontWeight:     s.bold          ? 600           : undefined,
      fontStyle:      s.italic        ? 'italic'      : undefined,
      textDecoration: s.underline     ? 'underline'
                    : s.strikethrough ? 'line-through' : undefined,
      fontFamily:     s.code ? 'monospace' : undefined,
      background:     s.code ? 'var(--gris)' : undefined,
      padding:        s.code ? '1px 5px'    : undefined,
      borderRadius:   s.code ? 3            : undefined,
      fontSize:       s.code ? '0.88em'     : undefined,
    }
    if (t.href)
      return (
        <a key={i} href={t.href} target="_blank" rel="noopener noreferrer"
           style={{ ...style, color: 'var(--vert)', textDecoration: 'underline' }}>
          {t.plain_text}
        </a>
      )
    return <span key={i} style={style}>{t.plain_text}</span>
  })
}

/* ─────────────────────────────────────────────
   Callout — couleur selon emoji
───────────────────────────────────────────── */
const CALLOUT_STYLES = {
  '⚠️': { bg: 'rgba(199,110,78,0.10)',  border: '#C76E4E' },
  '🛑': { bg: 'rgba(199,78,78,0.10)',   border: '#C74E4E' },
  '❌': { bg: 'rgba(199,78,78,0.10)',   border: '#C74E4E' },
  '✅': { bg: 'rgba(90,173,165,0.12)',  border: '#5AADA5' },
  '✔️': { bg: 'rgba(90,173,165,0.12)',  border: '#5AADA5' },
  '💡': { bg: 'rgba(176,125,42,0.10)',  border: '#b07d2a' },
  '💰': { bg: 'rgba(176,125,42,0.10)',  border: '#b07d2a' },
  'ℹ️': { bg: 'rgba(74,127,165,0.10)', border: '#4A7FA5' },
  '📌': { bg: 'rgba(74,127,165,0.10)', border: '#4A7FA5' },
  '🔑': { bg: 'rgba(74,127,165,0.10)', border: '#4A7FA5' },
}
function calloutStyle(emoji) {
  return CALLOUT_STYLES[emoji] || { bg: 'rgba(90,173,165,0.12)', border: '#5AADA5' }
}

/* ─────────────────────────────────────────────
   Toggle — accordéon natif
───────────────────────────────────────────── */
function ToggleBlock({ content }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      border: '1px solid var(--gris)',
      borderRadius: 'var(--radius-sm)',
      margin: '10px 0',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 14px', cursor: 'pointer',
          fontSize: 16, fontWeight: 500,
          background: 'var(--bg-card)',
          userSelect: 'none',
        }}
      >
        <span style={{
          color: 'var(--texte-sec)', fontSize: 12,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'none',
          display: 'inline-block',
        }}>▶</span>
        <span><RichText rt={content?.rich_text} /></span>
      </div>
      {open && (
        <div style={{
          padding: '10px 14px',
          fontSize: 16,
          color: 'var(--texte-sec)',
          borderTop: '1px solid var(--gris)',
          background: 'var(--bg)',
          lineHeight: 1.65,
        }}>
          {content?.children?.length
            ? <NotionBlocks blocks={content.children} />
            : <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Contenu vide</span>}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Groupeur de blocs — fusionne les listes consécutives
───────────────────────────────────────────── */
function groupBlocks(blocks) {
  const groups = []
  let i = 0
  while (i < blocks.length) {
    const b = blocks[i]
    if (b.type === 'bulleted_list_item') {
      const items = []
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        items.push(blocks[i]); i++
      }
      groups.push({ type: 'bulleted_list', items })
    } else if (b.type === 'numbered_list_item') {
      const items = []
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        items.push(blocks[i]); i++
      }
      groups.push({ type: 'numbered_list', items })
    } else {
      groups.push(b); i++
    }
  }
  return groups
}

/* ─────────────────────────────────────────────
   NotionBlocks — renderer principal
───────────────────────────────────────────── */
export default function NotionBlocks({ blocks }) {
  const groups = useMemo(() => groupBlocks(blocks || []), [blocks])
  if (!groups.length) return null

  return (
    <div style={{ lineHeight: 1.65, color: 'var(--texte)', fontSize: 16 }}>
      {groups.map((group, gi) => {

        /* ── Listes groupées ── */
        if (group.type === 'bulleted_list') {
          return (
            <ul key={gi} style={{ listStyle: 'none', padding: 0, margin: '4px 0 14px' }}>
              {group.items.map(item => (
                <li key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '3px 0', fontSize: 16, lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--vert)', fontSize: 18, lineHeight: 1.40, flexShrink: 0, marginTop: 1 }}>·</span>
                  <span><RichText rt={item.bulleted_list_item?.rich_text} /></span>
                </li>
              ))}
            </ul>
          )
        }

        if (group.type === 'numbered_list') {
          return (
            <ol key={gi} style={{ listStyle: 'none', padding: 0, margin: '4px 0 14px' }}>
              {group.items.map((item, idx) => (
                <li key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '3px 0', fontSize: 16, lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--terra)', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-accent)', minWidth: 22, flexShrink: 0, marginTop: 2 }}>
                    {idx + 1}.
                  </span>
                  <span><RichText rt={item.numbered_list_item?.rich_text} /></span>
                </li>
              ))}
            </ol>
          )
        }

        /* ── Blocs individuels ── */
        const { type, id } = group
        const content = group[type]

        switch (type) {

          case 'paragraph':
            if (!content?.rich_text?.length) return <div key={id} style={{ height: 8 }} />
            return (
              <p key={id} style={{ margin: '0 0 14px', fontSize: 16, lineHeight: 1.65 }}>
                <RichText rt={content.rich_text} />
              </p>
            )

          case 'heading_1':
            return (
              <h2 key={id} style={{
                fontFamily: 'var(--font-titre)',
                fontStyle: 'italic',
                fontSize: 22,
                fontWeight: 400,
                color: 'var(--foret)',
                margin: '28px 0 12px',
                paddingLeft: 12,
                borderLeft: '3px solid var(--vert)',
                lineHeight: 1.30,
              }}>
                <RichText rt={content?.rich_text} />
              </h2>
            )

          case 'heading_2':
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 10px' }}>
                <h3 style={{
                  fontFamily: 'var(--font-titre)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--foret)',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}>
                  <RichText rt={content?.rich_text} />
                </h3>
                <div style={{ flex: 1, height: 1, background: 'var(--gris)' }} />
              </div>
            )

          case 'heading_3':
            return (
              <h4 key={id} style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--terra)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: '18px 0 8px',
              }}>
                <RichText rt={content?.rich_text} />
              </h4>
            )

          case 'to_do':
            return (
              <div key={id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0', fontSize: 16 }}>
                <div style={{
                  width: 18, height: 18,
                  borderRadius: 4,
                  border: content?.checked ? 'none' : '2px solid var(--gris-mid)',
                  background: content?.checked ? 'var(--vert)' : 'transparent',
                  flexShrink: 0, marginTop: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12,
                }}>
                  {content?.checked ? '✓' : ''}
                </div>
                <span style={{
                  textDecoration: content?.checked ? 'line-through' : undefined,
                  color: content?.checked ? 'var(--texte-sec)' : undefined,
                  lineHeight: 1.65,
                }}>
                  <RichText rt={content?.rich_text} />
                </span>
              </div>
            )

          case 'callout': {
            const emoji = content?.icon?.emoji || 'ℹ️'
            const cs = calloutStyle(emoji)
            return (
              <div key={id} style={{
                background: cs.bg,
                borderLeft: `3px solid ${cs.border}`,
                borderRadius: 'var(--radius-sm)',
                padding: '13px 14px',
                margin: '14px 0',
                display: 'flex',
                gap: 10,
                fontSize: 16,
                lineHeight: 1.65,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                <span><RichText rt={content?.rich_text} /></span>
              </div>
            )
          }

          case 'quote':
            return (
              <blockquote key={id} style={{
                borderLeft: '3px solid var(--gold)',
                padding: '10px 14px',
                margin: '14px 0',
                fontStyle: 'italic',
                color: 'var(--texte-sec)',
                fontSize: 16,
                background: 'rgba(176,125,42,0.07)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              }}>
                <RichText rt={content?.rich_text} />
              </blockquote>
            )

          case 'divider':
            return (
              <hr key={id} style={{
                border: 'none',
                height: 1,
                background: 'linear-gradient(90deg, transparent, var(--gris-mid), transparent)',
                margin: '20px 0',
              }} />
            )

          case 'code':
            return (
              <pre key={id} style={{
                background: 'var(--foret)',
                color: '#F4EDE0',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                overflowX: 'auto',
                margin: '12px 0',
                lineHeight: 1.65,
              }}>
                <RichText rt={content?.rich_text} />
              </pre>
            )

          case 'image': {
            const url = content?.file?.url || content?.external?.url
            const caption = content?.caption?.[0]?.plain_text
            return url ? (
              <figure key={id} style={{ margin: '14px 0' }}>
                <img src={url} alt={caption || ''} style={{
                  width: '100%',
                  borderRadius: 'var(--radius)',
                  display: 'block',
                }} />
                {caption && (
                  <figcaption style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--texte-sec)',
                    marginTop: 6,
                    fontStyle: 'italic',
                  }}>
                    {caption}
                  </figcaption>
                )}
              </figure>
            ) : null
          }

          case 'toggle':
            return <ToggleBlock key={id} content={content} />

          case 'column_list':
          case 'column':
            return null

          default:
            return null
        }
      })}
    </div>
  )
}

/* Export helper — extrait les headings pour la TOC */
export function extractHeadings(blocks) {
  if (!blocks?.length) return []
  return blocks
    .filter(b => b.type === 'heading_1' || b.type === 'heading_2')
    .map(b => ({
      id: b.id,
      level: b.type === 'heading_1' ? 1 : 2,
      text: b[b.type]?.rich_text?.map(t => t.plain_text).join('') || '',
    }))
}

/* Export helper — estime le temps de lecture */
export function estimateReadingTime(blocks) {
  if (!blocks?.length) return 1
  let wordCount = 0
  blocks.forEach(b => {
    const rt = b[b.type]?.rich_text || []
    rt.forEach(t => { wordCount += (t.plain_text || '').split(/\s+/).filter(Boolean).length })
  })
  return Math.max(1, Math.round(wordCount / 200))
}
