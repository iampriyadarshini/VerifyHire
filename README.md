# VerifyHire

VerifyHire is a FastAPI and React application for preliminary, evidence-based review of job and internship offers.

## Backend

From the repository root on Windows PowerShell:

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
alembic upgrade head
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

The API is documented at <http://127.0.0.1:8000/docs>.

Set `DATABASE_URL` in `backend/.env` to a PostgreSQL SQLAlchemy URL, for example:

```text
postgresql+psycopg://verifyhire_user:your_password@localhost:5432/verifyhire
```

Run database migrations from the repository root with:

```powershell
alembic upgrade head
```

Create a new migration after changing ORM models with:

```powershell
alembic revision --autogenerate -m "describe schema change"
```

The initial migration creates `offers`, `assessments`, and `findings`. Offers store only the fields required for the requested assessment; no screenshot, authentication data, or unrelated personal information is persisted.

Run backend tests with:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pytest tests
```

## Configuration

`backend/.env.example` documents:

- `ALLOWED_ORIGINS`: comma-separated frontend origins for CORS.
- `DATABASE_URL`: SQLAlchemy database URL. Production should use PostgreSQL; tests use an isolated in-memory SQLite database.
- `VERIFIED_COMPANY_DOMAINS`: comma-separated, locally maintained registered domains. Leave empty when no reference data is available.
- `RECRUITMENT_PLATFORM_DOMAINS`: comma-separated domains treated as possible third-party recruiter domains.

The analysis uses local configuration and passive parsing only. It does not open submitted URLs, follow redirects, resolve hostnames, access private networks, or query external reputation services. The URL analyzer uses a bundled Public Suffix List snapshot through `tldextract` and disables list downloads.

Offers, assessments, and findings are persisted in PostgreSQL after migrations are applied. Database credentials belong only in `backend/.env`, which is ignored by Git. No analysis is a guarantee of authenticity: legitimate companies can be impersonated, and legitimate recruiters can use third-party platforms.

## Frontend

In a separate PowerShell terminal:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from `.env`. Do not put secrets in frontend environment variables.
