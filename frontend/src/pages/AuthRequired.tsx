import React from "react";
import { useNavigate } from "react-router-dom";

export default function AuthRequired(){
  const nav = useNavigate();
  return (
    <div style={{display:"grid", placeItems:"center", height:"100%"}}>
      <div style={{
        width:380, background:"#fff", color:"#111", borderRadius:12, padding:24,
        boxShadow:"0 8px 30px rgba(0,0,0,.25)", textAlign:"center"
      }}>
        <div style={{
          width:42, height:42, borderRadius:10, margin:"0 auto 12px",
          display:"grid", placeItems:"center", background:"#eee"
        }}>🔑</div>
        <div style={{fontSize:20, fontWeight:700, marginBottom:6}}>Authentication required</div>
        <div style={{color:"#444", marginBottom:16}}>Please log in to access this page</div>
        <div style={{display:"flex", gap:8, justifyContent:"center"}}>
          <button
            className="button"
            style={{background:"#eee", color:"#111", borderColor:"#ddd"}}
            onClick={()=>nav("/")}
          >
            Log in
          </button>
          <button
            className="button"
            style={{background:"#111", color:"#fff", borderColor:"#111"}}
            onClick={()=>nav("/register")}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
