export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate') // cache 30min

  try {
    // Étape 1 — récupérer le channelId depuis la page YouTube
    const pageRes = await fetch('https://www.youtube.com/@majorquelileenvrai', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    const html = await pageRes.text()

    const cidMatch = html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/)
    if (!cidMatch) {
      return res.status(200).json({ error: 'channelId introuvable', videoId: null })
    }
    const channelId = cidMatch[1]

    // Étape 2 — RSS feed → dernière vidéo
    const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
    const rssText = await rssRes.text()

    const videoIdMatch = rssText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    if (!videoIdMatch) {
      return res.status(200).json({ error: 'Aucune vidéo', channelId, videoId: null })
    }

    res.status(200).json({ videoId: videoIdMatch[1], channelId })
  } catch (err) {
    res.status(200).json({ error: err.message, videoId: null })
  }
}
