import { useState, useRef, useEffect } from "react";

const AMELY_PHOTO = "data:image/jpeg;base64,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";
const STRIPE_VISIO = "https://buy.stripe.com/eVq4gy1CY05r05237n6AM0W";
const FREE_QUESTIONS = 3;


function parseResponse(text) {
  const profileMatch = text.match(/\[PROFIL:([^\]]+)\]/);
  const lacuneMatch = text.match(/\[LACUNE:([^\]]+)\]/);
  const showVisio = text.includes("[VISIO]");
  const clean = text.replace(/\[PROFIL:[^\]]+\]/g, "").replace(/\[LACUNE:[^\]]+\]/g, "").replace(/\[VISIO\]/g, "").replace(/[#*_~`]/g, "").trim();
  return { text: clean, profile: profileMatch?.[1] || null, lacune: lacuneMatch?.[1] || null, showVisio };
}

async function callChat(messages, questionCount) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, questionCount, max_tokens: 400 }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function subscribeEmail(email, prenom, profil) {
  try { await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prenom, email, profil: profil || "", segment: "freemium" }) }); return true; } catch { return false; }
}

const SESSION_ID = `s_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const QUICK = ["Par où commencer ?", "Comment obtenir le NIE ?", "C'est quoi l'autónoma ?", "On part en famille", "Quel budget prévoir ?"];

function Avatar({size=32}) { return <img src={AMELY_PHOTO} alt="Amely" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid rgba(255,255,255,0.25)"}}/>; }

function VisioBtn() {
  return (
    <a href={STRIPE_VISIO} target="_blank" rel="noopener noreferrer"
      style={{display:"flex",alignItems:"center",gap:"10px",marginTop:"10px",padding:"12px 14px",background:"#B5603A",borderRadius:"12px",textDecoration:"none"}}>
      <div style={{flex:1}}>
        <div style={{color:"white",fontWeight:"600",fontSize:"13px"}}>Réserver ma visio conseil</div>
        <div style={{color:"rgba(255,255,255,0.8)",fontSize:"11px",marginTop:"2px"}}>1h avec Amely · Plan d'action sur-mesure</div>
      </div>
      <div style={{color:"white",fontWeight:"700",fontSize:"15px",whiteSpace:"nowrap"}}>79€ →</div>
    </a>
  );
}

function EmailGate({onSubmit}) {
  const [email,setEmail]=useState("");
  const [prenom,setPrenom]=useState("");
  const [sending,setSending]=useState(false);
  const valid=email.includes("@")&&email.includes(".")&&prenom.trim();
  return (
    <div style={{marginTop:"4px",marginBottom:"10px",padding:"14px",background:"#FDF0EA",border:"1.5px solid #B5603A",borderRadius:"12px"}}>
      <div style={{fontSize:"13px",color:"#1E100A",lineHeight:"1.5",marginBottom:"10px"}}>
        Pour continuer la conversation et recevoir ton récap personnalisé, laisse-moi ton prénom et ton email 🌿
      </div>
      <input value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Ton prénom" style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",marginBottom:"6px",border:"1px solid #E8D5B7",borderRadius:"8px",fontSize:"13px",fontFamily:"inherit",outline:"none"}}/>
      <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Ton email" style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",marginBottom:"8px",border:"1px solid #E8D5B7",borderRadius:"8px",fontSize:"13px",fontFamily:"inherit",outline:"none"}}/>
      <button onClick={async()=>{if(!valid||sending)return;setSending(true);await onSubmit(email,prenom);}} disabled={!valid||sending}
        style={{width:"100%",padding:"10px",background:valid&&!sending?"#B5603A":"#E8D5B7",color:"white",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:valid&&!sending?"pointer":"default",fontFamily:"inherit"}}>
        {sending?"Un instant...":"Continuer la conversation"}
      </button>
    </div>
  );
}

function Msg({m}) {
  const u=m.role==="user";
  return (
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:"10px",gap:"6px",alignItems:"flex-start"}}>
      {!u&&<Avatar size={26}/>}
      <div style={{maxWidth:"85%"}}>
        <div style={{padding:"9px 12px",background:u?"#B5603A":"white",color:u?"white":"#1E100A",borderRadius:u?"14px 14px 3px 14px":"3px 14px 14px 14px",fontSize:"13px",lineHeight:"1.55",border:u?"none":"1px solid #E8D5B7",whiteSpace:"pre-wrap"}}>{m.text}</div>
        {m.showVisio&&<VisioBtn/>}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{display:"flex",gap:"6px",alignItems:"flex-start",marginBottom:"10px"}}>
      <Avatar size={26}/>
      <div style={{padding:"9px 12px",background:"white",border:"1px solid #E8D5B7",borderRadius:"3px 14px 14px 14px",display:"flex",gap:"4px",alignItems:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:"5px",height:"5px",borderRadius:"50%",background:"#B5603A",opacity:0.4,animation:`p 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );
}

export default function AmelyIA() {
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Salut ! Je suis Amely 🌿 J'habite à Majorque depuis 1 an, j'ai traversé toutes les démarches de l'intérieur.\n\nTu penses à t'installer ? Dis-moi où tu en es.",showVisio:false}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [session,setSession]=useState({questions:[],profile:null,lacunes:[]});
  const [qCount,setQCount]=useState(0);
  const [emailCaptured,setEmailCaptured]=useState(false);
  const [showGate,setShowGate]=useState(false);
  const bottom=useRef(null);
  const inp=useRef(null);

  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading,showGate]);

  async function handleEmail(email,prenom) {
    await subscribeEmail(email,prenom,session.profile);
    setEmailCaptured(true);
    setShowGate(false);
    setMsgs(prev=>[...prev,{role:"assistant",text:`Merci ${prenom} 🌿 Je t'envoie tout ça par email. Continue, pose-moi toutes tes questions !`,showVisio:false}]);
  }

  async function send(text) {
    const t=text||input.trim();
    if(!t||loading||showGate)return;
    setInput("");
    const uMsg={role:"user",text:t,showVisio:false};
    const newMsgs=[...msgs,uMsg];
    setMsgs(newMsgs);
    const nc=qCount+1;
    setQCount(nc);
    setLoading(true);
    const ns={...session,questions:[...session.questions,t]};
    try {
      const raw=await callChat(newMsgs.map(m=>({role:m.role,content:m.text})), nc);
      const p=parseResponse(raw);
      if(p.profile)ns.profile=p.profile;
      if(p.lacune)ns.lacunes=[...ns.lacunes,p.lacune];
      setSession(ns);
      setMsgs(prev=>[...prev,{role:"assistant",text:p.text,showVisio:p.showVisio||(nc>=FREE_QUESTIONS)}]);
      if(nc>=FREE_QUESTIONS&&!emailCaptured){setTimeout(()=>setShowGate(true),800);}
    } catch {
      setMsgs(prev=>[...prev,{role:"assistant",text:"Oups, petite erreur ! Réessaie 🌿",showVisio:false}]);
    }
    setLoading(false);
    setTimeout(()=>inp.current?.focus(),100);
  }

  if(!open) {
    return (
      <button onClick={()=>setOpen(true)} aria-label="Pose ta question à Amely"
        style={{position:"fixed",bottom:"80px",right:"20px",width:"56px",height:"56px",borderRadius:"50%",background:"#B5603A",border:"none",cursor:"pointer",boxShadow:"0 4px 14px rgba(181,96,58,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,transition:"transform .2s"}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
    );
  }

  return (
    <>
      <style>{`@keyframes p{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}} .aq:hover{background:#B5603A!important;color:white!important;border-color:#B5603A!important}`}</style>
      <div style={{position:"fixed",bottom:"80px",right:"16px",width:"360px",maxHeight:"520px",borderRadius:"16px",border:"1px solid #E8D5B7",overflow:"hidden",fontFamily:"Georgia,serif",zIndex:9999,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",background:"#FAF5EC"}}>
        <div style={{background:"#1E100A",padding:"10px 14px",display:"flex",alignItems:"center",gap:"9px",flexShrink:0}}>
          <Avatar size={34}/>
          <div style={{flex:1}}><div style={{color:"white",fontWeight:"600",fontSize:"14px"}}>Amely</div><div style={{color:"#E8C4B0",fontSize:"10px"}}>Guide installation Majorque</div></div>
          <div style={{display:"flex",alignItems:"center",gap:"4px"}}><div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#4CAF50"}}/><span style={{color:"#4CAF50",fontSize:"10px"}}>En ligne</span></div>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#E8C4B0",fontSize:"18px",cursor:"pointer",padding:"0 0 0 6px",lineHeight:1}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 10px 6px",background:"#FAF5EC"}}>
          {msgs.map((m,i)=><Msg key={i} m={m}/>)}
          {loading&&<Typing/>}
          {showGate&&<EmailGate onSubmit={handleEmail}/>}
          <div ref={bottom}/>
        </div>
        {msgs.length===1&&(
          <div style={{padding:"0 10px 8px",display:"flex",flexWrap:"wrap",gap:"4px"}}>
            {QUICK.map(q=><button key={q} className="aq" onClick={()=>send(q)} style={{padding:"4px 8px",background:"white",border:"1px solid #E8D5B7",borderRadius:"16px",fontSize:"11px",color:"#1E100A",cursor:"pointer",transition:"all .15s",fontFamily:"inherit"}}>{q}</button>)}
          </div>
        )}
        <div style={{padding:"8px 10px 10px",background:"white",borderTop:"1px solid #E8D5B7",display:"flex",gap:"6px",alignItems:"flex-end",flexShrink:0}}>
          <textarea ref={inp} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={showGate?"Laisse ton email pour continuer...":"Pose ta question..."} disabled={showGate} rows={1} style={{flex:1,resize:"none",border:"1px solid #E8D5B7",borderRadius:"10px",padding:"8px 10px",fontSize:"13px",fontFamily:"inherit",color:"#1E100A",background:showGate?"#F0E8D8":"#FAF5EC",outline:"none",lineHeight:"1.4",maxHeight:"70px"}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading||showGate} style={{width:"34px",height:"34px",borderRadius:"8px",background:input.trim()&&!loading&&!showGate?"#B5603A":"#E8D5B7",border:"none",cursor:input.trim()&&!loading&&!showGate?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
