// api/chat.js — Agent conversationnel Amely IA
// Architecture : topic detection → Notion guide fetch → system prompt dynamique → Claude Haiku

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const GUIDES_DB = '060e103bf00c4be49b8ab62f25479376'

// ─── Mapping keywords → terme de recherche dans les titres Notion ───
const TOPIC_MAP = [
  {
    terms: ['nie', 'n.i.e', 'numéro identif', 'papiers espagnol', 'numéro étranger', 'numero etranger', 'residencia', 'certificat de résidence', 'police nationale'],
    search: 'NIE', label: 'NIE'
  },
  {
    terms: ['autónom', 'autonom', 'freelance', 'indépendant', 'independant', 'cotisation', 'tgss', 'aeat', 'gestor', 'tarifa plana', 'créer mon activité', 'facturer en espagne', 'alta', 'statut espagne', 'auto-entrepreneur'],
    search: 'autónom', label: 'autónoma'
  },
  {
    terms: ['logement', 'loyer', 'appartement', 'maison', 'bail', 'location', 'trouver un appart', 'alquiler', 'agence immob', 'colocation'],
    search: 'logement', label: 'logement'
  },
  {
    terms: ['fiscal', 'impôt', 'impot', 'irpf', 'iva', 'hacienda', 'résidence fiscale', 'residence fiscale', 'double imposition', 'déclaration', 'declaration', 'renta'],
    search: 'fiscal', label: 'fiscalité'
  },
  {
    terms: ['santé', 'sante', 'médecin', 'medecin', 'mutuelle', 'ib-salut', 'ibsalut', 'hôpital', 'hopital', 'sécu', 'sécurité sociale', 'carte vitale espagne'],
    search: 'santé', label: 'santé'
  },
  {
    terms: ['école', 'ecole', 'enfant', 'lycée', 'lycee', 'scolarité', 'scolarite', 'collège', 'primaire', 'maternelle', 'inscription scolaire', 'catalan'],
    search: 'scolar', label: 'scolarité'
  },
  {
    terms: ['visa', 'nomade numérique', 'nomade numerique', 'télétravail', 'teletravail', 'permis de séjour', 'titre de séjour'],
    search: 'visa', label: 'visa'
  },
  {
    terms: ['budget', 'coût de la vie', 'cout de la vie', 'combien ça coûte vivre', 'combien ca coute', 'prix majorque', 'dépenses mensuelles'],
    search: 'budget', label: 'budget'
  },
  {
    terms: ['retraite', 'pension', 'retraité', 'retraite espagne', 'formulaire s1', 'cpam'],
    search: 'retraite', label: 'retraite'
  },
  {
    terms: ['banque', 'compte bancaire', 'ouvrir un compte', 'virement espagne', 'carte bancaire espagne'],
    search: 'banque', label: 'banque'
  },
  {
    terms: ['empadronamiento', 'empadronament', 'mairie', 'inscription mairie', 'registre municipal'],
    search: 'empadronamiento', label: 'empadronamiento'
  },
]



// ─── Extraction texte depuis blocs Notion ───
function extractTextFromBlock(block) {
  const rt = block[block.type]?.rich_text || []
  const text = rt.map(r => r.plain_text).join('')
  if (!text.trim()) return ''
  switch (block.type) {
    case 'heading_1': return `\n== ${text} ==`
    case 'heading_2': return `\n-- ${text} --`
    case 'heading_3': return `\n${text} :`
    case 'bulleted_list_item': return `• ${text}`
    case 'numbered_list_item': return `- ${text}`
    case 'callout': return `[À SAVOIR] ${text}`
    case 'quote': return `"${text}"`
    case 'paragraph': return text
    default: return text
  }
}

async function fetchGuideContent(searchTerm, notionKey) {
  try {
    // 1. Chercher le guide dans la DB par titre
    const queryRes = await fetch(`${NOTION_API}/databases/${GUIDES_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'Titre', title: { contains: searchTerm } },
        page_size: 1
      })
    })
    if (!queryRes.ok) return null
    const queryData = await queryRes.json()
    const page = queryData.results?.[0]
    if (!page) return null

    const guideTitle = page.properties?.Titre?.title?.[0]?.plain_text || searchTerm
    const source = page.properties?.Source_officielle?.rich_text?.[0]?.plain_text || ''

    // 2. Fetch les blocs
    const blocksRes = await fetch(`${NOTION_API}/blocks/${page.id}/children?page_size=60`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Notion-Version': NOTION_VERSION,
      }
    })
    if (!blocksRes.ok) return { title: guideTitle, content: '', source }
    const blocksData = await blocksRes.json()

    // 3. Extraire le texte (max ~3000 chars)
    let content = ''
    for (const block of blocksData.results || []) {
      const line = extractTextFromBlock(block)
      if (line) content += line + '\n'
      if (content.length > 3000) { content += '\n[...contenu complet dans l\'app]'; break }
    }

    return { title: guideTitle, content: content.trim(), source }
  } catch (e) {
    return null
  }
}

// ─── Construction du system prompt dynamique ───
function buildSystemPrompt(guideData, escalate) {
  const PERSONA = `Tu es le chatbot de l'application "Vivre à Majorque", créé par Amely — française installée à Campos (Majorque) depuis 1 an, experte en accompagnement d'installation pour les francophones.
Ton ton : chaleureux, direct, comme une grande sœur qui rassure. Pas un expert froid. Pas une IA générique.`

  const RULES = `

RÈGLES ABSOLUES :
1. COURT : 3-4 phrases max. Jamais de pavé de texte.
2. PAS de Markdown : zéro **, ##, tirets de liste, etc. Texte simple comme un WhatsApp.
3. Réponds UNIQUEMENT depuis le contenu du guide fourni ci-dessous. Si la réponse n'est pas dans le guide, dis-le honnêtement : "Ce point précis n'est pas dans mon guide — c'est typiquement ce qu'on approfondit en visio."
4. JAMAIS de montants/chiffres figés — ils changent chaque année. Si une question porte sur un montant, renvoie vers le simulateur de l'app ou la visio.
5. Termine toujours par UNE seule question courte pour continuer la conversation.
6. Génère [PROFIL:type] en fin de message (invisible, analytics). Types : actif/famille/retraité/nomade/indécis.
7. Si tu ne sais pas : génère [LACUNE:sujet] (invisible) et dis-le franchement.`

  const ESCALADE_RULE = escalate ? `

INSTRUCTION : Tu as répondu à plusieurs questions. Après ta réponse, propose naturellement la Visio Conseil 79€ avec Amely — une heure pour faire le point sur la situation spécifique de la personne et avoir un plan d'action concret. Génère [VISIO].` : ''

  const GUIDE_CONTEXT = guideData && guideData.content
    ? `

---
GUIDE OFFICIEL VIVRE À MAJORQUE — "${guideData.title}"${guideData.source ? ` (source : ${guideData.source})` : ''} :

${guideData.content}
---`
    : `

---
Aucun guide spécifique trouvé pour cette question dans la base Vivre à Majorque. Réponds avec des informations procédurales générales vérifiées (sans inventer de chiffres). Si la question est précise, indique que l'app contient des guides complets et propose la visio pour la situation personnelle.
---`

  return PERSONA + RULES + ESCALADE_RULE + GUIDE_CONTEXT
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const notionKey = process.env.NOTION_API_KEY
  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const { messages, questionCount = 0, max_tokens = 400 } = req.body || {}
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages requis' })

  // 1. Analyse de la conversation
  const topic = detectTopic(messages)
  const escalate = questionCount >= 3

  // 2. Fetch du guide Notion si topic détecté
  let guideData = null
  if (topic && notionKey) {
    guideData = await fetchGuideContent(topic.search, notionKey)
  }

  // 3. System prompt dynamique
  const systemPrompt = buildSystemPrompt(guideData, escalate)

  // 4. Appel Claude Haiku
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content || m.text || ''
        }))
      }),
    })
    const data = await response.json()
    return res.status(response.ok ? 200 : response.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
