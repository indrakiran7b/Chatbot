import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register(){
  const nav = useNavigate();
  const [email,setEmail] = useState("test@example.com");
  const [password,setPassword] = useState("password");
  const [err,setErr] = useState<string|undefined>();

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setErr(undefined);
    const res = await fetch("http://localhost:8000/auth/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    });
    if(!res.ok){ setErr("Registration failed"); return; }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    nav("/dashboard");
  }

  return (
    <div style={{display:"grid", placeItems:"center", height:"100%"}}>
      <form onSubmit={submit} style={{width:380, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:24}}>
        <div style={{fontSize:20, fontWeight:700, marginBottom:12}}>Create account</div>
        {err && <div style={{color:"#ff7d7d", marginBottom:8}}>{err}</div>}
        <div style={{display:"grid", gap:10}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="button" type="submit">Register</button>
        </div>
        <div style={{marginTop:10, color:"var(--text-dim)"}}>
          Already have an account? <Link to="/">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
