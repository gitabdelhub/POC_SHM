# SahamBI — Analytics Platform

A full-stack business intelligence platform for Saham Bank, built with FastAPI, PostgreSQL, and a vanilla JS single-page application. Includes a Medallion ETL pipeline (Bronze → Silver → Gold), an AI-powered SQL chatbot, and an interactive analytics dashboard.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | PostgreSQL 15 |
| ETL | Custom Medallion pipeline (Bronze / Silver / Gold) |
| AI | LangChain, OpenAI GPT-4o, pgvector (RAG + Text-to-SQL) |
| Frontend | Vanilla JS SPA, SVG charts, SVG bubble map |
| Auth | JWT (access + refresh tokens), role-based access control |
| Tests | pytest, 36 tests |

---

## Getting Started

**Prerequisites:** Python 3.11+, PostgreSQL 15, an OpenAI API key.

```bash
# 1. Clone and set up the backend
cd GOKU/backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# 2. Configure environment
copy .env.example .env
# Edit .env: DATABASE_URL, OPENAI_API_KEY, SECRET_KEY

# 3. Seed the database and run the ETL pipeline
python -m etl.generate_data    # Generate synthetic data
python -m etl.run_pipeline     # Bronze -> Silver -> Gold

# 4. Start the API server
uvicorn app.main:app --reload --port 8000

# 5. Open the frontend
# Open frontend/index.html in your browser, or:
python -m http.server 5500     # from the frontend/ directory
```

---

## Project Structure

```
GOKU/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration
│   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   ├── models/              # ORM models (User, Agence, Client, ...)
│   │   ├── routers/             # REST endpoints (auth, ai, gold, etl, ...)
│   │   ├── services/rag/        # Text-to-SQL engine, LLM wrapper, embeddings
│   │   └── core/                # JWT security, dependency injection
│   ├── etl/
│   │   ├── bronze/              # Raw data extraction & loading
│   │   ├── silver/              # Validation, cleaning, normalization
│   │   ├── gold/                # Aggregation into fact & dimension tables
│   │   ├── generate_data.py     # Synthetic data generator (Faker)
│   │   └── run_pipeline.py      # Orchestrator: Bronze -> Silver -> Gold
│   └── tests/                   # pytest test suite (36 tests)
└── frontend/
    └── index.html               # Single-page application (all JS inline)
```

---

## Architecture

```
Browser (SPA)
    | JWT in localStorage
    v
FastAPI (port 8000)
    +-- /auth      Login, refresh, user profile
    +-- /ai        Text-to-SQL chatbot, query history logs
    +-- /gold      KPIs, dashboard data (dim_*, fact_*)
    +-- /agences   Agency CRUD
    +-- /etl       Trigger pipeline runs
         |
         v
PostgreSQL (saham_bank)
    +-- Bronze tables    raw CSV snapshots
    +-- Silver tables    validated, cleaned records
    +-- Gold tables      fact_performance, fact_engagement,
                         fact_risque, dim_agence, dim_client, ...
```

---

## Key Features

- **Medallion ETL** — Bronze (raw) → Silver (validated) → Gold (aggregated). Re-runnable, idempotent.
- **AI Chatbot (SahamAI)** — Ask questions in French, get SQL + structured answer + optional chart. Every query is logged to i_query_log.
- **Role-Based Access Control** — 5 roles (DG, DR, CA, AR, Admin). The admin panel manages per-module permissions; unauthorized routes display an access-denied screen instead of silently failing.
- **Bubble Map** — SVG map of Morocco showing agency distribution by outstanding loans (Encours). Driven by live Gold data.
- **Admin Console** — Full SQL query viewer (read-only modal, click any row), user management, permission matrix, CSV export with SQL column included.

---

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/saham_bank
OPENAI_API_KEY=sk-...
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## Running Tests

```bash
cd backend
venv\Scripts\python.exe -m pytest -v
# Expected: 36 passed
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| DG | mehdi.tazi@sahambank.ma | Saham2024! |
| Admin | admin@sahambank.ma | Admin2024! |
| DR | youssef.berrada@sahambank.ma | Saham2024! |

---

## License

Internal use only — Saham Bank. Not for public distribution.
