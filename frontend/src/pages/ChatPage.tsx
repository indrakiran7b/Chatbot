import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:8000";
type Msg = { from:"user"|"assistant"; text:string };

export default function ChatPage(){
  const { projectId } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [messages,setMessages] = useState<Msg[]>([]);
  const [input,setInput] = useState("");
  const [busy,setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement|null>(null);

  async function sendText(text:string){
    if(!text.trim() || busy) return;
    setBusy(true);
    setMessages(prev=>[...prev, {from:"user", text}]);
    try{
      const res = await fetch(`${API}/chat/${projectId}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ message: text })
      });
      if(res.status===401){ alert("Please login again"); nav("/"); return; }
      const data = await res.json();
      setMessages(prev=>[...prev, {from:"assistant", text: data.reply ?? "(no reply)"}]);
    }catch(e:any){
      setMessages(prev=>[...prev, {from:"assistant", text:`(network error) ${e?.message||""}`}]);
    }finally{
      setBusy(false);
    }
  }

  function send(){
    const t = input;
    setInput("");
    sendText(t);
  }

  useEffect(()=>{
    const first = (loc.state as any)?.initialText as string | undefined;
    if(first && first.trim()){
      history.replaceState({}, "", location.pathname);
      sendText(first);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  return (
    <div style={{display:"grid", gridTemplateRows:"1fr auto", height:"calc(100vh - 40px)"}}>
      <div className="scroll" style={{padding:"6px 0 12px 0"}}>
        <div style={{maxWidth:900, margin:"0 auto"}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex", justifyContent: m.from==="user"?"flex-end":"flex-start", padding:"10px 0"}}>
              <div style={{
                maxWidth:"80%", whiteSpace:"pre-wrap",
                background: m.from==="user"?"var(--bubble-user)":"var(--bubble-assistant)",
                border:"1px solid var(--line)", borderRadius:16, padding:"10px 12px", color:"var(--text)"
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
      </div>

      <div style={{borderTop:"1px solid var(--line)", padding:"14px 0", background:"var(--panel)"}}>
        <div style={{maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", gap:10, background:"var(--panel-2)", border:"1px solid var(--line)", borderRadius:999, padding:"10px 14px"}}>
          <span>＋</span>
          <input
            className="input"
            style={{flex:1, background:"transparent", border:"none", padding:0}}
            placeholder="Type a message..."
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") send(); }}
          />
          <span>🎤</span>
          <button className="button" type="button" onClick={send} disabled={busy} style={{borderRadius:999}}>
            {busy ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
