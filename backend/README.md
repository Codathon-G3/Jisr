# Bridge Note API

Person 2's server. Requests are not stored: there is no database, and user text is never written to disk. The log records only the path, status code, and elapsed time. Uvicorn's own access log, which would add the caller's IP address, is switched off in production (`--no-access-log`).

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

Put `GEMINI_API_KEY` in `.env` only. Do not commit that file. The server sends the key to Google in the `x-goog-api-key` header, never in the URL.

## Routes

Send `Content-Type: application/json`.

- `POST /api/check-risk`: phrase list + Gemini classifier. Fails closed: if the model errors, it reports risk.
- `POST /api/generate-drafts`: removes identifiers, then runs the Guardian gate before any drafting. On risk it returns `riskDetected: true`, `riskMethod` and no drafts. If the risk model is unavailable, it returns the plain templates (`usedFallbackTemplate: true`) instead of drafting unchecked text.
- `POST /api/faithfulness`: aligns draft phrases with the user's words; keeps only pairs that occur in both texts.

Identifier removal (`app/services/identifier_removal.py`) must stay identical to `src/services/piiSanitizer.ts`. Both read `safety/identifiers.json` and are tested against `tests/fixtures/pii-cases.json`.

The model timeout is 10 seconds per call. A draft request can make up to three model calls and the free Render instance can take about a minute to wake up, so the clients wait up to 60 seconds before using templates.

## Limits

- Text fields accept at most 4,000 characters (`MAX_TEXT_CHARS` in `app/schemas.py`); longer requests get `422` before any model call. The app and web text boxes stop at the same length.
- Model calls are capped for the whole process: `MODEL_CALLS_PER_MINUTE` (default 60) and `MODEL_CALLS_PER_DAY` (default 2000); `0` turns a window off. The cap counts calls only and keeps nothing about the caller. When it is reached the model counts as unavailable: `/api/check-risk` fails closed and `/api/generate-drafts` returns the templates. The defaults sit above the Gemini free-tier quota, so on a free key Google's own limit is reached first; on a paid key they bound the bill.
- The cap is global, not per client, so one heavy client can still use it up for everyone. A per-client limit needs the real client address, which behind the Render proxy means trusting `X-Forwarded-For`; that is left for a production deployment.

## Deploy

Build this service from the `backend` directory on Render.

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --no-access-log`
- Environment: `GEMINI_API_KEY` on the host, `GEMINI_MODEL=gemini-flash-lite-latest`, and `CORS_ORIGINS=*`; optionally `MODEL_CALLS_PER_MINUTE` and `MODEL_CALLS_PER_DAY`

`render.yaml` holds these settings, but Render applies it only to a service created from it as a Blueprint. If the service was created in the Render dashboard, set the start command there as well.

`CORS_ORIGINS=*` lets any browser origin call the API. A native phone app does not use this check. The API key stays out of the repository.

The public base URL is live at:
**`https://jisr-api.onrender.com`** (Interactive OpenAPI docs at [`https://jisr-api.onrender.com/docs`](https://jisr-api.onrender.com/docs)). The free instance sleeps when idle, so the first request can take about a minute.

## Tests

From the `backend` directory:

```powershell
pytest
```
