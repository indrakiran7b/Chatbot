import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function Dashboard(){
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  async function startChat(){
    if(!token){ nav("/"); return; }
    if(busy) return;
    setBusy(true);
    try{
      const res = await fetch(`${API}/projects/`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ name: `Chat ${new Date().toLocaleString()}` })
      });
      if(!res.ok){ alert("Could not create project"); setBusy(false); return; }
      const p = await res.json();
      nav(`/chat/${p.id}`, { state: { initialText: query.trim() } });
    }catch(e:any){
      alert(`Network error: ${e?.message||""}`);
    }finally{
      setBusy(false);
    }
  }

  return (
    <div style={{display:"grid", placeItems:"center", height:"calc(100vh - 40px)"}}>
      <div style={{maxWidth:900, textAlign:"center"}}>
        <div style={{fontSize:28, fontWeight:700, marginBottom:24}}>What’s on your mind today?</div>
        <div style={{display:"flex", alignItems:"center", gap:8, background:"var(--panel-2)", border:"1px solid var(--line)", borderRadius:999, padding:"10px 14px"}}>
          <span>＋</span>
          <input
            className="input"
            style={{flex:1, background:"transparent", border:"none", padding:0}}
            placeholder="Ask anything"
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") startChat(); }}
          />
          <button className="button" type="button" disabled={busy} onClick={startChat} style={{borderRadius:999}}>
            {busy ? "…" : "Go"}
          </button>
        </div>
      </div>
    </div>
  );
}
