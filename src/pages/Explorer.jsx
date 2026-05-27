import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNotionDB, parseAnnuaire, parseLifestyle } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import { NOTION_DB } from '../config'

const TABS_EXPLORER = [
  { id: 'annuaire', label: 'Annuaire', emoji: '👥' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '🌺' },
  { id: 'outils', label: 'Outils', emoji: '🧮' },
]

const OUTILS = [
  { id: 'budget', emoji: '💶', title: 'Budget mensuel', desc: 'Estimez vos dépenses à Majorque', href: '/app/outils/budget' },
  { id: 'autonoma', emoji: '📊', title: 'Simulateur autónoma', desc: 'Calcul charges et net en poche', href: '/app/outils/autonoma' },
  { id: 'comparateur', emoji: '⚖️', title: 'Comparateur de statuts', desc: 'France AE vs Espagne autónomo', href: '/app/outils/comparateur' },
  { id: 'cout', emoji: '🏠', title: "Coût d'installation", desc: "Budget pour s'installer", href: '/app/outils/cout' },
  { id: 'fiscal', emoji: '📅', title: 'Calendrier fiscal', desc: 'Échéances IVA, IRPF, cotización', href: '/app/outils/fiscal' },
]

function AnnuaireTab() {
  const { data, loading } = useNotionDB(NOTION_DB.annuaire)
  const [search, setSearch] = useState('')

  const pros = useMemo(() => {
    return data
      .map(parseAnnuaire)
      .filter(p => !search || p.nom.toLowerCase().includes(search.toLowerCase()) || p.metier.toLowerCase().includes(search.toLowerCase()))
  }, [data, search])

  if (loading) return <div className="spinner">Chargement…</div>

  return (
    <div>
      <input
        className="search-input"
        placeholder="Rechercher un pro…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      {pros.length === 0 ? (
        <div className="empty">Aucun professionnel trouvé.</div>
      ) : (
        pros.map(pro => (
          <div key={pro.id} className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--foret)' }}>{pro.nom}</p>
                {pro.metier && <span className="badge badge-vert" style={{ fontSize: 10 }}>{pro.metier}</span>}
              </div>
              {pro.ville && <span style={{ fontSize: 12, color: 'var(--texte-sec)' }}>📍 {pro.ville}</span>}
            </div>
            {pro.description && (
              <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 8, lineHeight: 1.5 }}>{pro.description}</p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pro.tel && (
                <a href={`tel:${pro.tel}`} style={{ fontSize: 12, color: 'var(--vert-dark)' }}>📞 {pro.tel}</a>
              )}
              {pro.email && (
                <a href={`mailto:${pro.email}`} style={{ fontSize: 12, color: 'var(--vert-dark)' }}>✉️ {pro.email}</a>
              )}
              {pro.site && (
                <a href={pro.site} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--vert-dark)' }}>🌐 Site</a>
              )}
              {pro.instagram && (
                <a href={pro.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--ocre)' }}>📷 Instagram</a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function LifestyleTab() {
  const { data, loading } = useNotionDB(NOTION_DB.lifestyle)
  const { canAccess } = usePremium()
  const [catFilter, setCatFilter] = useState('Tous')

  const items = useMemo(() => {
    return data
      .map(parseLifestyle)
      .filter(l => l.status === 'Publié')
      .filter(l => catFilter === 'Tous' || l.category === catFilter)
  }, [data, catFilter])

  const categories = useMemo(() => {
    const cats = [...new Set(data.map(parseLifestyle).map(l => l.category).filter(Boolean))]
    return ['Tous', ...cats]
  }, [data])

  if (loading) return <div className="spinner">Chargement…</div>

  return (
    <div>
      <div className="filter-pills" style={{ marginBottom: 12 }}>
        {categories.map(c => (
          <button key={c} className={`pill ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="empty">Contenu à venir bientôt…</div>
      ) : (
        items.map(item => {
          const accessible = canAccess(item.access)
          return (
            <div key={item.id} className="card" style={{ marginBottom: 8, opacity: accessible ? 1 : 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span className="badge badge-vert" style={{ fontSize: 10 }}>{item.category}</span>
                {!accessible && <span className="badge badge-miel" style={{ fontSize: 10 }}>💎</span>}
              </div>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--foret)', marginBottom: 4 }}>{item.title}</p>
              {item.zone.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>📍 {item.zone.join(', ')}</p>
              )}
              {item.lien && accessible && (
                <a href={item.lien} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--vert-dark)', marginTop: 6, display: 'inline-block' }}>
                  En savoir plus →
                </a>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

function OutilsTab() {
  return (
    <div>
      {OUTILS.map(o => (
        <a key={o.id} href={o.href} style={{ textDecoration: 'none' }}>
          <div className="card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>{o.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--foret)', marginBottom: 2 }}>{o.title}</p>
              <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>{o.desc}</p>
            </div>
            <span style={{ color: 'var(--vert)', fontSize: 18 }}>→</span>
          </div>
        </a>
      ))}
    </div>
  )
}

export default function Explorer() {
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'annuaire'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 12 }}>
          Explorer
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS_EXPLORER.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: activeTab === t.id ? 600 : 400,
                background: activeTab === t.id ? 'var(--vert)' : '#fff',
                color: activeTab === t.id ? '#fff' : 'var(--texte-sec)',
                border: `1px solid ${activeTab === t.id ? 'var(--vert)' : 'var(--gris)'}`,
                cursor: 'pointer',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'annuaire' && <AnnuaireTab />}
      {activeTab === 'lifestyle' && <LifestyleTab />}
      {activeTab === 'outils' && <OutilsTab />}
    </div>
  )
}
