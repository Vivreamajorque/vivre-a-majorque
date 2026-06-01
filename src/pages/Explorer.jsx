import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { PageHeading, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'
import { fuzzyFilter } from '../hooks/useFuzzySearch'

const CARDS = [
  { to: '/app/explorer/annuaire',       emoji: '👥', title: 'Annuaires',      desc: 'Pros francophones par catégorie',      bg: 'var(--vert-light)',  border: 'rgba(90,122,64,0.15)' },
  { to: '/app/explorer/boutiques',      emoji: '🛍️', title: 'Boutique',       desc: 'Guides, circuits & ressources',         bg: 'var(--ocre-light)',  border: 'rgba(196,122,90,0.15)' },
  { to: '/app/explorer/outils',         emoji: '🧮', title: 'Outils',          desc: 'Simulateurs & calculateurs',            bg: 'var(--vert-light)',  border: 'rgba(90,122,64,0.15)' },
  { to: '/app/explorer/actus',          emoji: '📰', title: 'Actualités',     desc: 'Infos locales, alertes et nouveautés',  bg: 'var(--ocre-light)',  border: 'rgba(196,122,90,0.15)' },
  { to: '/app/explorer/medias',         emoji: '🎬', title: 'Médias',          desc: 'YouTube, Instagram, TikTok',            bg: 'var(--vert-light)',  border: 'rgba(90,122,64,0.15)' },
  { to: '/app/explorer/entreprendre',   emoji: '🏢', title: 'Entreprendre',   desc: 'Créer son activité à Majorque',         bg: 'var(--ocre-light)',  border: 'rgba(196,122,90,0.15)' },
  { to: '/app/guides',                  emoji: '📚', title: 'Guides',          desc: '100+ fiches administratives',           bg: 'var(--vert-light)',  border: 'rgba(90,122,64,0.15)' },
  { to: '/app/explorer/accompagnements',emoji: '🤝', title: 'Accompagnement', desc: 'Suivi personnalisé par Amely',          bg: 'var(--ocre-light)',  border: 'rgba(196,122,90,0.15)' },
  { to: '/app/famille',                 emoji: '👨‍👩‍👧', title: 'En famille',    desc: 'Guide installation avec enfants',      bg: 'var(--vert-light)',  border: 'rgba(90,122,64,0.15)' },
  { to: '/app/explorer/contact',        emoji: '✉️', title: 'Contact',         desc: 'Question, partenariat, annuaire',       bg: 'var(--ocre-light)',  border: 'rgba(196,122,90,0.15)' },
]

export default function Explorer() {
  useSEO({
    title: "Explorer — Ressources pour vivre à Majorque",
    description: "Tous les outils, guides, annuaires et ressources pour votre installation à Majorque : simulateurs, annuaire de pros francophones, circuits, actualités.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer",
  })
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // Charger les guides pour la recherche cross-contenu
  const { data: guidesRaw } = useNotionDB(NOTION_DB.guides)
  const guides = useMemo(() => {
    if (!guidesRaw) return []
    return guidesRaw.map(parseGuide).filter(g => g.status === 'Publié')
  }, [guidesRaw])

  // Résultats fuzzy sur guides + sections Explorer
  const sections = CARDS.map(c => ({
    title: c.title, desc: c.desc, to: c.to, emoji: c.emoji, type: 'section'
  }))

  const results = useMemo(() => {
    if (!search.trim()) return null
    const guideResults = fuzzyFilter(
      search,
      guides,
      g => [g.title, g.category, ...(g.tags || [])],
      0.35
    ).slice(0, 8).map(g => ({ ...g, type: 'guide', to: `/app/guide/${g.id}` }))

    const sectionResults = fuzzyFilter(
      search,
      sections,
      s => [s.title, s.desc],
      0.4
    )

    return { guides: guideResults, sections: sectionResults }
  }, [search, guides, sections])

  return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="découvre" title="Explorer" accentColor={TERRA} traitColor={TERRA} />
        <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginTop: 4 }}>
          Ressources pour votre vie à Majorque
        </p>
      </div>

      {/* ── Barre de recherche fuzzy ── */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="search"
          placeholder="Chercher un guide, un outil, une section…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 42px',
            borderRadius: 'var(--radius)',
            border: search ? `1.5px solid ${TERRA}` : '1.5px solid var(--gris)',
            background: 'var(--bg-card)',
            fontSize: 15, fontFamily: 'var(--font-body)',
            color: 'var(--texte)',
            outline: 'none',
            boxShadow: search ? `0 0 0 3px ${TERRA}18` : 'none',
            transition: 'all 0.2s',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: 'var(--texte-sec)', padding: 4,
          }}>×</button>
        )}
      </div>

      {/* ── Résultats de recherche ── */}
      {results && (
        <div style={{ marginBottom: 24 }}>
          {results.guides.length === 0 && results.sections.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              color: 'var(--texte-sec)', fontSize: 15,
              fontFamily: 'var(--font-titre)', fontStyle: 'italic',
            }}>
              Aucun résultat pour « {search} »
            </div>
          ) : (
            <>
              {/* Guides trouvés */}
              {results.guides.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--texte-sec)', marginBottom: 8, textTransform: 'uppercase',
                  }}>Guides ({results.guides.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {results.guides.map(g => (
                      <Link key={g.id} to={g.to} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
                          padding: '12px 16px', border: '1px solid var(--gris)',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <span style={{ fontSize: 20 }}>📋</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: 'var(--font-titre)', fontWeight: 600,
                              fontSize: 14, color: 'var(--foret)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{g.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>
                              {g.category}
                            </div>
                          </div>
                          <span style={{ color: 'var(--texte-sec)', fontSize: 16 }}>›</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections trouvées */}
              {results.sections.length > 0 && (
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--texte-sec)', marginBottom: 8, textTransform: 'uppercase',
                  }}>Sections</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {results.sections.map(s => (
                      <Link key={s.to} to={s.to} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
                          padding: '12px 16px', border: '1px solid var(--gris)',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <span style={{ fontSize: 20 }}>{s.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontFamily: 'var(--font-titre)', fontWeight: 600,
                              fontSize: 14, color: 'var(--foret)',
                            }}>{s.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--texte-sec)', marginTop: 2 }}>
                              {s.desc}
                            </div>
                          </div>
                          <span style={{ color: 'var(--texte-sec)', fontSize: 16 }}>›</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Grille des sections (masquée si recherche active) ── */}
      {!search && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {CARDS.map(card => (
            <Link key={card.title} to={card.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                padding: '18px 16px',
                border: '1px solid var(--gris)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: 6,
                minHeight: 110,
              }}>
                <span style={{ fontSize: 26 }}>{card.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-titre)', fontWeight: 600,
                  fontSize: 'var(--fs-lg)', color: 'var(--foret)', lineHeight: 1.25,
                }}>{card.title}</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--texte-sec)', lineHeight: 1.40 }}>
                  {card.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
