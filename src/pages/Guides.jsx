import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotionDB, parseGuide } from '../hooks/useNotion'
import { useProfile } from '../context/ProfileContext'
import { usePremium } from '../context/PremiumContext'
import { PaywallModal } from '../components/PaywallModal'
import { NOTION_DB, GUIDE_CATEGORIES, PROFILS } from '../config'
import AccompagnementBanner from '../components/AccompagnementBanner'
import { PageHeading, AccentWord } from '../components/WaveTitle'

const CAT_EMOJIS = {
  'Administratif': '📋', 'Logement': '🏠', 'Travail': '💼',
  'Santé': '🏥', 'Famille': '👨‍👩‍👧', 'Argent': '💶',
  'Voiture': '🚗', 'Animaux': '🐾', 'Déménagement': '📦', 'Vie pratique': '🌿',
}

const TERRA = 'var(--terra)'
const VERT  = 'var(--vert)'

/* ─────────────────────────────────────────────
   Matching profil → guide.situation
   Inclusive : "Les deux" / "Tous" matchent tout
───────────────────────────────────────────── */
function matchesProfile(guide, profile) {
  if (!profile) return false
  const sits = guide.situation || []
  if (!sits.length) return false
  if (sits.includes('Tous') || sits.includes('Les deux')) return true
  return sits.some(s => {
    if (profile.id === 'reve')     return s === 'Je rêve'
    if (profile.id === 'installe') return s === "Je m'installe" || s === 'En préparation'
    if (profile.id === 'premiere') return s === 'Déjà installé' || s === 'Je vis ici 1ère année'
    if (profile.id === 'confirme') return s === 'Je vis ici confirmé'
    return s === profile.notion
  })
}

/* Badge "Pour vous" */
function PourVousBadge({ color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 12, fontWeight: 700,
      color: color || 'var(--vert)',
      background: `${color || 'var(--vert)'}18`,
      border: `1px solid ${color || 'var(--vert)'}40`,
      borderRadius: 20, padding: '2px 7px',
      fontFamily: 'var(--font-accent)',
      letterSpacing: '0.01em',
    }}>
      ✦ Pour vous
    </span>
  )
}

/* Pill de tri */
function SortPill({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 14px', borderRadius: 20,
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: `1.5px solid ${active ? 'var(--vert)' : 'var(--gris)'}`,
      background: active ? 'var(--vert-light)' : 'var(--bg-card)',
      color: active ? 'var(--vert)' : 'var(--texte-sec)',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  )
}

function applyFreemiumRule(guides) {
  const freeCount = Math.max(1, Math.ceil(guides.length * 0.30))
  return guides.map((g, i) => ({ ...g, freemiumFree: i < freeCount }))
}

/* ─────────────────────────────────────────────
   Carte guide dans la grille catégorie
───────────────────────────────────────────── */
function GuideCard({ guide, onOpen, onPaywall, profile }) {
  const { canAccess } = usePremium()
  const accessible = guide.freemiumFree || canAccess(guide.access)
  const isForMe = matchesProfile(guide, profile)
  const profileColor = profile?.color || 'var(--vert)'

  return (
    <div
      onClick={() => accessible ? onOpen(guide.id) : onPaywall()}
      style={{
        background: accessible ? 'white' : 'var(--gris)',
        border: isForMe
          ? `1.5px solid ${profileColor}50`
          : `1px solid ${accessible ? 'var(--gris)' : 'rgba(0,0,0,0.06)'}`,
        borderLeft: isForMe ? `3px solid ${profileColor}` : undefined,
        borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
        position: 'relative', minHeight: 80,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'border 0.15s',
      }}
    >
      {!accessible && (
        <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 14, color: 'var(--texte-sec)' }}>🔒</span>
      )}
      <p style={{
        fontWeight: 500, fontSize: 14,
        color: accessible ? 'var(--foret)' : 'var(--texte-sec)',
        lineHeight: 1.40,
        display: '-webkit-box', WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
        marginBottom: 8,
      }}>
        {guide.title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        {isForMe && <PourVousBadge color={profileColor} />}
        {accessible
          ? <span style={{ fontSize: 13, color: 'var(--foret)', fontWeight: 600, marginLeft: 'auto' }}>Lire →</span>
          : <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>Premium</span>
        }
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Carte résultat de recherche
───────────────────────────────────────────── */
function SearchResultCard({ guide, onOpen, onPaywall, profile }) {
  const { canAccess } = usePremium()
  const accessible = canAccess(guide.access)
  const isForMe = matchesProfile(guide, profile)
  const profileColor = profile?.color || 'var(--vert)'

  return (
    <div
      onClick={() => accessible ? onOpen(guide.id) : onPaywall()}
      style={{
        background: accessible ? 'white' : 'var(--gris)',
        border: isForMe ? `1.5px solid ${profileColor}50` : '1px solid var(--gris)',
        borderLeft: isForMe ? `3px solid ${profileColor}` : undefined,
        borderRadius: 12, padding: '14px 16px',
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: accessible ? 'var(--foret)' : 'var(--texte-sec)', lineHeight: 1.40, marginBottom: 5 }}>
          {guide.title}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--texte-sec)', background: 'var(--gris)', padding: '2px 8px', borderRadius: 20 }}>
            {CAT_EMOJIS[guide.category] || '📄'} {guide.category}
          </span>
          {isForMe && <PourVousBadge color={profileColor} />}
        </div>
      </div>
      <span style={{ fontSize: 16, marginLeft: 10, flexShrink: 0 }}>
        {accessible ? '→' : '🔒'}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function Guides() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { data, loading } = useNotionDB(NOTION_DB.guides)
  const [selectedCat, setSelectedCat] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [search, setSearch] = useState('')
  const [sortForMe, setSortForMe] = useState(false)

  /* Profil actif enrichi avec couleur */
  const activeProfile = useMemo(() =>
    profile ? PROFILS.find(p => p.id === profile.id) || profile : null
  , [profile])

  const guides = useMemo(() =>
    data.map(parseGuide).filter(g => g.status === 'Publié')
  , [data])

  /* Résultats de recherche */
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return guides.filter(g => g.title.toLowerCase().includes(q)).slice(0, 20)
  }, [guides, search])

  /* Catégories avec compteur "pour vous" */
  const categories = useMemo(() => {
    const byCategory = {}
    guides.forEach(g => {
      const cat = g.category || 'Autres'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(g)
    })
    const result = []
    GUIDE_CATEGORIES.forEach(cat => {
      if (byCategory[cat]) {
        const all = byCategory[cat]
        const total = all.length
        const freeCount = Math.max(1, Math.ceil(total * 0.30))
        const forMeCount = activeProfile
          ? all.filter(g => matchesProfile(g, activeProfile)).length
          : 0
        result.push({ cat, total, freeCount, forMeCount })
      }
    })
    if (byCategory['Autres']) {
      const all = byCategory['Autres']
      const total = all.length
      const freeCount = Math.max(1, Math.ceil(total * 0.30))
      const forMeCount = activeProfile
        ? all.filter(g => matchesProfile(g, activeProfile)).length
        : 0
      result.push({ cat: 'Autres', total, freeCount, forMeCount })
    }
    return result
  }, [guides, activeProfile])

  /* Guides d'une catégorie, avec tri optionnel */
  const catGuides = useMemo(() => {
    if (!selectedCat) return []
    const filtered = guides.filter(g => (g.category || 'Autres') === selectedCat)
    const sorted = [
      ...filtered.filter(g => g.access === '🟢 Public'),
      ...filtered.filter(g => g.access !== '🟢 Public'),
    ]
    const withFreemium = applyFreemiumRule(sorted)
    if (sortForMe && activeProfile) {
      return [
        ...withFreemium.filter(g => matchesProfile(g, activeProfile)),
        ...withFreemium.filter(g => !matchesProfile(g, activeProfile)),
      ]
    }
    return withFreemium
  }, [guides, selectedCat, sortForMe, activeProfile])

  /* Barre de recherche */
  const SearchBar = (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--texte-sec)' }}>🔍</span>
      <input
        type="text"
        placeholder="Rechercher un guide…"
        value={search}
        onChange={e => { setSearch(e.target.value); setSelectedCat(null) }}
        style={{
          width: '100%', padding: '11px 36px 11px 38px',
          border: '1.5px solid var(--gris)', borderRadius: 12,
          fontSize: 16, background: 'white', color: 'var(--foret)',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
      {search && (
        <button onClick={() => setSearch('')} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--texte-sec)',
        }}>×</button>
      )}
    </div>
  )

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="ta boîte à outils" title="Guides" accentColor={VERT} traitColor={VERT} />
      </div>
      {SearchBar}
      <div className="spinner">Chargement des guides…</div>
    </div>
  )

  /* ── Vue recherche ── */
  if (search.trim()) return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="ta boîte à outils" accent="Guides" color={VERT} accentSize={34} />
      </div>
      {SearchBar}
      <p style={{ fontSize: 14, color: 'var(--texte-sec)', marginBottom: 12 }}>
        {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} pour « {search} »
      </p>
      {searchResults.length === 0
        ? <div className="empty">Aucun guide trouvé.</div>
        : searchResults.map(g => (
          <SearchResultCard key={g.id} guide={g}
            onOpen={id => navigate(`/app/guide/${id}`)}
            onPaywall={() => setShowPaywall(true)}
            profile={activeProfile}
          />
        ))
      }
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )

  /* ── Vue catégorie ── */
  if (selectedCat) {
    const lockedCount = catGuides.filter(g => !g.freemiumFree && g.access !== '🟢 Public').length
    const forMeInCat = activeProfile ? catGuides.filter(g => matchesProfile(g, activeProfile)).length : 0

    return (
      <div className="page">
        <div className="page-header">
          <button onClick={() => { setSelectedCat(null); setSortForMe(false) }} style={{
            background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
            color: 'var(--foret)', padding: 0, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← <span style={{ fontSize: 14 }}>Catégories</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{CAT_EMOJIS[selectedCat] || '📄'}</span>
            <AccentWord color={VERT} size={26}>{selectedCat}</AccentWord>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--texte-sec)' }}>
              {catGuides.length} guide{catGuides.length > 1 ? 's' : ''}
            </span>
            {lockedCount > 0 && (
              <span onClick={() => setShowPaywall(true)} style={{ fontSize: 13, color: 'var(--foret)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}>
                · {lockedCount} en Premium →
              </span>
            )}
          </div>
        </div>

        {SearchBar}

        {/* Pill tri "Pour moi en premier" — visible si profil actif */}
        {activeProfile && forMeInCat > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
            <SortPill
              active={sortForMe}
              onClick={() => setSortForMe(v => !v)}
              label={`${activeProfile.emoji} Pour moi en premier (${forMeInCat})`}
            />
          </div>
        )}

        {catGuides.length === 0
          ? <div className="empty">Aucun guide dans cette catégorie.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {catGuides.map(g => (
                <GuideCard key={g.id} guide={g}
                  onOpen={id => navigate(`/app/guide/${id}`)}
                  onPaywall={() => setShowPaywall(true)}
                  profile={activeProfile}
                />
              ))}
            </div>
        }
        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    )
  }

  /* ── Vue grille catégories ── */
  return (
    <div className="page">
      <div className="page-header">
        <PageHeading label="ta boîte à outils" title="Guides" accentColor={VERT} traitColor={VERT} />
        {activeProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 14 }}>{activeProfile.emoji}</span>
            <span style={{ fontSize: 14, color: 'var(--texte-sec)' }}>{activeProfile.label}</span>
            <span style={{ fontSize: 12, color: activeProfile.color, background: `${activeProfile.color}15`, padding: '1px 8px', borderRadius: 20, fontWeight: 600, marginLeft: 2 }}>
              ✦ guides fléchés pour vous
            </span>
          </div>
        )}
      </div>

      {SearchBar}

      {categories.length === 0
        ? <div className="empty">Aucun guide disponible pour le moment.</div>
        : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {categories.map(({ cat, total, freeCount, forMeCount }) => (
              <button key={cat} onClick={() => setSelectedCat(cat)} style={{
                background: 'white', border: '1px solid var(--gris)', borderRadius: 14,
                padding: '18px 14px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Trait coloré en haut si guides pertinents */}
                {activeProfile && forMeCount > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: activeProfile.color,
                    borderRadius: '14px 14px 0 0',
                  }} />
                )}
                <span style={{ fontSize: 26 }}>{CAT_EMOJIS[cat] || '📄'}</span>
                <span style={{ fontFamily: 'var(--font-titre)', fontSize: 'var(--fs-lg)', color: 'var(--foret)', fontWeight: 600, lineHeight: 1.30 }}>{cat}</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{freeCount} gratuit{freeCount > 1 ? 's' : ''}</span>
                  {total - freeCount > 0 && (
                    <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 20, background: 'var(--vert-light)', color: 'var(--foret)', fontWeight: 600 }}>
                      +{total - freeCount} Premium
                    </span>
                  )}
                </div>
                {/* Badge "pour vous" sur la tuile */}
                {activeProfile && forMeCount > 0 && (
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: activeProfile.color,
                    fontFamily: 'var(--font-accent)',
                  }}>
                    ✦ {forMeCount} pour vous
                  </span>
                )}
              </button>
            ))}
          </div>
      }

      <AccompagnementBanner
        texte="Vous préférez être guidé·e plutôt que lire les guides seul·e ? Visio, dossier complet ou accompagnement intégral — à vous de choisir."
        cta="Voir les accompagnements →"
      />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
