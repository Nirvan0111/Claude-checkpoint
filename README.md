# Claude Checkpoint

Claude Checkpoint is a calm review layer for AI-generated outputs. Users converse
with Claude as usual; when an answer matters, they open **Checkpoint** to see
what Claude did (execution timeline, file diffs, protected files), surface
assumptions / context gaps / verification needs / available sources inline next
to the relevant text, and Approve, Reject, Challenge, or Rollback before
applying the output.

The UI is intentionally minimal — Spectral serif + Figtree sans on a paper-like
neutral palette — and tries to feel like a natural extension of Claude rather
than a separate dashboard.

> **Status:** Mock-only evaluation engine (Phase 1–3 UX). Architecture hooks are
> in place to drop in a real LLM-graded evaluator and a real execution runner
> without touching the UI layer.

---

## Stack

| Layer    | Tech                                                          |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18 + TypeScript, Tailwind CSS, CRACO, lucide-react      |
| Backend  | FastAPI, Motor (async MongoDB), Pydantic v2, Python 3.11      |
| Database | MongoDB                                                       |

Project layout:

```
/app
├── frontend/                  # CRA + TS + Tailwind
│   ├── src/
│   │   ├── components/        # UI layer (ConversationMessage, ReviewPanel, …)
│   │   │   └── execution/     # Execution Review sub-components
│   │   ├── data/              # Mock data generators
│   │   ├── lib/api.ts         # Backend client
│   │   ├── state/             # useConversation (state management layer)
│   │   ├── types.ts           # Shared domain types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vercel.json
├── backend/                   # FastAPI app
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

---

## Local setup

### 1. Prerequisites

- Node.js 20+ and Yarn 1.x
- Python 3.11+
- MongoDB 6+ running locally (`mongod --bind_ip_all`)

### 2. Environment variables

Copy the example files and fill in the values you need.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example  backend/.env
```

#### `frontend/.env`

| Variable                | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `REACT_APP_BACKEND_URL` | Public base URL of the FastAPI backend (no trailing slash).             |
| `WDS_SOCKET_PORT`       | Optional — set to `443` when running behind an HTTPS preview proxy.     |

#### `backend/.env`

| Variable       | Purpose                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| `MONGO_URL`    | MongoDB connection string. Example: `mongodb://localhost:27017`.              |
| `DB_NAME`      | Database name. Example: `claude_checkpoint`.                                  |
| `CORS_ORIGINS` | Comma-separated allowed origins. Use `*` for local dev; tighten in prod.      |

> **Secrets policy.** `.env` is git-ignored. Never commit real secrets — only
> commit `.env.example` with placeholder values.

### 3. Install dependencies

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
yarn install
```

### 4. Run

In two terminals:

```bash
# Backend (defaults to port 8001)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
yarn start
```

Open <http://localhost:3000>.

### 5. Health check

```bash
curl http://localhost:8001/api/health
# => {"status":"ok","service":"claude-checkpoint"}
```

---

## API reference

All endpoints are prefixed with `/api`.

| Method | Path                  | Body / Query                                  | Returns                |
| ------ | --------------------- | --------------------------------------------- | ---------------------- |
| GET    | `/api/health`         | —                                             | `{status, service}`    |
| POST   | `/api/reviews`        | `ReviewDecisionCreate`                        | `ReviewDecision`       |
| GET    | `/api/reviews`        | `?conversation_id=…&limit=N`                  | `ReviewDecision[]`     |
| GET    | `/api/reviews/{id}`   | —                                             | `ReviewDecision`       |

`ReviewDecisionCreate` shape:

```json
{
  "message_id": "string",
  "conversation_id": "string",
  "decision": "approved | rejected | challenged | rolled_back",
  "prompt": "string",
  "output": "string",
  "signals": ["Assumption", "Source Available", "…"],
  "note": "string (optional)"
}
```

Responses always use `id` (string), never raw Mongo `_id`.

---

## Production deployment

### Frontend → Vercel

The frontend is a standard Create React App project with a small CRACO config
and a `vercel.json` that points Vercel at the right scripts.

1. **Push the repo to GitHub.**
2. In the Vercel dashboard, **import the repo** and pick the `frontend/`
   directory as the project root.
3. Vercel will detect `vercel.json`:
   - Build command: `yarn build`
   - Output directory: `build`
   - Install command: `yarn install`
   - Framework: Create React App (CRACO).
4. Add a single environment variable:
   - `REACT_APP_BACKEND_URL` = the public URL of your deployed backend.
5. Deploy. The `rewrites` rule in `vercel.json` forwards every non-asset path
   to `index.html` so client-side routing works out of the box.

> No `.env` file is committed. You manage `REACT_APP_BACKEND_URL` from the
> Vercel project settings.

### Backend → not Vercel (recommended elsewhere)

FastAPI + MongoDB + Motor relies on a **long-lived async event loop** with
warm connection pools. Vercel's Python runtime is serverless and spins up a
fresh worker per cold request, which:

- Defeats Motor's connection pooling
- Re-runs the FastAPI lifespan on cold start (adding latency)
- Cannot keep MongoDB sockets warm

**Recommended hosts (all support FastAPI cleanly):**

| Host       | Why it fits                                           |
| ---------- | ----------------------------------------------------- |
| **Render** | Free tier, native FastAPI support, persistent worker. |
| **Railway**| Same shape as Render, simple Mongo plugin.            |
| **Fly.io** | Cheap global edge, scale-to-zero with warm pools.     |
| **Heroku** | Classic option, fine if you already use it.           |

Generic deployment recipe (Render / Railway):

1. Service type: **Web Service** (long-running).
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`.
4. Environment:
   - `MONGO_URL` = your hosted MongoDB URI (Atlas, Mongo Cloud, host plugin).
   - `DB_NAME` = `claude_checkpoint` (or whatever you prefer).
   - `CORS_ORIGINS` = your Vercel domain, e.g. `https://claude-checkpoint.vercel.app`.
5. Health check path: `/api/health`.

### Database → MongoDB Atlas (recommended)

For a fully managed setup, point `MONGO_URL` at a MongoDB Atlas cluster
(free M0 tier is enough for review-decision storage). Atlas IP-allowlist your
backend host.

### CORS

In production, **do not** leave `CORS_ORIGINS=*`. Set it to the exact
deployed frontend origin(s), comma-separated:

```
CORS_ORIGINS=https://claude-checkpoint.vercel.app,https://staging.claude-checkpoint.vercel.app
```

---

## Build verification

```bash
# Frontend
cd frontend
yarn build               # production bundle
yarn build && npx serve -s build    # local production preview

# Backend
cd backend
pytest -q                # tests (live in /app/backend/tests/)
ruff check .             # lint
```

The frontend build emits to `frontend/build/`. CRA reports any TypeScript or
ESLint errors during build — a clean build means zero TypeScript errors and
no unused-import failures.

---

## Known limitations

- **Mock data only.** Assistant replies, evaluation signals, execution
  payloads (timeline, file diffs, protected files), and challenge results are
  generated deterministically client-side. There is no LLM in the loop yet.
- **No auth.** Phase 1–3 is intentionally single-user / single-session. Bring
  your own auth before exposing the deployed instance publicly.
- **No conversation history.** Reviews are persisted to MongoDB but full
  conversation transcripts are kept only in-memory in the browser.
- **Backend not for Vercel.** See above. Use Render / Railway / Fly / Atlas.

---

## Roadmap

- **Phase 4 — Real evaluation.** Swap `data/mockData.ts` for a real
  LLM-graded evaluator (Claude API) using the existing `Signal` / `Message`
  / `ChallengeResults` types — no UI changes required.
- **Phase 4 — Real execution.** Have your execution runner emit the
  `ExecutionData` shape (`summary`, `timeline`, `files`, `protectedFiles`);
  the panel will render it as-is.
- **Decisions view.** A lightweight list view fed by `/api/reviews` to
  scan everything that was approved, challenged, or rolled back.

---

## License

Proprietary — internal product prototype. Adjust as needed before publishing.
