# Botfolio Agent Backend

Render-friendly backend for Botfolio chat, RAG context, session memory, pending tool confirmations, email, and calendar tooling.

## Agent Tools

- `calculate_date_range` converts structured date math into exact timezone-aware ISO ranges. The model interprets phrases like `after 5 days` or `next week`; the tool only does the calculation.
- `get_available_slots` reads calendar availability.
- `send_email`, `book_slot`, and `cancel_booking` create pending actions that require explicit user confirmation.

## Routes

- `GET /health`
- `POST /chat`
- `POST /actions/:actionId/confirm`
- `POST /actions/:actionId/cancel`

## Environment

- `PORT`
- `ALLOW_ORIGINS` comma-separated frontend origins, for example `https://akyyev.github.io`
- `MODEL_PROVIDER` `openai` or `huggingface`
- `OPENAI_API_KEY`
- `HF_TOKEN`
- `EMAIL_FORMS_ENDPOINT`
- `GOOGLE_SERVICE_ACCOUNT_KEY`
- `REDIS_URL`
- `KNOWLEDGE_DIR` defaults to `data`
- `MAX_REQUEST_BYTES` defaults to `32768`
- `IP_RATE_LIMIT_MAX` defaults to `25` per `IP_RATE_LIMIT_WINDOW_SECONDS`, default `60`
- `SESSION_RATE_LIMIT_MAX` defaults to `12` per `SESSION_RATE_LIMIT_WINDOW_SECONDS`, default `60`

Without `REDIS_URL`, the server uses local in-memory storage for development only.
Do not expose `REDIS_URL` to the frontend and do not commit the concrete value to git.

## Deploying on Render

Use `agent-backend` as the service root directory. The included `render.yaml` can be used as a blueprint, or the same settings can be entered manually:

- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`
- Add `REDIS_URL` for shared session and pending-action storage. Use Render's internal Redis URL when the web service and Redis are in the same Render account/region, for example `redis://<internal-host>:6379`.

After deploy, `/health` should report Redis-backed storage:

```json
{"ok":true,"modelProvider":"openai","storage":"redis"}
```

For the frontend, point `REACT_APP_API_URL` at the deployed chat endpoint, for example:

```text
https://your-render-service.onrender.com/chat
```
