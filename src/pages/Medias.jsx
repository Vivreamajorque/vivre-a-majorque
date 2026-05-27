import React from 'react'
import { useNavigate } from 'react-router-dom'

// ← Mettre à jour l'ID de la dernière vidéo après chaque publication YouTube
const YOUTUBE_LAST_VIDEO_ID = 'PLfN_IbCc8wqU1234' // placeholder — remplacer par l'ID de la dernière vidéo
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

export default function Medias() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate('/app/explorer')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--foret)',
          padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>← <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Explorer</span></button>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 24, color: 'var(--foret)', marginBottom: 4 }}>
          Médias
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texte-sec)', marginBottom: 16 }}>
          Suivez la vie à Majorque en vrai
        </p>
      </div>

      {/* Dernière vidéo YouTube */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-titre)', fontSize: 16, color: 'var(--foret)', marginBottom: 10, fontWeight: 600 }}>
          🎬 Dernière vidéo
        </p>
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          <iframe
            src={`https://www.youtube.com/embed?listType=user_uploads&list=majorquelileenvrai&autoplay=0`}
            title="L'île en vrai — dernière vidéo"
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
