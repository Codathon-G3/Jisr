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

- `POST /api/check-risk`
- `POST /api/generate-drafts`
- `POST /api/faithfulness`

The model timeout is 10 seconds. The interface should wait about 15 seconds.

## Deploy

Build this service from the `backend` directory on Render.

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: `GEMINI_API_KEY` on the host, `GEMINI_MODEL=gemini-flash-lite-latest`, and `CORS_ORIGINS=*`

`CORS_ORIGINS=*` lets any browser origin call the API. A native phone app does not use this check. The API key stays out of the repository.

The public base URL will be written here after the service is live.

## Tests

From the `backend` directory:

```powershell
pytest
```
