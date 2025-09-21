import React from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function Sidebar(){
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";

  async function createNewChat(){
    if(!token){ nav("/"); return; }
    const res = await fetch(`${API}/projects/`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ name: `Chat ${new Date().toLocaleString()}` })
    });
    if(!res.ok){ alert("Could not start chat"); return; }
    const p = await res.json();
    nav(`/chat/${p.id}`);
  }

  function logout(){
    localStorage.removeItem("token");
    nav("/");
  }

  const loggedIn = !!token;

  return (
    <aside style={{background:"var(--panel)", borderRight:"1px solid var(--line)", padding:"14px 12px", display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"10px"}}>
        <div style={{width:28, height:28, borderRadius:6, background:"var(--accent)"}}/>
        <div style={{fontWeight:700}}>ChatGPT 5</div>
      </div>

      {loggedIn && (
        <>
          <button className="button" type="button" onClick={createNewChat}>New chat</button>
          <button className="button" type="button" onClick={()=>nav("/search")}>Search chats</button>
        </>
      )}

      <div style={{flex:1}}/>

      {!loggedIn ? (
        <>
          <button className="button" type="button" onClick={()=>nav("/")}>Login</button>
          <button className="button" type="button" onClick={()=>nav("/register")}>Register</button>
        </>
      ) : (
        <button className="button" type="button" onClick={logout}>Logout</button>
      )}
    </aside>
  );
}
