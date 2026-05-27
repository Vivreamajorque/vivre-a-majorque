import React from 'react'

function RichText({ rt }) {
  if (!rt || !rt.length) return null
  return rt.map((t, i) => {
    let text = t.plain_text
    const s = t.annotations || {}
    const style = {
      fontWeight: s.bold ? 600 : undefined,
      fontStyle: s.italic ? 'italic' : undefined,
      textDecoration: s.underline ? 'underline' : s.strikethrough ? 'line-through' : undefined,
      fontFamily: s.code ? 'monospace' : undefined,
      background: s.code ? 'var(--gris)' : undefined,
      padding: s.code ? '1px 4px' : undefined,
      borderRadius: s.code ? 3 : undefined,
      color: s.color && s.color !== 'default' ? undefined : undefined,
    }
    if (t.href) return <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" style={style}>{text}</a>
    return <span key={i} style={style}>{text}</span>
  })
}

export default function NotionBlocks({ blocks }) {
  if (!blocks || !blocks.length) return null

  return (
    <div style={{ lineHeight: 1.7, color: 'var(--texte)' }}>
      {blocks.map((block, i) => {
        const { type } = block
        const content = block[type]

        switch (type) {
          case 'paragraph':
            return (
              <p key={block.id} style={{ margin: '0 0 12px', fontSize: 15 }}>
                <RichText rt={content?.rich_text} />
              </p>
            )
          case 'heading_1':
            return (
              <h2 key={block.id} style={{ fontFamily: 'var(--font-titre)', fontSize: 22, margin: '24px 0 10px', color: 'var(--foret)' }}>
                <RichText rt={content?.rich_text} />
              </h2>
            )
          case 'heading_2':
            return (
              <h3 key={block.id} style={{ fontFamily: 'var(--font-titre)', fontSize: 18, margin: '20px 0 8px', color: 'var(--foret)' }}>
                <RichText rt={content?.rich_text} />
              </h3>
            )
          case 'heading_3':
            return (
              <h4 key={block.id} style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 6px', color: 'var(--foret)' }}>
                <RichText rt={content?.rich_text} />
              </h4>
            )
          case 'bulleted_list_item':
            return (
              <div key={block.id} style={{ display: 'flex', gap: 8, margin: '4px 0', fontSize: 15 }}>
                <span style={{ color: 'var(--vert)', marginTop: 1 }}>•</span>
                <span><RichText rt={content?.rich_text} /></span>
              </div>
            )
          case 'numbered_list_item':
            return (
              <div key={block.id} style={{ display: 'flex', gap: 8, margin: '4px 0', fontSize: 15 }}>
                <span style={{ color: 'var(--ocre)', minWidth: 16 }}>{i + 1}.</span>
                <span><RichText rt={content?.rich_text} /></span>
              </div>
            )
          case 'to_do':
            return (
              <div key={block.id} style={{ display: 'flex', gap: 8, margin: '6px 0', fontSize: 15, alignItems: 'flex-start' }}>
                <span style={{ color: content?.checked ? 'var(--vert)' : 'var(--gris-mid)', fontSize: 16, marginTop: 1 }}>
                  {content?.checked ? '✅' : '⬜'}
                </span>
                <span style={{ textDecoration: content?.checked ? 'line-through' : undefined, color: content?.checked ? 'var(--texte-sec)' : undefined }}>
                  <RichText rt={content?.rich_text} />
                </span>
              </div>
            )
          case 'callout':
            return (
              <div key={block.id} style={{
                background: 'var(--vert-light)',
                borderLeft: '3px solid var(--vert)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                margin: '12px 0',
                display: 'flex',
                gap: 10,
                fontSize: 14,
              }}>
                <span>{content?.icon?.emoji || 'ℹ️'}</span>
                <span><RichText rt={content?.rich_text} /></span>
              </div>
            )
          case 'quote':
            return (
              <blockquote key={block.id} style={{
                borderLeft: '3px solid var(--ocre)',
                paddingLeft: 14,
                margin: '12px 0',
                fontStyle: 'italic',
                color: 'var(--texte-sec)',
                fontSize: 15,
              }}>
                <RichText rt={content?.rich_text} />
              </blockquote>
            )
          case 'divider':
            return <hr key={block.id} style={{ border: 'none', borderTop: '1px solid var(--gris)', margin: '16px 0' }} />
          case 'code':
            return (
              <pre key={block.id} style={{
                background: 'var(--foret)',
                color: '#F4EDE0',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                overflowX: 'auto',
                margin: '12px 0',
              }}>
                <RichText rt={content?.rich_text} />
              </pre>
            )
          case 'image':
            const url = content?.file?.url || content?.external?.url
            return url ? (
              <img key={block.id} src={url} alt={content?.caption?.[0]?.plain_text || ''} style={{
                width: '100%',
                borderRadius: 'var(--radius)',
                margin: '12px 0',
                display: 'block',
              }} />
            ) : null
          default:
            return null
        }
      })}
    </div>
  )
}
