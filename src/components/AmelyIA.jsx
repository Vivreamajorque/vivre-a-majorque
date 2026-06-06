import { useState, useRef, useEffect } from "react";

const AMELY_PHOTO = "data:image/jpeg;base64,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";
const STRIPE_VISIO = "https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W";
const FREE_QUESTIONS = 3;

const VAM_KNOWLEDGE = `
BASE DE CONNAISSANCE OFFICIELLE — VIVRE À MAJORQUE

NIE : Document central sans lequel rien n'est possible (compte bancaire, bail, autónoma, scolarité). Depuis la France : consulat espagnol (Marseille, Paris, Lyon), plus rapide. À Majorque : Policía Nacional/Oficina de Extranjería, RDV obligatoire, délais 4-8 semaines. Docs : passeport + EX-15 + justificatif. Coût ~10€.

EMPADRONAMIENTO : Inscription mairie, à faire EN PRIORITÉ. Obligatoire pour IB-Salut, scolarité. Docs : bail/acte + passeport/NIE. Gratuit.

AUTÓNOMA : Freelance espagnol. Alta TGSS + AEAT. Tarifa plana ~96€/mois les 24 premiers mois. Taux plein RETA 230-310€/mois. Gestor indispensable 50-150€/mois. Modelo 303 (IVA trimestriel), 130 (IRPF trimestriel). Verifactu 01/07/2027.

SIMULATEUR CHARGES (dans l'app) : exemple 2000€ CA mensuel → SS ~96€ + IVA ~350€ + IRPF ~300-400€ + gestor ~80-120€ = net ~1030-1150€. Le simulateur de l'app calcule selon le CA réel.

LOGEMENT : Marché tendu Baléares. Budget 800-1500€/mois. Dépôt 1-2 mois (LAU). Trésorerie 4-6 mois recommandée. Zones : Palma (cher), Campos, Manacor, Inca, Alcúdia (abordables).

SCOLARITÉ : École publique gratuite sur empadronamiento, catalan majoritaire. Lycée Français Palma payant, inscriptions mars.

SANTÉ : IB-Salut via empadronamiento + cotisation SS. Mutuelles privées 1ers mois : Adeslas, Sanitas (50-150€/mois). Formulaire S1 CPAM 1-3 mois.

FISCALITÉ : Résidence fiscale +183 jours/an. IRPF 19-47%.

VISA NOMADE : hors UE uniquement. Français = déclaration résidence UE suffit.

L'APP VAM : guides officiels, simulateur, calendrier fiscal, annuaire vérifié. Freemium / Premium 9,90€/mois. Visio Conseil 79€ = 1h avec Amely.
`;

const SYSTEM_PROMPT = `Tu es Amely, le chatbot de "Vivre à Majorque". Tu incarnes l'Amely numérique — chaleureuse, directe, grande sœur qui a vécu l'installation à Majorque depuis 1 an avec son mari et sa fille.

${VAM_KNOWLEDGE}

RÈGLES :
1. Réponds avec les vraies infos officielles si dans ta base.
2. Si tu ne sais pas → dis-le honnêtement. Génère [LACUNE:sujet] ET propose la visio.
3. N'invente JAMAIS. Sources officielles uniquement (BOE/AEAT/IB-Salut/CAIB).
4. Après 2-3 échanges, propose la visio. Génère [VISIO].
5. Pas de chiffres fiscaux précis inventés — oriente vers le simulateur de l'app ou la visio.
6. Détecte le profil : génère [PROFIL:type-timing] (famille/solo/entrepreneur/retraité/nomade - reve/6-12mois/imminent).

OFFRE UNIQUE : la visio conseil 79€, 1h avec Amely, plan d'action personnalisé. C'est l'entrée vers tout le reste.

FORMAT : court, chaleureux, termine par une question ou CTA. Les tags [PROFIL] [LACUNE] [VISIO] sont invisibles pour l'utilisateur.`;

function parseResponse(text) {
  const profileMatch = text.match(/\[PROFIL:([^\]]+)\]/);
  const lacuneMatch = text.match(/\[LACUNE:([^\]]+)\]/);
  const showVisio = text.includes("[VISIO]");
  const clean = text.replace(/\[PROFIL:[^\]]+\]/g, "").replace(/\[LACUNE:[^\]]+\]/g, "").replace(/\[VISIO\]/g, "").trim();
  return { text: clean, profile: profileMatch?.[1] || null, lacune: lacuneMatch?.[1] || null, showVisio };
}

async function callChat(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: SYSTEM_PROMPT, messages, max_tokens: 1000 }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function subscribeEmail(email, prenom, profil) {
  try {
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom, email, profil: profil || "", segment: "freemium" }),
    });
    return true;
  } catch { return false; }
}

async function saveSession(id, data) {
  try { await window.storage?.set(`session:${id}`, JSON.stringify(data)); } catch {}
}
async function logMetric(type, data) {
  try { await window.storage?.set(`metric:${type}:${Date.now()}`, JSON.stringify({ ...data, ts: Date.now() })); } catch {}
}
async function logLacune(sujet) {
  try {
    const ex = await window.storage?.get("lacunes");
    const list = ex ? JSON.parse(ex.value) : [];
    const found = list.find(l => l.sujet === sujet);
    if (!found) list.push({ sujet, count: 1, firstSeen: Date.now() });
    else found.count++;
    await window.storage?.set("lacunes", JSON.stringify(list));
  } catch {}
}

const SESSION_ID = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const QUICK = ["Par où commencer ?", "Comment obtenir le NIE ?", "Je suis indépendante", "On part en famille", "C'est quoi l'autónoma ?", "Quel budget prévoir ?"];

function Avatar({ size = 36 }) {
  return <img src={AMELY_PHOTO} alt="Amely" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)" }} />;
}

function VisioBtn() {
  return (
    <a href={STRIPE_VISIO} target="_blank" rel="noopener noreferrer"
      onClick={() => logMetric("visio_click", { sessionId: SESSION_ID })}
      style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "14px 18px", background: "#B5603A", borderRadius: "12px", textDecoration: "none" }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Prendre rendez-vous en visio</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "2px" }}>1h avec Amely · Plan d'action personnalisé</div>
      </div>
      <div style={{ color: "white", fontWeight: "700", fontSize: "16px", whiteSpace: "nowrap" }}>79€ →</div>
    </a>
  );
}

function EmailGate({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [sending, setSending] = useState(false);
  const valid = email.includes("@") && email.includes(".") && prenom.trim();
  return (
    <div style={{ marginTop: "4px", marginBottom: "14px", padding: "16px", background: "#FDF0EA", border: "1.5px solid #B5603A", borderRadius: "14px" }}>
      <div style={{ fontSize: "14px", color: "#1E100A", lineHeight: "1.5", marginBottom: "12px" }}>
        On continue ? 🌿 Laisse-moi ton prénom et ton email — je t'envoie le récap de nos échanges et mes meilleurs conseils pour ton installation.
      </div>
      <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ton prénom" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", marginBottom: "8px", border: "1px solid #E8D5B7", borderRadius: "9px", fontSize: "14px", fontFamily: "inherit", outline: "none" }} />
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Ton email" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", marginBottom: "10px", border: "1px solid #E8D5B7", borderRadius: "9px", fontSize: "14px", fontFamily: "inherit", outline: "none" }} />
      <button onClick={async () => { if (!valid || sending) return; setSending(true); await onSubmit(email, prenom); }}
        disabled={!valid || sending}
        style={{ width: "100%", padding: "11px", background: valid && !sending ? "#B5603A" : "#E8D5B7", color: "white", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", cursor: valid && !sending ? "pointer" : "default", fontFamily: "inherit" }}>
        {sending ? "Un instant..." : "Continuer la conversation"}
      </button>
    </div>
  );
}

function Msg({ m }) {
  const u = m.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: u ? "flex-end" : "flex-start", marginBottom: "14px", gap: "8px", alignItems: "flex-start" }}>
      {!u && <Avatar size={30} />}
      <div style={{ maxWidth: "82%" }}>
        <div style={{ padding: "10px 14px", background: u ? "#B5603A" : "white", color: u ? "white" : "#1E100A", borderRadius: u ? "16px 16px 3px 16px" : "3px 16px 16px 16px", fontSize: "14px", lineHeight: "1.6", border: u ? "none" : "1px solid #E8D5B7", whiteSpace: "pre-wrap" }}>{m.text}</div>
        {m.showVisio && <VisioBtn />}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "14px" }}>
      <Avatar size={30} />
      <div style={{ padding: "10px 14px", background: "white", border: "1px solid #E8D5B7", borderRadius: "3px 16px 16px 16px", display: "flex", gap: "4px", alignItems: "center" }}>
        {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#B5603A", opacity: 0.4, animation: `p 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  );
}

export default function AmelyIA() {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Bonjour ! Je suis Amely 🌿 J'habite à Majorque depuis 1 an — j'ai traversé toutes les démarches de l'intérieur.\n\nTu penses à t'installer ? Dis-moi où tu en es.", showVisio: false }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({ questions: [], profile: null, lacunes: [] });
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const bottom = useRef(null);
  const inp = useRef(null);

  useEffect(() => { logMetric("open", { sessionId: SESSION_ID }); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading, showEmailGate]);

  async function handleEmailSubmit(email, prenom) {
    await subscribeEmail(email, prenom, session.profile);
    await logMetric("email_captured", { sessionId: SESSION_ID, profile: session.profile });
    setEmailCaptured(true);
    setShowEmailGate(false);
    setMsgs(prev => [...prev, { role: "assistant", text: `Merci ${prenom} ! 🌿 Je t'envoie tout ça par email. Continue, pose-moi toutes tes questions.`, showVisio: false }]);
    setTimeout(() => inp.current?.focus(), 100);
  }

  async function send(text) {
    const t = text || input.trim();
    if (!t || loading || showEmailGate) return;
    setInput("");
    const uMsg = { role: "user", text: t, showVisio: false };
    const newMsgs = [...msgs, uMsg];
    setMsgs(newMsgs);
    const newCount = userQuestionCount + 1;
    setUserQuestionCount(newCount);
    setLoading(true);
    const ns = { ...session, questions: [...session.questions, t] };
    try {
      const raw = await callChat(newMsgs.map(m => ({ role: m.role, content: m.text })));
      const p = parseResponse(raw);
      if (p.profile) ns.profile = p.profile;
      if (p.lacune) { ns.lacunes = [...ns.lacunes, p.lacune]; await logLacune(p.lacune); }
      if (p.showVisio) await logMetric("visio_shown", { sessionId: SESSION_ID, profile: ns.profile });
      setSession(ns);
      await saveSession(SESSION_ID, { ...ns, lastUpdate: Date.now(), emailCaptured });
      setMsgs(prev => [...prev, { role: "assistant", text: p.text, showVisio: p.showVisio }]);
      if (newCount >= FREE_QUESTIONS && !emailCaptured) {
        setTimeout(() => setShowEmailGate(true), 600);
      }
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", text: "Une erreur s'est glissée ! Réessaie 🌿", showVisio: false }]);
    }
    setLoading(false);
    setTimeout(() => inp.current?.focus(), 100);
  }

  return (
    <>
      <style>{`@keyframes p{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}} .aq:hover{background:#B5603A!important;color:white!important;border-color:#B5603A!important}`}</style>
      <div style={{ background: "#FAF5EC", borderRadius: "18px", border: "1px solid #E8D5B7", overflow: "hidden", fontFamily: "Georgia,serif", maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ background: "#1E100A", padding: "14px 18px", display: "flex", alignItems: "center", gap: "11px" }}>
          <Avatar size={40} />
          <div><div style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Amely</div><div style={{ color: "#E8C4B0", fontSize: "11px" }}>Guide installation Majorque · disponible maintenant</div></div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4CAF50" }}/><span style={{ color: "#4CAF50", fontSize: "11px" }}>En ligne</span></div>
        </div>
        <div style={{ height: "380px", overflowY: "auto", padding: "16px 13px 8px", background: "#FAF5EC" }}>
          {msgs.map((m, i) => <Msg key={i} m={m} />)}
          {loading && <Typing />}
          {showEmailGate && <EmailGate onSubmit={handleEmailSubmit} />}
          <div ref={bottom} />
        </div>
        {msgs.length === 1 && (
          <div style={{ padding: "0 13px 10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {QUICK.map(q => <button key={q} className="aq" onClick={() => send(q)} style={{ padding: "5px 10px", background: "white", border: "1px solid #E8D5B7", borderRadius: "20px", fontSize: "12px", color: "#1E100A", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}>{q}</button>)}
          </div>
        )}
        <div style={{ padding: "10px 13px 13px", background: "white", borderTop: "1px solid #E8D5B7", display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea ref={inp} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={showEmailGate ? "Laisse ton email pour continuer..." : "Pose ta question sur l'installation à Majorque..."} disabled={showEmailGate} rows={1} style={{ flex: 1, resize: "none", border: "1px solid #E8D5B7", borderRadius: "11px", padding: "9px 12px", fontSize: "14px", fontFamily: "inherit", color: "#1E100A", background: showEmailGate ? "#F0E8D8" : "#FAF5EC", outline: "none", lineHeight: "1.5", maxHeight: "90px" }} />
          <button onClick={() => send()} disabled={!input.trim() || loading || showEmailGate} style={{ width: "38px", height: "38px", borderRadius: "10px", background: input.trim() && !loading && !showEmailGate ? "#B5603A" : "#E8D5B7", border: "none", cursor: input.trim() && !loading && !showEmailGate ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div style={{ padding: "6px 13px 8px", background: "white", textAlign: "center", fontSize: "11px", color: "#aaa", borderTop: "1px solid #FAF5EC" }}>
          <a href="https://vivre-a-majorque.vercel.app" style={{ color: "#B5603A", textDecoration: "none" }}>vivre-a-majorque.vercel.app</a>
        </div>
      </div>
    </>
  );
}
