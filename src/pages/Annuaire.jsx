import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseAnnuaire } from '../hooks/useNotion'
import { NOTION_DB } from '../config'
import { AccentWord, TERRA, VERT } from '../components/WaveTitle'
import { useSEO } from '../hooks/useSEO'

/* ── Badge Nouveau — fiche < 30 jours ── */
const isNew = (createdAt) => {
  if (!createdAt) return false
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 30 * 24 * 60 * 60 * 1000
}

/* ── Emojis par catégorie ── */
const CAT_EMOJI = {
  'Médecin':           '🩺', 'Médecin généraliste': '🩺', 'Médecin de famille': '🩺',
  'Dentiste':          '🦷', 'Dentisterie': '🦷',
  'Avocat':            '⚖️', 'Avocate': '⚖️', 'Droit': '⚖️',
  'Gestor':            '📊', 'Gestoria': '📊', 'Comptable': '📊', 'Expert-comptable': '📊',
  'Architecte':        '🏛️',
  'Notaire':           '📜',
  'Traducteur':        '🌐', 'Traduction': '🌐', 'Traductrice': '🌐',
  'Photographe':       '📸',
  'Tatoueur':          '🖋️', 'Tatouage': '🖋️',
  'Coach':             '🎯', 'Coaching': '🎯',
  'Psychologue':       '🧠', 'Thérapie': '🧠',
  'Kinésithérapeute':  '💆', 'Kiné': '💆', 'Ostéopathie': '💆',
  'Vétérinaire':       '🐾',
  'Immobilier':        '🏡', 'Agence immobilière': '🏡',
  'Assurances':        '🛡️', 'Assurance': '🛡️',
  'Banque':            '🏦',
  'Transport':         '🚗', 'Déménagement': '🚚',
  'Jardinier':         '🌿', 'Jardinage': '🌿',
  'Électricien':       '⚡',
  'Plombier':          '🔧',
  'École':             '📚', 'Cours': '📚', 'Soutien scolaire': '📚',
  'Coiffeur':          '✂️', 'Coiffure': '✂️',
  'Naturopathe':       '🌱',
  'Professions de santé': '🏥',
  'Tatoueur':          '🖋️', 'Tatouage': '🖋️', 'Tattoo': '🖋️',
  'À venir':           '🔜',
}
const catEmoji = cat => CAT_EMOJI[cat] || '📋'

/* ── Langues ── */
const LANG_FLAG = { 'Français': '🇫🇷', 'Espagnol': '🇪🇸', 'Anglais': '🇬🇧', 'Allemand': '🇩🇪', 'Catalan': '🟡' }
const langFlag = l => LANG_FLAG[l] || '🌐'

/* ── Zones ── */
const ZONES = ['Toute l\'île', 'Palma', 'Campos', 'Sud', 'Nord', 'Est', 'Ouest', 'Distance']
const zoneShort = z => ({ 'Toute l\'île': 'Île', 'Distance': '💻' }[z] || z)

/* ─────────────────────────────────────────────
   Carte professionnel
───────────────────────────────────────────── */
function ProCard({ pro }) {
  const hasContact = !!pro.maps
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--gris)',
      borderRadius: 'var(--radius)',
      marginBottom: 8,
      overflow: 'hidden',
      opacity: hasContact ? 1 : 0.7,
    }}>
      {/* En-tête */}
      <div
        onClick={() => hasContact && setExpanded(e => !e)}
        style={{
          padding: '14px 14px 10px',
          cursor: hasContact ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <p style={{
            fontFamily: 'var(--font-titre)', fontWeight: 600,
            fontSize: 17, color: 'var(--foret)', lineHeight: 1.30, flex: 1,
          }}>
            {pro.nom}
          </p>
          {hasContact
            ? <span style={{ color: 'var(--texte-sec)', fontSize: 12, marginTop: 3, flexShrink: 0 }}>
                {expanded ? '▲' : '▼'}
              </span>
            : <span style={{
                fontSize: 13, fontWeight: 700, background: 'var(--gris)',
                color: 'var(--texte-sec)', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
              }}>Bientôt</span>
          }
        </div>

        {/* Badges : ville + langues + note Google */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {pro.ville && (
            <span style={{
              fontSize: 12, color: 'var(--texte-sec)',
              background: 'var(--gris)', padding: '2px 8px', borderRadius: 20,
            }}>
              📍 {pro.ville}
            </span>
          )}

          {pro.langue?.filter(l => LANG_FLAG[l]).map(l => (
            <span key={l} style={{
              fontSize: 12, background: 'rgba(90,173,165,0.10)',
              color: 'var(--vert)', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            }}>
              {langFlag(l)} {l}
            </span>
          ))}
          {isNew(pro.createdAt) && (
            <span style={{
              fontSize: 13, fontWeight: 800, letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, var(--terra), #E8834A)',
              color: 'white', padding: '2px 8px', borderRadius: 20,
            }}>🆕 Nouveau</span>
          )}
        </div>

        {/* Description toujours visible (tronquée si non expanded) */}
        {pro.description && (
          <p style={{
            fontSize: 14, color: 'var(--texte-sec)', lineHeight: 1.50, marginTop: 8,
            display: expanded ? 'block' : '-webkit-box',
            WebkitLineClamp: expanded ? undefined : 2,
            WebkitBoxOrient: 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
          }}>
            {pro.description}
          </p>
        )}
      </div>

      {/* Actions — uniquement Google Maps */}
      {pro.maps && expanded && (
        <div style={{
          borderTop: '1px solid var(--gris)',
          padding: '10px 14px',
        }}>
          <a href={pro.maps} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--foret)', color: 'white',
            borderRadius: 20, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            📍 Voir sur Google Maps
          </a>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Barre de recherche
───────────────────────────────────────────── */
function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 16, color: 'var(--texte-sec)', pointerEvents: 'none',
      }}>🔍</span>
      <input
        type="text"
        placeholder="Rechercher un professionnel…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 36px 11px 38px',
          border: '1.5px solid var(--gris)', borderRadius: 12,
          fontSize: 16, fontFamily: 'var(--font-corps)',
          background: 'white', color: 'var(--texte)',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: 'var(--texte-sec)', padding: 0,
        }}>×</button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Pills filtres
───────────────────────────────────────────── */
function FilterPills({ zoneFilter, setZoneFilter, langFilter, setLangFilter, availableZones, hasFranco }) {
  const Pill = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1.5px solid ${active ? 'var(--vert)' : 'var(--gris)'}`,
      background: active ? 'var(--vert-light)' : 'white',
      color: active ? 'var(--vert)' : 'var(--texte-sec)',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
      <Pill active={!zoneFilter} onClick={() => setZoneFilter(null)} label="📍 Toute l'île" />
      {availableZones.filter(z => z !== 'Toute l\'île').map(z => (
        <Pill key={z} active={zoneFilter === z} onClick={() => setZoneFilter(zoneFilter === z ? null : z)} label={zoneShort(z)} />
      ))}
      {hasFranco && (
        <Pill
          active={langFilter}
          onClick={() => setLangFilter(v => !v)}
          label="🇫🇷 Parle français"
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function Annuaire() {
  useSEO({
    title: "Annuaire professionnels francophones Majorque",
    description: "Professionnels francophones à Majorque : médecins, gestors, avocats, architectes, traducteurs. Annuaire vérifié par Amely, française à Campos.",
    url: "https://vivre-a-majorque.vercel.app/app/explorer/annuaire",
  })
  const navigate = useNavigate()
  const { data, loading } = useNotionDB(NOTION_DB.annuaire)
  const [selectedCat, setSelectedCat] = useState(null)
  const [search, setSearch] = useState('')
  const [zoneFilter, setZoneFilter] = useState(null)
  const [langFilter, setLangFilter] = useState(false)

  const pros = useMemo(() =>
    data.map(parseAnnuaire).filter(p => p.nom && p.statut !== 'Archivé'),
    [data]
  )

  /* Zones disponibles */
  const availableZones = useMemo(() => {
    const zones = new Set()
    pros.forEach(p => { if (p.ville) zones.add(p.ville) })
    return [...zones].sort()
  }, [pros])

  const hasFranco = useMemo(() =>
    pros.some(p => p.langue?.includes('Français')), [pros]
  )

  /* Filtre combiné */
  const applyFilters = (list) => {
    let r = list
    if (zoneFilter) r = r.filter(p => p.ville === zoneFilter)
    if (langFilter) r = r.filter(p => p.langue?.includes('Français'))
    return r
  }

  /* Recherche */
  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return applyFilters(pros.filter(p =>
      p.nom.toLowerCase().includes(q) ||
      p.metier.toLowerCase().includes(q) ||
      p.ville.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ))
  }, [pros, search, zoneFilter, langFilter])

  /* Catégories — pros avec contact d'abord, "À venir" à la fin */
  const categories = useMemo(() => {
    const catMap = {}
    const filtered = applyFilters(pros)
    filtered.forEach(p => {
      const cat = p.metier || 'À venir'
      if (!catMap[cat]) catMap[cat] = { total: 0, withContact: 0, hasFr: false }
      catMap[cat].total++
      if (p.tel || p.email || p.maps || p.site) catMap[cat].withContact++
      if (p.langue?.includes('Français')) catMap[cat].hasFr = true
    })
    return Object.entries(catMap).sort((a, b) => {
      if (a[0] === 'À venir') return 1
      if (b[0] === 'À venir') return -1
      if (b[1].withContact !== a[1].withContact) return b[1].withContact - a[1].withContact
      return a[0].localeCompare(b[0])
    })
  }, [pros, zoneFilter, langFilter])

  /* Pros dans une catégorie */
  const filtered = useMemo(() => {
    if (!selectedCat) return []
    return applyFilters(pros.filter(p => (p.metier || 'À venir') === selectedCat))
      .sort((a, b) => {
        const aHas = !!(a.tel || a.email || a.maps)
        const bHas = !!(b.tel || b.email || b.maps)
        return bHas - aHas
      })
  }, [pros, selectedCat, zoneFilter, langFilter])

  const BackBtn = ({ onClick, label }) => (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vert)',
      fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 5,
    }}>← {label}</button>
  )

  const PageTitle = ({ children }) => (
    <h1 style={{
      fontFamily: 'var(--font-titre)', fontStyle: 'italic', fontWeight: 300,
      fontSize: 'var(--fs-2xl)', color: 'var(--foret)', lineHeight: 1.25, marginBottom: 14,
    }}>{children}</h1>
  )

  if (loading) return (
    <div className="page">
      <BackBtn onClick={() => navigate('/app/explorer')} label="Explorer" />
      <PageTitle>Annuaire</PageTitle>
      <div className="spinner">Chargement…</div>
    </div>
  )

  /* ── Vue recherche ── */
  if (searchResults !== null) return (
    <div className="page">
      <BackBtn onClick={() => { setSearch(''); setSelectedCat(null) }} label="Catégories" />
      <PageTitle>Annuaire</PageTitle>
      <SearchBar value={search} onChange={v => { setSearch(v); setSelectedCat(null) }} />
      <FilterPills
        zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
        langFilter={langFilter} setLangFilter={setLangFilter}
        availableZones={availableZones} hasFranco={hasFranco}
      />
      <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 14 }}>
        {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
      </p>
      {searchResults.length === 0
        ? <div className="empty">Aucun résultat pour « {search} »</div>
        : searchResults.map(pro => <ProCard key={pro.id} pro={pro} />)
      }
    </div>
  )

  /* ── Vue catégorie ── */
  if (selectedCat) {
    const avenir = filtered.filter(p => !(p.tel || p.email || p.maps || p.site))
    const actifs = filtered.filter(p => !!(p.tel || p.email || p.maps || p.site))
    return (
      <div className="page">
        <BackBtn onClick={() => setSelectedCat(null)} label="Catégories" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{catEmoji(selectedCat)}</span>
          <h1 style={{
            fontFamily: 'var(--font-titre)', fontWeight: 600,
            fontSize: 'var(--fs-xl)', color: 'var(--foret)', lineHeight: 1.25,
          }}>{selectedCat}</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 14 }}>
          {actifs.length} professionnel{actifs.length !== 1 ? 's' : ''}
          {avenir.length > 0 && ` · ${avenir.length} à venir`}
        </p>
        <SearchBar value={search} onChange={v => { setSearch(v); setSelectedCat(null) }} />
        <FilterPills
          zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
          langFilter={langFilter} setLangFilter={setLangFilter}
          availableZones={availableZones} hasFranco={hasFranco}
        />
        {filtered.length === 0
          ? <div className="empty">Aucun résultat avec ces filtres.</div>
          : <>
              {actifs.map(pro => <ProCard key={pro.id} pro={pro} />)}
              {avenir.length > 0 && (
                <div style={{
                  background: 'var(--gris)', borderRadius: 'var(--radius)',
                  padding: '14px 16px', marginTop: 12,
                }}>
                  <p style={{ fontSize: 13, color: 'var(--texte-sec)', fontWeight: 600, marginBottom: 8 }}>
                    🔜 Bientôt disponible
                  </p>
                  {avenir.map(pro => (
                    <p key={pro.id} style={{ fontSize: 14, color: 'var(--texte-sec)', marginBottom: 4 }}>
                      · {pro.nom} {pro.ville ? `— ${pro.ville}` : ''}
                    </p>
                  ))}
                </div>
              )}
            </>
        }
      </div>
    )
  }

  /* ── Vue grille catégories ── */
  const catsActives = categories.filter(([cat]) => cat !== 'À venir')
  const catsAvenir = categories.filter(([cat]) => cat === 'À venir')

  return (
    <div className="page">
      <BackBtn onClick={() => navigate('/app/explorer')} label="Explorer" />
      <PageTitle>Annuaire</PageTitle>
      <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginBottom: 14, lineHeight: 1.50 }}>
        Professionnels vérifiés recommandés par la communauté francophone de Majorque.
      </p>
      <SearchBar value={search} onChange={setSearch} />
      <FilterPills
        zoneFilter={zoneFilter} setZoneFilter={setZoneFilter}
        langFilter={langFilter} setLangFilter={setLangFilter}
        availableZones={availableZones} hasFranco={hasFranco}
      />

      {categories.length === 0 ? (
        <div className="empty">Aucun professionnel pour ces filtres.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {catsActives.map(([cat, info]) => (
              <button key={cat} onClick={() => setSelectedCat(cat)} style={{
                background: 'white', border: '1px solid var(--gris)',
                borderRadius: 'var(--radius)', padding: '16px 14px',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 6,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Trait vert si francophones disponibles */}
                {info.hasFr && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'var(--vert)', borderRadius: '14px 14px 0 0',
                  }} />
                )}
                <span style={{ fontSize: 24, lineHeight: 1 }}>{catEmoji(cat)}</span>
                <span style={{
                  fontFamily: 'var(--font-titre)', fontSize: 15,
                  color: 'var(--foret)', fontWeight: 600, lineHeight: 1.30,
                }}>{cat}</span>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                    {info.withContact} contact{info.withContact !== 1 ? 's' : ''}
                  </span>
                  {info.hasFr && (
                    <span style={{
                      fontSize: 13, color: 'var(--vert)', fontWeight: 700,
                      background: 'var(--vert-light)', padding: '1px 6px', borderRadius: 20,
                    }}>🇫🇷</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* À venir — encadré discret */}
          {catsAvenir.length > 0 && (
            <div style={{
              background: 'var(--gris)', borderRadius: 'var(--radius)',
              padding: '14px 16px', marginBottom: 12,
            }}>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', fontWeight: 600, marginBottom: 4 }}>
                🔜 D'autres professions arrivent bientôt
              </p>
              <p style={{ fontSize: 13, color: 'var(--texte-sec)' }}>
                Tu connais un bon professionnel francophone ? Suggère-le via le formulaire de contact.
              </p>
            </div>
          )}

          {/* Encart — rejoindre l'annuaire */}
          <div
            onClick={() => navigate('/app/explorer/contact', { state: { sujet: 'annuaire' } })}
            style={{
              background: 'var(--foret)', borderRadius: 'var(--radius)',
              padding: '16px 18px', marginTop: 4, cursor: 'pointer',
              display: 'flex', gap: 14, alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>📋</span>
            <div>
              <p style={{
                fontSize: 14, fontWeight: 700, color: '#F7F2EB',
                fontFamily: 'var(--font-titre)', marginBottom: 3, lineHeight: 1.3,
              }}>
                Vous voulez figurer dans l'annuaire ?
              </p>
              <p style={{
                fontSize: 13, color: 'rgba(247,242,235,0.7)',
                fontFamily: 'var(--font-corps)', lineHeight: 1.5,
              }}>
                Envoyez-moi un message — je référence les professionnels francophones et les organismes utiles à Majorque.
              </p>
            </div>
            <span style={{ color: 'rgba(247,242,235,0.5)', fontSize: 18, flexShrink: 0 }}>›</span>
          </div>
        </>
      )}
    </div>
  )
}
