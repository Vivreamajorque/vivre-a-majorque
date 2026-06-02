const BREVO_API = 'https://api.brevo.com/v3'

// ─────────────────────────────────────────────
// SÉQUENCES PAR SEGMENT
// Séquence 1 — Freemium (déclencheur : inscription)
// Séquence 2 — Premium  (déclencheur : paiement abonnement → /api/subscribe?segment=premium)
// Séquence 3 — Post-Conseil (déclencheur : paiement 79€ → /api/subscribe?segment=post_conseil)
// Séquence 4 — Post-Cap     (déclencheur : paiement Cap → /api/subscribe?segment=post_cap)
// Séquence 5 — Post-Éclaireur (déclencheur : paiement Éclaireur → /api/subscribe?segment=post_eclaireur)
// ─────────────────────────────────────────────

const SEQUENCES = {
  freemium: [
    { templateId: 3, delayDays: 0  }, // J0  — Bienvenue
    { templateId: 4, delayDays: 2  }, // J2  — Mon histoire
    { templateId: 5, delayDays: 5  }, // J5  — Les 3 questions
    { templateId: 6, delayDays: 9  }, // J9  — Conseil 79€ (1ère offre)
    { templateId: 7, delayDays: 12 }, // J12 — Cap Majorque 249€
  ],
  premium: [
    { templateId: 20, delayDays: 0  }, // J0  — Accès activé
    { templateId: 21, delayDays: 3  }, // J3  — Personnalisé selon profil
    { templateId: 22, delayDays: 10 }, // J10 — Éducatif (résidence fiscale)
    { templateId: 23, delayDays: 25 }, // J25 — Urgence tarif lancement
  ],
  post_conseil: [
    { templateId: 30, delayDays: 0  }, // J0  — Confirmation + créneau
    { templateId: 31, delayDays: 2  }, // J2  — Proposition Cap/Éclaireur (email clé)
    { templateId: 32, delayDays: 7  }, // J7  — Point d'étape
    { templateId: 33, delayDays: 20 }, // J20 — Urgence déduction (10j restants)
    { templateId: 34, delayDays: 30 }, // J30 — Dernier jour déduction
  ],
  post_cap: [
    { templateId: 40, delayDays: 0  }, // J0  — Cap confirmé
    { templateId: 41, delayDays: 15 }, // J15 — Point d'étape
    { templateId: 42, delayDays: 45 }, // J45 — Demande témoignage
    { templateId: 43, delayDays: 90 }, // J90 — Nouvelles + bouche à oreille
  ],
  post_eclaireur: [
    { templateId: 50, delayDays: 0  }, // J0  — Éclaireur confirmé
    { templateId: 51, delayDays: 15 }, // J15 — Point lancement
    { templateId: 52, delayDays: 45 }, // J45 — Demande témoignage
    { templateId: 53, delayDays: 90 }, // J90 — Nouvelles
  ],
}

// IDs de listes Brevo par segment
const LIST_IDS = {
  freemium:       7,
  premium:        8,
  post_conseil:   9,
  post_cap:       10,
  post_eclaireur: 11,
}

// Liste "Lettres de l'île" — newsletter hebdo mercredi
// Ajoutée à TOUS les inscrits, tous segments confondus
const LETTRE_ILE_LIST_ID = 12

// Heure d'envoi : 9h heure de Majorque (Europe/Madrid = UTC+2 en été)
function scheduledAt(delayDays) {
  if (delayDays === 0) return undefined // immédiat
  const d = new Date()
  d.setDate(d.getDate() + delayDays)
  d.setUTCHours(7, 0, 0, 0) // 9h Madrid = 7h UTC en été
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

  const { prenom, email, profil, segment = 'freemium' } = req.body
  if (!email || !prenom) return res.status(400).json({ error: 'Prénom et email requis' })

  // Valider le segment
  if (!SEQUENCES[segment]) {
    return res.status(400).json({ error: `Segment inconnu : ${segment}` })
  }

  const headers = {
    'api-key': key,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  try {
    const listId = LIST_IDS[segment]

    // ── 1. Créer / mettre à jour le contact dans la liste du segment ──
    await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: prenom,
          PROFIL: profil || '',
          SEGMENT: segment,
        },
        listIds: [listId, LETTRE_ILE_LIST_ID],
        updateEnabled: true,
      }),
    })

    // ── 2. Retirer des listes précédentes si passage à une séquence supérieure ──
    // Ex : si quelqu'un passe en post_conseil, on le retire de freemium et premium
    const sequenceOrder = ['freemium', 'premium', 'post_conseil', 'post_cap', 'post_eclaireur']
    const currentIdx = sequenceOrder.indexOf(segment)
    if (currentIdx > 0) {
      const previousLists = sequenceOrder.slice(0, currentIdx).map(s => LIST_IDS[s])
      for (const prevListId of previousLists) {
        await fetch(`${BREVO_API}/contacts/lists/${prevListId}/contacts/remove`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ emails: [email] }),
        }).catch(() => {}) // silencieux si pas dans la liste
      }
    }

    // ── 3. Envoyer les emails de la séquence ──
    const sequence = SEQUENCES[segment]
    const params = { PRENOM: prenom, PROFIL: profil || '' }

    const emailPromises = sequence.map(({ templateId, delayDays }) => {
      const body = { to: [{ email, name: prenom }], templateId, params }
      const scheduled = scheduledAt(delayDays)
      if (scheduled) body.scheduledAt = scheduled

      return fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }).then(r => r.json()).catch(e => ({ error: e.message }))
    })

    // J0 prioritaire, les suivants en fire-and-forget
    await emailPromises[0]
    emailPromises.slice(1).forEach(p => p.catch(console.error))

    return res.status(200).json({ success: true, segment, emails: sequence.length })

  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message })
  }
}
