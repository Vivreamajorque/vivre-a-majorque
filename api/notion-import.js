// Fonction temporaire d'import annuaire — à supprimer après usage
const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Import-Secret')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  // Sécurité basique
  const secret = req.headers['x-import-secret']
  if (secret !== 'amely2026import') return res.status(401).json({ error: 'Unauthorized' })

  const key = process.env.NOTION_API_KEY
  if (!key) return res.status(500).json({ error: 'NOTION_API_KEY not set' })

  const { pages, database_id } = req.body
  if (!pages || !database_id) return res.status(400).json({ error: 'Missing pages or database_id' })

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }

  const results = []
  for (const page of pages) {
    try {
      const resp = await fetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ parent: { database_id }, properties: page }),
      })
      const data = await resp.json()
      results.push({ ok: resp.ok, id: data.id, nom: page.Nom_professionnel?.title?.[0]?.text?.content || '?' })
    } catch(e) {
      results.push({ ok: false, error: e.message })
    }
  }

  return res.status(200).json({ results })
}
