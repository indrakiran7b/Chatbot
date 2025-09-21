import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState("test@example.com");
  const [password,setPassword] = useState("password");
  const [err,setErr] = useState<string|undefined>();

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setErr(undefined);
    const body = new URLSearchParams({username:email, password, grant_type:""});
    const res = await fetch("http://localhost:8000/auth/login", { method:"POST", body });
    if(!res.ok){ setErr("Invalid credentials"); return; }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    nav("/dashboard");
  }

  return (
    <div style={{display:"grid", placeItems:"center", height:"100%"}}>
      <form onSubmit={submit} style={{width:380, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:24}}>
        <div style={{fontSize:20, fontWeight:700, marginBottom:12}}>Sign in</div>
        {err && <div style={{color:"#ff7d7d", marginBottom:8}}>{err}</div>}
        <div style={{display:"grid", gap:10}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="button" type="submit">Login</button>
        </div>
        <div style={{marginTop:10, color:"var(--text-dim)"}}>
          Don’t have an account? <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
}
