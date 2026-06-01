/**
 * useFuzzySearch — recherche tolérante aux fautes d'orthographe
 * Algorithme : distance de Levenshtein normalisée + bonus préfixe/contient
 *
 * Tolère :
 *  - fautes de frappe ("majorqe" → "majorque")
 *  - accents manquants ("etranger" → "étranger")
 *  - transpositions ("niE" → "NIE")
 *  - mots partiels ("banc" → "bancaire")
 */

// Normalise : minuscules + supprime accents
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Distance de Levenshtein entre deux chaînes
function levenshtein(a, b) {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

// Score de similarité entre query et un texte cible (0 = pas de match, 1 = parfait)
function score(query, target) {
  const q = normalize(query.trim())
  const t = normalize(target)
  if (!q || !t) return 0

  // Correspondance exacte → score max
  if (t.includes(q)) return 1.0

  // Recherche mot par mot
  const words = q.split(/\s+/)
  let totalScore = 0

  for (const word of words) {
    if (word.length < 2) continue
    // Correspondance directe du mot dans le texte
    if (t.includes(word)) { totalScore += 1.0; continue }

    // Fuzzy sur chaque mot du texte
    const targetWords = t.split(/\s+/)
    let bestWordScore = 0
    for (const tw of targetWords) {
      if (tw.length < 2) continue
      const shorter = word.length < tw.length ? word : tw
      const longer  = word.length < tw.length ? tw : word
      // Si le mot court est trop différent du mot long, skip
      if (longer.length > shorter.length * 2.5) continue
      const dist = levenshtein(word, tw)
      const maxLen = Math.max(word.length, tw.length)
      // Tolérance : 1 erreur pour 4 chars, 2 erreurs pour 7+ chars
      const tolerance = maxLen <= 4 ? 1 : maxLen <= 7 ? 2 : 3
      if (dist <= tolerance) {
        const ws = 1 - dist / (maxLen + 1)
        bestWordScore = Math.max(bestWordScore, ws)
      }
    }
    totalScore += bestWordScore
  }

  return Math.min(totalScore / Math.max(words.filter(w => w.length >= 2).length, 1), 1)
}

/**
 * fuzzyFilter — filtre et trie une liste d'items par pertinence
 * @param {string} query — texte de recherche
 * @param {Array}  items — liste d'objets
 * @param {Function} getFields — fn(item) → string[] de champs à chercher
 * @param {number} threshold — score minimum (défaut: 0.35)
 * @returns items triés par pertinence décroissante
 */
export function fuzzyFilter(query, items, getFields, threshold = 0.35) {
  if (!query || !query.trim()) return []
  return items
    .map(item => {
      const fields = getFields(item)
      const s = Math.max(...fields.map(f => score(query, f || '')))
      return { item, score: s }
    })
    .filter(({ score: s }) => s >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}
