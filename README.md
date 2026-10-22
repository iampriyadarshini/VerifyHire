# VerifyHire — Job & Internship Offer Verification System

VerifyHire is a full-stack web application designed to help students, fresh graduates, and experienced professionals assess the credibility of job offers, internship opportunities, and recruitment messages.

The system analyzes submitted offer details and available evidence to identify suspicious indicators, explain potential risks, and recommend safer next steps.

**Important:** VerifyHire provides preliminary, evidence-based assessments. It cannot guarantee that an offer is genuine or fraudulent.

## Key Features

- **Job Offer Analysis:** Analyze recruitment messages, company details, sender email addresses, and job URLs.
- **Suspicious Message Detection:** Identify potential warning signs such as upfront payment requests, urgency tactics, unrealistic salary claims, and guaranteed-selection promises.
- **Domain Comparison:** Compare company website, job URL, and sender email domains when the required information is available.
- **Screenshot Analysis:** Extract readable text from supported images using Optical Character Recognition (OCR).
- **QR Code Detection:** Detect QR codes in uploaded images and analyze decoded URLs without opening them.
- **Email Header Analysis:** Inspect `.eml` files and report available SPF, DKIM, and DMARC information from supplied authentication headers.
- **Machine Learning Classification:** Use TF-IDF and Logistic Regression to provide an additional, experimental text-classification signal.
- **Evidence-Based Reports:** Display warning signs, supporting evidence, explanations, limitations, and recommended actions.
- **Database Persistence:** Store submitted offers, assessments, and findings in the configured database.
- **Privacy-Conscious Processing:** Process supported uploads temporarily without persisting the original uploaded files.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL, SQLite for supported local fallback and testing configurations |
| Database ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Data Validation | Pydantic |
| Image Processing | Pillow |
| OCR | Tesseract OCR, pytesseract |
| QR Code Detection | OpenCV |
| Machine Learning | scikit-learn, TF-IDF, Logistic Regression |
| Model Persistence | joblib |
| Backend Testing | pytest |
| Package Management | npm, pip |

## System Architecture

The application follows a frontend-backend architecture.

1. **User Input:** Users submit offer messages, company details, job URLs, screenshots, or email files.
2. **Frontend:** React provides the user interface for submitting offers and viewing reports.
3. **Backend API:** FastAPI validates requests and coordinates the analysis services.
4. **Verification Engine:** Message rules, URL parsing, domain comparison, OCR, QR detection, and email-header analysis examine available evidence.
5. **ML Classification:** An optional trained machine learning model provides an additional text-classification signal.
6. **Risk Assessment:** Available findings are combined to generate an explainable assessment.
7. **Database:** Offers, assessments, findings, and structured evidence results are stored according to the configured database setup.
8. **Analysis Report:** Users receive a risk category, supporting findings, limitations, and recommended next steps.

## Risk Assessment Categories

- **High Risk:** Strong warning signs are present, such as a request for an upfront payment.
- **Needs Review:** Available evidence contains concerns that require further verification.
- **Unverified:** There is insufficient evidence to reach a meaningful conclusion.
- **Lower Observed Risk:** No strong warning signs were identified in the available inputs.

A lower observed risk does not prove that an offer is genuine. Missing evidence is not automatically evidence of fraud.

## Project Structure

```text
VerifyHire/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── ml/
│   │   ├── data/
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── models/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── README.md
└── .gitignore
```

The directory tree is illustrative. Keep it aligned with the actual files in the repository.

## Prerequisites

Install the following software:

- Python version supported by the backend dependencies.
- Node.js and npm.
- PostgreSQL, if using a local PostgreSQL database.
- Tesseract OCR for image text extraction.
- Git for source control.

Verify your installations:

```powershell
python --version
node --version
npm --version
git --version
tesseract --version
```

## Installation and Setup

### 1. Clone the repository

```powershell
git clone https://github.com/iampriyadarshini/VerifyHire.git
Set-Location VerifyHire
```

If the repository is already present on your computer, open the existing project directory instead.

### 2. Set up the backend

Run these commands individually from the repository root:

```powershell
python -m venv backend\.venv
```

Activate the virtual environment:

```powershell
.\backend\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
python -m pip install -r backend\requirements.txt
```

Create the backend environment file if it does not already exist:

```powershell
Copy-Item backend\.env.example backend\.env
```

Configure the database and other environment variables in `backend/.env`. Never commit this file or expose its credentials.

### 3. Configure the database

For PostgreSQL, configure `DATABASE_URL` in `backend/.env` using your actual database credentials:

```dotenv
DATABASE_URL=postgresql+psycopg://verifyhire_user:your_password@localhost:5432/verifyhire
```

Replace the example values with your configured PostgreSQL username, password, and database name.

If using the project's SQLite fallback, follow the database configuration implemented in the repository.

Run migrations from the repository root:

```powershell
alembic upgrade head
```

To create a migration after changing ORM models:

```powershell
alembic revision --autogenerate -m "describe schema change"
```

### 4. Start the backend server

From the repository root:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

API documentation:

http://127.0.0.1:8000/docs

Keep the backend terminal running.

### 5. Set up and start the frontend

Open another terminal in the directory containing the frontend `package.json`.

Install dependencies:

```powershell
npm install
```

Create the frontend environment file if needed:

```powershell
Copy-Item .env.example .env
```

Configure the backend API URL in the frontend `.env`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```powershell
npm run dev
```

Open the local URL displayed in the terminal, usually:

http://localhost:5173

If your frontend is located in a separate `frontend/` directory, execute the frontend commands there and use its own `.env.example`.

## Evidence Analysis

### Image Analysis

Supported image formats:

- PNG
- JPG
- JPEG

Pillow validates image signatures and dimensions. Tesseract OCR extracts readable text, while OpenCV detects QR codes. Extracted evidence can be used by the verification engine to identify relevant warning signs.

If OCR is unavailable or the image contains unreadable text, the system reports that limitation instead of inventing a transcription.

### Email Analysis

The application accepts `.eml` files for email analysis.

It can inspect available email headers and report SPF, DKIM, and DMARC information when present in supplied `Authentication-Results` headers.

These headers may be forged, so passing results do not prove that an offer is authentic.

### Evidence Endpoints

- `POST /api/v1/offers/{offer_id}/attachments` — processes a supported image upload.
- `POST /api/v1/email-checks` — processes an `.eml` upload with optional company information.

Uploads are limited to 5 MB, processed temporarily in memory, and discarded. Original uploaded files are not persisted.

The application does not automatically open links found in uploaded screenshots, QR codes, or email content.

## Machine Learning

The optional machine learning component uses:

- **TF-IDF:** Converts text into numerical features.
- **Logistic Regression:** Classifies offer text using a trained model.
- **joblib:** Saves and loads the model artifact.
- **scikit-learn evaluation metrics:** Measures classification performance.

The model is not trained automatically on user submissions. If a trained model is unavailable, the system continues with rule-based analysis and available evidence.

The development dataset is located at:

```text
backend/ml/data/synthetic_offers.csv
```

This dataset contains synthetic examples intended for development and pipeline testing. It is not a real-world benchmark and cannot support production accuracy claims.

To train the model, open a terminal in the `backend/` directory and run:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

```powershell
.\.venv\Scripts\python.exe -m ml.train
```

To evaluate it:

```powershell
.\.venv\Scripts\python.exe -m ml.evaluate
```

The default model artifact path is:

```text
backend/models/fake_offer_classifier.joblib
```

Evaluation includes precision, recall, F1 score, confusion matrix, and false-positive rate.

Reliable real-world evaluation requires representative, appropriately licensed data and an independent held-out test set. The model score is uncalibrated and must not be interpreted as a verified fraud probability. ML findings are supporting indicators, not proof.

## Testing

Run backend tests from the repository root:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pytest tests
```

Build the frontend from its package directory:

```powershell
npm run build
```

Test the main workflows before release, including offer submission, report retrieval, image uploads, email analysis, database persistence, and error handling. Document test results only after actually running the tests.

## Configuration

The backend environment example documents settings such as:

- `ALLOWED_ORIGINS` — permitted frontend origins for CORS.
- `DATABASE_URL` — SQLAlchemy database connection URL.
- `VERIFIED_COMPANY_DOMAINS` — locally maintained company-domain reference data.
- `RECRUITMENT_PLATFORM_DOMAINS` — domains that may belong to third-party recruitment platforms.
- `ML_MODEL_PATH` — optional trained model location, if supported by the application configuration.

Use the exact variable names and defaults defined in the repository.

## Security and Privacy

- Submitted URLs are parsed passively; the application does not open or fetch them.
- The application does not follow redirects, resolve submitted hostnames, access private networks, or query external reputation services in the described implementation.
- Uploaded files are processed temporarily and original files are discarded.
- Email authentication results are supporting evidence, not definitive proof.
- Database credentials and other secrets belong in backend environment variables and must never be committed to GitHub.
- CORS should be restricted to the required frontend origins in deployment.
- Missing information is treated as uncertainty rather than proof of fraud.
- Community reports, if enabled, should be treated as allegations until appropriately reviewed.

## Deployment

A possible production deployment setup is:

- **Frontend:** Vercel.
- **Backend:** Render.
- **Database:** Managed PostgreSQL.

Before deployment:

1. Configure the production database and run migrations.
2. Set the production `DATABASE_URL`.
3. Configure `ALLOWED_ORIGINS` for the deployed frontend.
4. Set `VITE_API_BASE_URL` to the deployed backend API URL.
5. Configure Tesseract and other required backend dependencies.
6. Configure the trained model artifact if ML analysis is required.
7. Test the deployed API and frontend workflows.
8. Confirm that credentials and uploaded files are not exposed.

Add the actual deployment URLs once the application has been deployed and verified.

## Limitations

- Results depend on the information and evidence submitted.
- Legitimate companies can be impersonated.
- Genuine recruiters may use third-party recruitment platforms.
- Missing evidence does not establish fraud.
- Synthetic training data is not sufficient for real-world accuracy claims.
- The application provides preliminary guidance and cannot guarantee offer authenticity.

## Future Enhancements

Possible improvements include:

- Evaluation with representative, appropriately licensed real-world datasets.
- Improved context-aware message analysis.
- Trusted company-domain reference integrations.
- Moderated community reporting and audit trails.
- Additional security, accessibility, and usability testing.

These are potential enhancements, not claims of existing functionality.

## License

Add a license file if you intend to distribute the project publicly. Specify an open-source license only after selecting and including it.

---

**VerifyHire — Helping job seekers make safer, evidence-informed decisions.**
