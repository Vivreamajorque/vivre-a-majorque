const BREVO_API = 'https://api.brevo.com/v3'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.BREVO_API_KEY || process.env.CLE_API_BREVO
  if (!key) return res.status(500).json({ error: 'BREVO_API_KEY not set' })

  const { prenom, email, newsletter, profil } = req.body

  if (!email || !prenom) {
    return res.status(400).json({ error: 'Prénom et email requis' })
  }

  const headers = {
    'api-key': key,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  try {
    /* ── 1. Créer / mettre à jour le contact ── */
    const listIds = []
    if (process.env.BREVO_LIST_ID) listIds.push(Number(process.env.BREVO_LIST_ID))
    if (newsletter && process.env.BREVO_LIST_NEWSLETTER_ID) {
      listIds.push(Number(process.env.BREVO_LIST_NEWSLETTER_ID))
    }

    const contactRes = await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: prenom,
          PROFIL: profil || '',
          NEWSLETTER: newsletter ? 'OUI' : 'NON',
        },
        listIds: listIds.length ? listIds : undefined,
        updateEnabled: true,   // met à jour si contact existe déjà
      }),
    })

    // 204 = déjà existant et mis à jour, 201 = créé
    if (!contactRes.ok && contactRes.status !== 204) {
      const err = await contactRes.json()
      // Code 300 = contact déjà dans la liste — pas une vraie erreur
      if (err.code !== 'duplicate_parameter') {
        console.error('Brevo contact error:', err)
        return res.status(502).json({ error: 'Brevo contact error', detail: err })
      }
    }

    /* ── 2. Email de bienvenue transactionnel ── */
    if (process.env.BREVO_WELCOME_TEMPLATE_ID) {
      const mailRes = await fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: [{ email, name: prenom }],
          templateId: Number(process.env.BREVO_WELCOME_TEMPLATE_ID),
          params: { PRENOM: prenom, PROFIL: profil || '' },
        }),
      })
      if (!mailRes.ok) {
        const err = await mailRes.json()
        console.error('Brevo welcome email error:', err)
        // On ne bloque pas — contact créé quand même
      }
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message })
  }
}
