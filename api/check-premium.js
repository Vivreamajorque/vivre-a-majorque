import Stripe from 'stripe'
import crypto from 'crypto'

function generateToken(email, role) {
  const payload = JSON.stringify({
    email: email.toLowerCase().trim(),
    role,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
  })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = crypto
    .createHmac('sha256', process.env.PREMIUM_SECRET || 'vmaq_fallback_secret')
    .update(encoded)
    .digest('hex')
    .slice(0, 16)
  return `${encoded}.${sig}`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email requis' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // ── Admin whitelist ──
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.includes(normalizedEmail)) {
    return res.status(200).json({
      premium: true,
      role: 'admin',
      token: generateToken(normalizedEmail, 'admin'),
    })
  }

  // ── Vérification abonnement Stripe ──
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return res.status(500).json({ error: 'Configuration Stripe manquante' })
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

    // Chercher le client Stripe par email
    const customers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 5,
    })

    let hasPremium = false
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 5,
      })
      if (subscriptions.data.length > 0) {
        hasPremium = true
        break
      }
    }

    if (hasPremium) {
      return res.status(200).json({
        premium: true,
        role: 'user',
        token: generateToken(normalizedEmail, 'user'),
      })
    }

    return res.status(200).json({ premium: false })
  } catch (err) {
    console.error('check-premium error:', err.message)
    return res.status(500).json({ error: 'Erreur lors de la vérification' })
  }
}
