import React from "react";

export default function Search(){
  return (
    <div style={{display:"grid", placeItems:"center", height:"100%"}}>
      <div style={{maxWidth:900, width:"100%"}}>
        <div style={{fontSize:28, fontWeight:700, marginBottom:24, textAlign:"center"}}>Search chats</div>
        <div style={{display:"flex", alignItems:"center", gap:8, background:"var(--panel-2)", border:"1px solid var(--line)", borderRadius:999, padding:"10px 14px"}}>
          <span>🔎</span>
          <input className="input" style={{flex:1, background:"transparent", border:"none", padding:0}} placeholder="Search by keyword…" />
          <button className="button" style={{borderRadius:999}}>Search</button>
        </div>
        <div className="divider"/>
        <div className="placeholder" style={{textAlign:"center"}}>No search results yet.</div>
      </div>
    </div>
  );
}
