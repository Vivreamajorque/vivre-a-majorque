const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.NOTION_API_KEY
  if (!key) return res.status(500).json({ error: 'NOTION_API_KEY not set' })

  const { endpoint, database_id, filter, start_cursor } = req.body
  const headers = {
    'Authorization': `Bearer ${key}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }

  try {
    let url, options

    if (endpoint === 'query_database') {
      url = `${NOTION_API}/databases/${database_id}/query`
      options = {
        method: 'POST',
        headers,
        body: JSON.stringify({ filter: filter || undefined, page_size: 100, start_cursor: start_cursor || undefined }),
      }
    } else if (endpoint === 'get_page') {
      url = `${NOTION_API}/pages/${database_id}`
      options = { method: 'GET', headers }
    } else if (endpoint === 'get_blocks') {
      url = `${NOTION_API}/blocks/${database_id}/children?page_size=100`
      options = { method: 'GET', headers }
    } else {
      return res.status(400).json({ error: 'Unknown endpoint' })
    }

    const response = await fetch(url, options)
    const data = await response.json()
    return res.status(response.ok ? 200 : response.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
