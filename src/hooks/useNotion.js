import { useState, useEffect, useRef } from 'react'

const cache = {}

async function notionFetch(endpoint, id, filter = null) {
  const key = `${endpoint}:${id}:${JSON.stringify(filter)}`
  if (cache[key]) return cache[key]

  const res = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, database_id: id, filter }),
  })
  if (!res.ok) throw new Error(`Notion API error ${res.status}`)
  const data = await res.json()
  cache[key] = data
  return data
}

export function useNotionDB(dbId, filter = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const filterRef = useRef(JSON.stringify(filter))

  useEffect(() => {
    if (!dbId) return
    setLoading(true)
    notionFetch('query_database', dbId, filter)
      .then(res => setData(res.results || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [dbId, filterRef.current])

  return { data, loading, error }
}

/* Fetch une page Notion directement par son ID — sans passer par la liste */
export function useNotionPage(pageId) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pageId) return
    setLoading(true)
    notionFetch('get_page', pageId)
      .then(res => setPage(res))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [pageId])

  return { page, loading, error }
}

export function useNotionBlocks(pageId) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pageId) return
    setLoading(true)
    notionFetch('get_blocks', pageId)
      .then(res => setBlocks(res.results || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [pageId])

  return { blocks, loading, error }
}

export function parseGuide(page) {
  const p = page.properties || {}
  return {
    id: page.id,
    title: p.Titre?.title?.[0]?.plain_text || '(Sans titre)',
    category: p['Catégorie']?.select?.name || '',
    access: p.Access_Level?.select?.name || '🟢 Public',
    situation: p.Situation?.multi_select?.map(s => s.name) || [],
    sousProfil: p.Sous_profil?.multi_select?.map(s => s.name) || [],
    profil: p.Profil?.multi_select?.map(s => s.name) || [],
    tags: p.Tags?.multi_select?.map(t => t.name) || [],
    source: p.Source_officielle?.rich_text?.[0]?.plain_text || '',
    lien: p.Lien_formulaire_officiel?.url || '',
    isPiege: p['Piège_fréquent']?.checkbox || false,
    status: p.Statut_contenu?.select?.name || '',
  }
}

export function parseCockpit(page) {
  const p = page.properties || {}
  return {
    id: page.id,
    etape: p['Étape']?.title?.[0]?.plain_text || '',
    categorie: p['Catégorie']?.select?.name || '',
    phase: p.Phase?.select?.name || '',
    ordre: p.Ordre?.number || 0,
    priorite: p['Priorité']?.select?.name || '',
    statut: p.Statut?.select?.name || '⬜ À faire',
    access: p.Access_Level?.select?.name || '🟢 Public',
    profilCible: p.Profil_cible?.select?.name || '',
    guideId: p.Guide_lié?.relation?.[0]?.id || null,
    delai: p['Délai_légal']?.rich_text?.[0]?.plain_text || '',
    lien: p.Lien_formulaire?.url || '',
    eclaireur: p['Éclaireur_recommandé']?.checkbox || false,
  }
}

export function parseActu(page) {
  const p = page.properties || {}
  const lienUrl = p['Lien_externe']?.url || p.Lien?.url || ''
  let sourceDomain = ''
  if (lienUrl) {
    try { sourceDomain = new URL(lienUrl).hostname.replace('www.', '') } catch {}
  }
  return {
    id: page.id,
    title: p.Titre?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || '',
    date: p.Date?.date?.start || p['date:Date:start'] || '',
    categorie: p['Catégorie']?.select?.name || '',
    resume: p['Résumé']?.rich_text?.map(r => r.plain_text).join('') || p.Accroche?.rich_text?.[0]?.plain_text || '',
    lien: lienUrl,
    sourceDomain,
    tags: p.Tags?.multi_select?.map(t => t.name) || [],
    actif: p.Actif?.checkbox !== false,
  }
}

export function parseAnnuaire(page) {
  const p = page.properties || {}
  return {
    id: page.id,
    nom: p['Nom_professionnel']?.title?.[0]?.plain_text || p.Nom?.title?.[0]?.plain_text || '',
    metier: p['Profession']?.select?.name || p['Métier']?.select?.name || p['Catégorie']?.select?.name || '',
    ville: p['Zone_géographique']?.multi_select?.[0]?.name || p.Ville?.select?.name || '',
    langue: p['Langues']?.multi_select?.map(l => l.name) || p.Langue?.multi_select?.map(l => l.name) || [],
    tel: p['Téléphone']?.phone_number || p.Tel?.phone_number || '',
    email: p.Email?.email || '',
    site: p['Site_web']?.url || p.Site?.url || '',
    instagram: p.Instagram?.url || '',
    description: p['Description_FR']?.rich_text?.[0]?.plain_text || p.Description?.rich_text?.[0]?.plain_text || '',
    maps: p['Google_Maps']?.url || '',
    acces: p['Access_Level']?.select?.name || '🟢 Public',
    statut: p['Statut']?.select?.name || '',
  }
}

export function parseLifestyle(page) {
  const p = page.properties || {}
  return {
    id: page.id,
    title: p.Titre?.title?.[0]?.plain_text || '',
    category: p['Catégorie']?.select?.name || '',
    access: p.Access_Level?.select?.name || '🟢 Public',
    zone: p.Zone?.multi_select?.map(z => z.name) || [],
    saison: p.Saison?.multi_select?.map(s => s.name) || [],
    public: p.Public?.multi_select?.map(p => p.name) || [],
    tags: p.Tags?.multi_select?.map(t => t.name) || [],
    lien: p.Lien_externe?.url || '',
    status: p.Statut_contenu?.select?.name || '',
  }
}
