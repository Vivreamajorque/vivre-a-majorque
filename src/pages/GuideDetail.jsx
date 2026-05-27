import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotionBlocks, useNotionDB, parseGuide } from '../hooks/useNotion'
import { usePremium } from '../context/PremiumContext'
import NotionBlocks from '../components/NotionBlocks'
import AccompagnementBanner from '../components/AccompagnementBanner'
import PremiumGate from '../components/PremiumGate'
import { NOTION_DB } from '../config'
import { PageHeading, AccentWord, SectionAccent, Wave, TERRA, VERT } from '../components/WaveTitle'

export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blocks, loading } = useNotionBlocks(id)
  const { data } = useNotionDB(NOTION_DB.guides)
  const { canAccess } = usePremium()

  const guide = data.map(parseGuide).find(g => g.id === id)

  return (
    <div className="page">
      <div style={{ paddingTop: 56 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--vert-dark)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}
        >
          ← Retour
        </button>

        {guide && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {guide.category && <span className="badge badge-gris">{guide.category}</span>}
              {guide.isPiege && <span className="badge badge-ocre">⚠️ Piège fréquent</span>}
              {guide.access !== '🟢 Public' && <span className="badge badge-miel">💎 Premium</span>}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 24, color: 'var(--foret)', lineHeight: 1.3, marginBottom: 10 }}>
              {guide.title}
            </h1>
            {guide.source && (
              <p style={{ fontSize: 12, color: 'var(--texte-sec)' }}>
                Source : {guide.source}
              </p>
            )}

          </div>
        )}

        <div className="divider" />

        {loading ? (
          <div className="spinner">Chargement du contenu…</div>
        ) : guide && !canAccess(guide.access) ? (
          <PremiumGate accessLevel={guide.access}>
            <div style={{ height: 200 }} />
          </PremiumGate>
        ) : (
          <>
            <NotionBlocks blocks={blocks} />
            <AccompagnementBanner
              texte="Cette démarche vous semble complexe à appliquer à votre situation personnelle ?"
              cta="Je vous accompagne pas à pas →"
            />
          </>
        )}
      </div>
    </div>
  )
}
