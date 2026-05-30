import { useEffect } from 'react'

/*
 * useSEO — met à jour dynamiquement title + métas pour chaque page.
 * Google (et les crawlers modernes) exécutent le JS et voient ces valeurs.
 * Bénéfice : chaque guide, simulateur, page a son propre titre/description indexables.
 */
export function useSEO({ title, description, url, type = 'article' }) {
  useEffect(() => {
    if (!title) return

    const fullTitle = `${title} — Vivre à Majorque`
    const desc = description || `Guide pratique pour les Français qui s'installent à Majorque. ${title}.`
    const canonical = url || window.location.href

    /* ── title ── */
    document.title = fullTitle

    /* ── meta description ── */
    setMeta('name', 'description', desc)

    /* ── Open Graph ── */
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', type)

    /* ── Twitter ── */
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)

    /* ── canonical ── */
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', canonical)

    /* Nettoyage — restaurer les valeurs par défaut quand on quitte la page */
    return () => {
      document.title = 'Vivre à Majorque — L\'app des Français qui s\'installent à Majorque'
      setMeta('name', 'description', 'Guides administratifs, simulateurs fiscaux, cockpit d\'installation et accompagnement personnalisé pour les Francophones qui s\'installent à Majorque.')
      setMeta('property', 'og:title', 'Vivre à Majorque — L\'app des Français qui s\'installent')
      setMeta('property', 'og:description', 'Guides, simulateurs et accompagnement pour les Francophones qui s\'installent à Majorque.')
      setMeta('name', 'twitter:title', 'Vivre à Majorque — L\'app des Français qui s\'installent')
      setMeta('name', 'twitter:description', 'Guides, simulateurs et accompagnement pour les Francophones qui s\'installent à Majorque.')
    }
  }, [title, description, url])
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
