import { useState } from "react";
import AmelyIA from "./AmelyIA";

export default function AmelyIAFloat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Panneau de chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "92px",
            right: "16px",
            left: "16px",
            maxWidth: "660px",
            margin: "0 auto",
            zIndex: 1000,
            animation: "amelyUp .25s ease",
          }}
        >
          <AmelyIA />
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer l'assistant Amely" : "Ouvrir l'assistant Amely"}
        style={{
          position: "fixed",
          bottom: "84px",
          right: "16px",
          zIndex: 1001,
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: "#B5603A",
          border: "none",
          boxShadow: "0 6px 20px rgba(181,96,58,0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .15s",
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.92)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      <style>{`@keyframes amelyUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}
