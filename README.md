---
title: scomplain2resolve
emoji: 🧭
colorFrom: purple
colorTo: yellow
sdk: docker
app_port: 7860
---

# scomplain2resolve

A calm, mobile-friendly website that helps people in Pakistan turn an everyday
complaint—in Urdu, Roman Urdu, or English—into a clear next step.

The site is a small modular monolith: a React frontend, FastAPI endpoints, and
local Python complaint services run together. It covers electricity, gas, and
NADRA. There is no live submission to government departments.

## Run locally

Install Python 3.11+ and Node.js 20+. In PowerShell, start the backend in one
terminal:

```powershell
cd "C:\path\to\Complain2Resolve"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

In a second terminal, start the React website:

```powershell
cd "C:\path\to\Complain2Resolve"
npm --prefix web install
npm --prefix web run dev
```

Open the Vite URL shown in the second terminal (usually `http://127.0.0.1:5173`).
The frontend forwards `/api` requests to the Python backend on port `8000`.

For a single production-style local server, build the website and run FastAPI:

```powershell
npm --prefix web ci
npm --prefix web run build
python app.py
```

Then open `http://127.0.0.1:8000`.

## Website journey

1. Start on the welcome page and choose a service or begin a guide.
2. Describe the issue and review the local classification, route, official links,
   and document checklist.
3. Prepare and edit an Urdu or English application.
4. Download the PDF and review the suggested follow-up ladder.
5. Optionally create a clearly labelled, in-memory demo reference. It is not an
   official complaint number, and no authority is contacted.

## Project layout

- `web/src/`: responsive React website and multi-screen flow.
- `web/package.json`: frontend dependencies and build scripts.
- `app.py`: FastAPI endpoints and production static website host.
- `services/complaint_pipeline.py`: text normalization and rule-based classification.
- `services/knowledge_base.py`: validation and retrieval of local department data.
- `services/application_generator.py` and `templates/`: editable letter generation.
- `services/pdf_generator.py`: local Unicode PDF output.
- `services/demo_tracker.py`: temporary demo reference and status history.
- `data/departments.json`: manually maintained official links, documents, and
  escalation suggestions.

## Optional AI classifier

Rule-based local classification is the default. To enable the opt-in AI fallback,
copy `.env.example` to `.env` and set `LLM_API_KEY`. Only complaint text is sent
to the configured OpenAI-compatible provider; applicant fields and generated
applications are not sent. Do not commit `.env`. For Hugging Face, set secrets in
the Space settings.

## Privacy and limitations

Do not enter CNIC, phone, account/consumer numbers, or upload identity documents.
Applicant name and address are optional and used only to prepare the current
letter. PDFs are generated locally and removed after download or when the app
restarts. Demo references remain in memory only. AI classification is optional.
The app offers guidance, not legal advice, and does not guarantee resolution.

Department links come from `data/departments.json`. Helplines and official
response deadlines are not displayed unless independently verified. Follow-up
periods are marked as suggestions, not official deadlines; confirm the responsible
utility using the provider printed on the bill.

## Checks

```powershell
py -m unittest discover -s tests -v
py -m ruff check app.py services tests
npm --prefix web run build
```

The Hugging Face Spaces `Dockerfile` builds the React app and serves the bundled
site and FastAPI API together on port `7860`.
