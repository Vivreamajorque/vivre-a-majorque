import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@majorquelileenvrai'
const INSTAGRAM_URL = 'https://www.instagram.com/amely_mallorca_raw'
const TIKTOK_URL = 'https://www.tiktok.com/@amelymallorcaraw'

function SocialCard({ emoji, platform, handle, desc, url, bg, border }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius)',
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 32, flexShrink: 0 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: 15, fontWeight: 700, color: 'var(--foret)', marginBottom: 2 }}>
            {platform}
          </p>
          <p style={{ fontSize: 12, color: 'var(--vert-dark)', fontWeight: 500, marginBottom: 2 }}>{handle}</p>
          <p style={{ fontSize: 12, color: 'var(--texte-sec)', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <span style={{ fontSize: 16, color: 'var(--texte-sec)' }}>→</span>
      </div>
    </a>
  )
}

function YoutubeEmbed() {
  const [videoId, setVideoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/youtube-latest')
      .then(r => r.json())
      .then(data => {
        if (data.videoId) setVideoId(data.videoId)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{
        width: '100%',
        paddingBottom: '56.25%',
        borderRadius: 'var(--radius)',
        background: 'var(--gris)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--texte-sec)', fontSize: 13 }}>Chargement…</p>
        </div>
      </div>
    )
  }

  if (error || !videoId) {
    return (
      <div style={{
        width: '100%',
        padding: '32px 16px',
        borderRadius: 'var(--radius)',
        background: 'var(--gris)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 12 }}>
          Vidéo temporairement indisponible
        </p>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#FF0000',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ▶ Voir la chaîne YouTube
        </a>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '56.25%',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: '#000',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
        title="Majorque l'île en vrai — dernière vidéo"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          borderRadius: 'var(--radius)',
        }}
      />
    </div>
  )
}

export default function Medias() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <PageHeading label="dans les" accent="Médias" color={VERT} accentSize={34} />
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 16 }}>
          Suivez la vie à Majorque en vrai
        </p>
      </div>

      {/* Dernière vidéo YouTube */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 10, fontWeight: 600 }}>
          🎬 Dernière vidéo
        </p>
        <YoutubeEmbed />
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            marginTop: 10,
            textAlign: 'center',
            background: '#FF0000',
            color: '#fff',
            borderRadius: 'var(--radius)',
            padding: '10px 0',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
          }}
        >
          ▶ S'abonner à la chaîne YouTube
        </a>
      </div>

      {/* Réseaux sociaux */}
      <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 10, fontWeight: 600 }}>
        📱 Réseaux sociaux
      </p>

      <SocialCard
        emoji="📸"
        platform="Instagram"
        handle="@amely_mallorca_raw"
        desc="La vie à Majorque avec Lenny — bons plans famille, nature & authenticité"
        url={INSTAGRAM_URL}
        bg="var(--ocre-light)"
        border="rgba(196,122,90,0.2)"
      />
      <SocialCard
        emoji="🎵"
        platform="TikTok"
        handle="@amelymallorcaraw"
        desc="Coulisses, découvertes et instants de vie à Majorque"
        url={TIKTOK_URL}
        bg="var(--vert-light)"
        border="rgba(90,122,64,0.15)"
      />
      <SocialCard
        emoji="▶️"
        platform="YouTube"
        handle="@majorquelileenvrai"
        desc="Majorque — la vraie vie, les vrais endroits, les vraies histoires"
        url={YOUTUBE_CHANNEL_URL}
        bg="var(--ocre-light)"
        border="rgba(196,122,90,0.2)"
      />
    </div>
  )
}
