const BREVO_API = 'https://api.brevo.com/v3'

// IDs des 5 templates créés — J0 bienvenue, J2 histoire, J4 questions, J7 visio, J10 cap
const SEQUENCE = [
  { templateId: 3, delayDays: 0  },  // J0  — Bienvenue (immédiat)
  { templateId: 4, delayDays: 2  },  // J2  — Mon histoire
  { templateId: 5, delayDays: 4  },  // J4  — Les 3 questions
  { templateId: 6, delayDays: 7  },  // J7  — Visio 79€ lancement (barré 99€)
  { templateId: 7, delayDays: 10 },  // J10 — Cap Majorque 249€
]

function scheduledAt(delayDays) {
  if (delayDays === 0) return undefined // immédiat
  const d = new Date()
  d.setDate(d.getDate() + delayDays)
  d.setHours(9, 0, 0, 0) // 9h du matin
  return d.toISOString().replace('.000Z', '+00:00')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.BREVO_API_KEY || process.env.CLE_API_BREVO
  if (!key) return res.status(500).json({ error: 'BREVO_API_KEY not set' })

  const { prenom, email, newsletter, profil } = req.body
  if (!email || !prenom) return res.status(400).json({ error: 'Prénom et email requis' })

  const headers = {
    'api-key': key,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  try {
    // ── 1. Créer / mettre à jour le contact dans la liste ──
    const listIds = []
    if (process.env.BREVO_LIST_ID) listIds.push(Number(process.env.BREVO_LIST_ID))
    if (newsletter && process.env.BREVO_LIST_NEWSLETTER_ID) {
      const nlId = Number(process.env.BREVO_LIST_NEWSLETTER_ID)
      if (!listIds.includes(nlId)) listIds.push(nlId)
    }

    const contactRes = await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        attributes: { PRENOM: prenom, PROFIL: profil || '', NEWSLETTER: newsletter ? 'OUI' : 'NON' },
        listIds: listIds.length ? listIds : undefined,
        updateEnabled: true,
      }),
    })

    if (!contactRes.ok && contactRes.status !== 204) {
      const err = await contactRes.json()
      if (err.code !== 'duplicate_parameter') {
        console.error('Brevo contact error:', err)
        return res.status(502).json({ error: 'Brevo contact error', detail: err })
      }
    }

    // ── 2. Envoyer les 5 emails de la séquence ──
    const params = { PRENOM: prenom, PROFIL: profil || '' }
    const emailPromises = SEQUENCE.map(({ templateId, delayDays }) => {
      const body = {
        to: [{ email, name: prenom }],
        templateId,
        params,
      }
      const scheduled = scheduledAt(delayDays)
      if (scheduled) body.scheduledAt = scheduled

      return fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }).then(r => r.json()).catch(e => ({ error: e.message }))
    })

    // J0 en priorité immédiate, les suivants en fire-and-forget
    await emailPromises[0]         // J0 attend la réponse
    emailPromises.slice(1).forEach(p => p.catch(console.error)) // J2-J10 en async

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message })
  }
}
