# backend/app/chat.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
import httpx
from typing import Any, List, Union

from .db import get_session
from .models import Project, User, Prompt
from .core.security import decode_access_token
from .core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])
auth = HTTPBearer()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(auth),
    session: Session = Depends(get_session),
):
    try:
        payload = decode_access_token(token.credentials)
        user_id = int(payload.get("sub"))
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token user")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def local_stub_response(msg: str) -> str:
    m = (msg or "").lower().strip()
    if "palindrome" in m:
        return (
            "LLM unavailable (stub). Here's a quick palindrome check:\n\n"
            "Python:\n"
            "```python\n"
            "def is_palindrome(s: str) -> bool:\n"
            "    s = ''.join(ch.lower() for ch in s if ch.isalnum())\n"
            "    return s == s[::-1]\n"
            "```\n\n"
            "JavaScript:\n"
            "```js\n"
            "function isPalindrome(s){\n"
            "  s = s.toLowerCase().replace(/[^a-z0-9]/g,'');\n"
            "  return s === s.split('').reverse().join('');\n"
            "}\n"
            "```\n"
        )
    if m in {'hi','hello','hey'}:
        return "LLM unavailable (stub). Hello! Add an API key in backend/.env to enable real replies."
    return "LLM unavailable (stub). Add OPENAI_API_KEY in backend/.env (or switch provider) to get real model responses."


def _extract_text(data: dict) -> str:
    if isinstance(data.get("output_text"), str) and data["output_text"].strip():
        return data["output_text"].strip()

    parts: List[str] = []
    for item in data.get("output", []) or []:
        content = item.get("content", item)
        if isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("text"):
                    parts.append(str(c["text"]))
        elif isinstance(content, dict) and content.get("text"):
            parts.append(str(content["text"]))
        elif isinstance(content, str):
            parts.append(content)
    if parts:
        return " ".join(parts).strip()

    try:
        return (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
    except Exception:
        return ""


@router.post("/{project_id}")
async def send_message(
    project_id: int,
    payload: dict,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    proj = session.get(Project, project_id)
    if not proj or proj.owner_id != user.id:
        raise HTTPException(status_code=404, detail="project not found")

    msg = (payload.get("message") or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="message required")

    prompts = session.exec(
        select(Prompt).where(Prompt.project_id == project_id)
    ).all()
    system_prompt = "\n".join([p.content for p in prompts]) or "You are a helpful assistant."

    body = {
        "model": settings.OPENAI_MODEL,
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
            {"role": "user", "content": [{"type": "input_text", "text": msg}]},
        ],
    }

    # No key -> helpful stub (do not echo user text)
    if not settings.OPENAI_API_KEY:
        return {"reply": local_stub_response(msg), "raw": {"note": "No OPENAI_API_KEY set"}}

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    if "openrouter.ai" in settings.OPENAI_API_BASE:
        headers["HTTP-Referer"] = "http://localhost:5173"
        headers["X-Title"] = "Minimal Chatbot Platform"

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(settings.OPENAI_API_BASE, headers=headers, json=body)

    if r.status_code >= 400:
        # On quota/rate/billing issues -> return helpful stub, not echo
        try:
            err = r.json()
        except Exception:
            err = {"error": {"message": r.text}}
        msg_txt = (err.get("error", {}).get("message") or "").lower()
        code = (err.get("error", {}).get("code") or "").lower()
        if r.status_code in (402, 403, 429, 503) or "quota" in msg_txt or "billing" in msg_txt or "rate" in msg_txt or "insufficient_quota" in code:
            return {
                "reply": local_stub_response(msg),
                "raw": {"note": "LLM unavailable (quota/rate-limit). Returning stub.", "provider_error": err},
            }
        raise HTTPException(status_code=500, detail=f"LLM error: {r.text}")

    data = r.json()
    text_out = _extract_text(data) or "(no content)"
    return {"reply": text_out, "raw": data}
