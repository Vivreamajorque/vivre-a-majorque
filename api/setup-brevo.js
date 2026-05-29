export default async function handler(req, res) {
  // CORS — accepte toutes les origines y compris file://
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-setup-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { brevoKey, vercelToken, vercelProj } = req.body || {}
  if (!brevoKey || !vercelToken || !vercelProj) {
    return res.status(400).json({ error: 'Missing keys', received: { brevoKey: !!brevoKey, vercelToken: !!vercelToken, vercelProj: !!vercelProj } })
  }

  const bh = { 'api-key': brevoKey, 'Content-Type': 'application/json', 'Accept': 'application/json' }
  const results = {}

  // 1. Liste Inscrits
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'POST', headers: bh,
      body: JSON.stringify({ name: 'Vivre à Majorque — Inscrits', folderId: 1 })
    })
    const d = await r.json()
    if (!r.ok && d.code !== 'duplicate_parameter') throw new Error(d.message)
    results.listId = d.id
    results.list1 = `✅ ID ${d.id}`
  } catch(e) { results.list1 = `❌ ${e.message}` }

  // 2. Liste Newsletter
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'POST', headers: bh,
      body: JSON.stringify({ name: 'Vivre à Majorque — Newsletter', folderId: 1 })
    })
    const d = await r.json()
    if (!r.ok && d.code !== 'duplicate_parameter') throw new Error(d.message)
    results.newsletterId = d.id
    results.list2 = `✅ ID ${d.id}`
  } catch(e) { results.list2 = `❌ ${e.message}` }

  // Helper Vercel env
  async function upsertEnv(key, value) {
    const base = `https://api.vercel.com/v9/projects/${vercelProj}/env`
    const headers = { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' }
    const list = await fetch(base, { headers }).then(r => r.json())
    const ex = (list.envs || []).find(e => e.key === key)
    if (ex) await fetch(`${base}/${ex.id}`, { method: 'DELETE', headers })
    const cr = await fetch(base, {
      method: 'POST', headers,
      body: JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview'] })
    })
    if (!cr.ok) { const e = await cr.json(); throw new Error(e.error?.message || JSON.stringify(e)) }
  }

  // 3-5. Variables Vercel
  for (const [k, v] of [
    ['BREVO_API_KEY', brevoKey],
    ['BREVO_LIST_ID', String(results.listId || '')],
    ['BREVO_LIST_NEWSLETTER_ID', String(results.newsletterId || '')],
  ]) {
    try { await upsertEnv(k, v); results[k] = '✅ configuré' }
    catch(e) { results[k] = `❌ ${e.message}` }
  }

  return res.status(200).json({ success: true, results })
}
