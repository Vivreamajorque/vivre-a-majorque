const BREVO_API = 'https://api.brevo.com/v3'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.BREVO_API_KEY
  if (!key) return res.status(500).json({ error: 'BREVO_API_KEY not set' })

  const { prenom, email, offre, situation, projet, timeline, budget_conscience } = req.body
  if (!email || !prenom) return res.status(400).json({ error: 'Prénom et email requis' })

  const headers = {
    'api-key': key,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const AMELY_EMAIL = process.env.AMELY_EMAIL || 'lalignemallorca@gmail.com'

  try {
    /* ── 1. Notifier Amely par email ── */
    await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: [{ email: AMELY_EMAIL, name: 'Amely' }],
        subject: `🎯 Nouvelle demande ${offre} — ${prenom}`,
        htmlContent: `
          <h2 style="color:#0F3D35">Nouvelle demande de pré-qualification</h2>
          <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700;width:140px">Offre demandée</td><td style="padding:8px;border-bottom:1px solid #ddd"><strong style="color:#C76E4E">${offre}</strong></td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Prénom</td><td style="padding:8px;border-bottom:1px solid #ddd">${prenom}</td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Email</td><td style="padding:8px;border-bottom:1px solid #ddd"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Situation</td><td style="padding:8px;border-bottom:1px solid #ddd">${situation || '—'}</td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Projet</td><td style="padding:8px;border-bottom:1px solid #ddd">${projet || '—'}</td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Timeline</td><td style="padding:8px;border-bottom:1px solid #ddd">${timeline || '—'}</td></tr>
            <tr><td style="padding:8px;background:#f5f0e8;font-weight:700">Budget OK</td><td style="padding:8px">${budget_conscience ? '✅ Oui' : '❌ Non coché'}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666;font-size:13px">
            → Répondre sous 24h pour confirmer la disponibilité et envoyer le lien de paiement.
          </p>
        `,
      }),
    })

    /* ── 2. Email de confirmation au prospect ── */
    await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: [{ email, name: prenom }],
        replyTo: { email: AMELY_EMAIL, name: 'Amely — Vivre à Majorque' },
        subject: `${prenom}, votre demande est bien reçue 🌿`,
        htmlContent: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1C1410;line-height:1.7">
            <h2 style="color:#0F3D35;font-size:22px">Bonjour ${prenom},</h2>
            <p>Votre demande pour l'<strong>${offre}</strong> est bien reçue.</p>
            <p>Je reviens vers vous sous <strong>24h</strong> pour confirmer la disponibilité et vous envoyer le lien de paiement sécurisé.</p>
            <p>En attendant, n'hésitez pas à me répondre directement sur cet email si vous avez des questions.</p>
            <p style="margin-top:28px">À très vite,<br/><strong>Amely</strong><br/>
            <span style="color:#5AADA5;font-size:13px">Francesa installée à Campos, Majorque 🌿</span></p>
            <hr style="border:none;border-top:1px solid #E0D9CF;margin:24px 0"/>
            <p style="font-size:12px;color:#8A7F74">
              Vivre à Majorque · <a href="https://vivre-a-majorque.vercel.app" style="color:#5AADA5">vivre-a-majorque.vercel.app</a>
            </p>
          </div>
        `,
      }),
    })

    /* ── 3. Ajouter le prospect dans Brevo ── */
    if (process.env.BREVO_LIST_ID) {
      await fetch(`${BREVO_API}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          attributes: { PRENOM: prenom, OFFRE_DEMANDEE: offre, PROJET: projet || '' },
          listIds: [Number(process.env.BREVO_LIST_ID)],
          updateEnabled: true,
        }),
      }).catch(() => {}) // silencieux si erreur Brevo
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('prequalification error:', err)
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message })
  }
}
