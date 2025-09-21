# Minimal Chatbot Platform (Fixed)

Implements:
- JWT auth (register/login)
- Create/list projects per user
- Store prompts per project
- Chat endpoint that calls OpenAI **Responses API** (or returns a stub if `OPENAI_API_KEY` is missing)
- Simple file upload per project

## Run backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `.env` in `backend` (optional, stub works without a key):

```
SECRET_KEY=change-me
DATABASE_URL=sqlite:///./app.db
OPENAI_API_KEY=sk-...           # optional
OPENAI_MODEL=gpt-4o-mini        # change as you like
OPENAI_API_BASE=https://api.openai.com/v1/responses
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- **Frontend:** http://localhost:5173
- **Backend docs:** http://localhost:8000/docs


## Notes

- If you don’t set `OPENAI_API_KEY`, the chat returns a local `(stub)` echo so you can demo the UI end-to-end.
- Swap SQLite for Postgres by updating `DATABASE_URL` (e.g., `postgresql+psycopg2://user:pass@localhost/dbname`).
