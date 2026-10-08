# Bridge Note API

Person 2's server. Requests are not stored: there is no database, and user text is never written to disk. The log records only the path, status code, and elapsed time.

## Local run

From the `backend` directory:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://127.0.0.1:8000/health`

Put `GEMINI_API_KEY` in `.env` only. Do not commit that file.

## Routes

Send `Content-Type: application/json`.

- `POST /api/check-risk`: phrase list + Gemini classifier. Fails closed: if the model errors, it reports risk.
- `POST /api/generate-drafts`: removes identifiers, then runs the Guardian gate before any drafting. On risk it returns `riskDetected: true`, `riskMethod` and no drafts. If the risk model is unavailable, it returns the plain templates (`usedFallbackTemplate: true`) instead of drafting unchecked text.
- `POST /api/faithfulness`: aligns draft phrases with the user's words; keeps only pairs that occur in both texts.

Identifier removal (`app/services/identifier_removal.py`) must stay identical to `src/services/piiSanitizer.ts`. Both read `safety/identifiers.json` and are tested against `tests/fixtures/pii-cases.json`.

The model timeout is 10 seconds. The interface should wait about 15 seconds.

## Deploy

Build this service from the `backend` directory on Render.

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: `GEMINI_API_KEY` on the host, `GEMINI_MODEL=gemini-flash-lite-latest`, and `CORS_ORIGINS=*`

`CORS_ORIGINS=*` lets any browser origin call the API. A native phone app does not use this check. The API key stays out of the repository.

The public base URL is live at:
**`https://jisr-api.onrender.com`** (Interactive OpenAPI docs at [`https://jisr-api.onrender.com/docs`](https://jisr-api.onrender.com/docs)). The free instance sleeps when idle, so the first request can take about a minute.

## Tests

From the `backend` directory:

```powershell
pytest
```
