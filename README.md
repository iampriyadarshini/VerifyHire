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

The initial migration creates `offers`, `assessments`, and `findings`. Phase 5 adds an `evidence_records` table containing only structured OCR/QR/email results linked to an offer when applicable; uploaded files themselves are never persisted.

### Phase 5 evidence analysis

Install the backend requirements above. Pillow validates image signatures and dimensions. OCR uses `pytesseract` (which requires the Tesseract executable to be installed and available on `PATH`); when it is unavailable, the API reports an unreadable result rather than guessing. QR detection uses `opencv-python-headless`. On Windows, install Tesseract separately from a trusted package source and verify `tesseract --version`.

Supported uploads are PNG, JPG, and JPEG images, or `.eml` email files. Uploads are limited to 5 MB, processed temporarily in memory, and then discarded. Image dimensions are capped to prevent excessive processing. The API never opens URLs found in screenshots, QR codes, or email content. QR URLs are passed only to the passive URL parser. Email SPF, DKIM, and DMARC statuses are reported only when present in supplied `Authentication-Results` headers; missing evidence is reported as unknown, not failed. Headers can be forged, so passing results do not establish authenticity.

Evidence endpoints:

- `POST /api/v1/offers/{offer_id}/attachments` — multipart image upload with OCR, QR, and message-risk analysis.
- `POST /api/v1/email-checks` — multipart `.eml` upload, with optional `company_name` and `company_website` form fields.

The frontend displays OCR, QR, and email evidence findings on the report page, including each finding's source, explanation, and recommendation. It does not automatically open decoded links or email links/attachments. Only `.eml` files are accepted for email analysis. Do not upload files containing information you do not want included in the minimum structured analysis result.

### Phase 6 experimental ML classifier

Phase 6 adds an optional, explainable scikit-learn baseline alongside the existing rule engine. It uses a TF-IDF vectorizer and Logistic Regression classifier. The model is never trained automatically from user submissions. If no model artifact is present, the API reports the ML signal as unavailable and continues using rule-based analysis and evidence.

The repository includes `backend/ml/data/synthetic_offers.csv`, a small development-only dataset created for pipeline tests. It contains equal numbers of manually written `legitimate` and `suspicious` text examples. It is not sourced from real-world reports, has no external license claim, and must not be used to claim production accuracy. Replace it with a documented, appropriately licensed dataset before relying on evaluation results. Text, rather than company names or domains, is used as the model input to avoid that leakage shortcut.

Install the updated requirements and train the artifact from the `backend` directory:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m ml.train
.\.venv\Scripts\python.exe -m ml.evaluate
```

The default artifact path is `backend/models/fake_offer_classifier.joblib`. Set `ML_MODEL_PATH` to use another explicitly trained artifact. The training script uses a fixed random seed, stratified held-out split, and fits TF-IDF only on the training partition. Evaluation reports class-wise precision, recall, F1, confusion matrix, and false-positive rate. The small synthetic split is only a reproducibility check; reliable real-world evaluation requires representative, independently sourced data and a separate held-out test set.

The report distinguishes the experimental ML signal from rule-based findings. Its score is uncalibrated and is not shown as a verified fraud probability. A strong rule-based warning, such as an upfront payment request, remains authoritative for the existing High Risk category; an ML result cannot override it. Influential TF-IDF terms are explanatory indicators, not proof.

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
