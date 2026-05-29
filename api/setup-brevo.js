// Fonction one-shot — crée les listes Brevo et configure Vercel
// Protégée par un secret dans le header
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Protection basique
  if (req.headers['x-setup-secret'] !== process.env.SETUP_SECRET && req.query.secret !== process.env.SETUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const brevoKey    = req.body?.brevoKey    || process.env.BREVO_API_KEY_TEMP
  const vercelToken = req.body?.vercelToken || process.env.VERCEL_TOKEN_TEMP
  const vercelProj  = req.body?.vercelProj  || process.env.VERCEL_PROJECT_TEMP

  if (!brevoKey || !vercelToken || !vercelProj) {
    return res.status(400).json({ error: 'Missing keys', keys: { brevoKey: !!brevoKey, vercelToken: !!vercelToken, vercelProj: !!vercelProj } })
  }

  const bh = { 'api-key': brevoKey, 'Content-Type': 'application/json' }
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

  // Helper : upsert env var Vercel
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
    if (!cr.ok) { const e = await cr.json(); throw new Error(e.error?.message) }
    return true
  }

  // 3-5. Variables Vercel
  const envVars = [
    ['BREVO_API_KEY', brevoKey],
    ['BREVO_LIST_ID', String(results.listId || '')],
    ['BREVO_LIST_NEWSLETTER_ID', String(results.newsletterId || '')],
  ]
  for (const [k, v] of envVars) {
    try { await upsertEnv(k, v); results[k] = '✅' }
    catch(e) { results[k] = `❌ ${e.message}` }
  }

  return res.status(200).json({ success: true, results })
}
