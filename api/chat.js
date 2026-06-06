// Proxy serverless pour l'assistant Amely IA.
// Détient la clé API Anthropic côté serveur (jamais exposée au navigateur).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const { system, messages, max_tokens } = req.body || {}
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages requis' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: max_tokens || 1000,
        system: system || undefined,
        messages,
      }),
    })
    const data = await response.json()
    return res.status(response.ok ? 200 : response.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
