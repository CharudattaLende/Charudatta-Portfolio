# VerbiTech Portfolio AI Assistant — FastAPI Backend

An isolated, production-ready backend service for Charudatta Lende's portfolio ([charudattaportfolio.vercel.app](https://charudattaportfolio.vercel.app/)).

---

## Architecture: Three Decoupled Components

The system is deliberately decoupled into three independent components that do NOT need to be deployed together:

```
┌────────────────────────────────┐     ┌────────────────────────────────┐     ┌────────────────────────────────┐
│   1. Portfolio Web Frontend    │     │  2. Portfolio Assistant Backend│     │  3. VerbiTech Inference Service│
│   (Hosted on Vercel)           │────▶│  (FastAPI - this repo/service) │────▶│  (External Colab/RunPod/Modal) │
│                                │◀────│                                │◀────│                                │
│ • Vanilla HTML/CSS/JS          │     │ • Fact Ingestion & TTL Cache   │     │ • Step 2000 Checkpoint         │
│ • 240-frame Canvas Animation   │     │ • Predefined Action Allowlist  │     │ • Tokenizer in Drive           │
│ • Lenis Smooth Scrolling       │     │ • Response Schema Formatting   │     │ • Decoder Transformer Model    │
│ • Floating Chat Widget         │     │ • Safe Fallback when Model Off │     │ • FastAPI Inference API        │
└────────────────────────────────┘     └────────────────────────────────┘     └────────────────────────────────┘
```

1. **Portfolio Web Frontend (Vercel)**:
   - Hosts static vanilla HTML/CSS/JS, canvas animations, and PWA assets.
   - Communicates with Component 2 via JSON POST (`/api/chat`).
   - Contains **no private API keys or model weights**.
2. **Portfolio Assistant Backend (This Service)**:
   - Manages Single Source of Truth (SSOT) fact retrieval with 5-minute TTL caching from `portfolio-data.json`.
   - Resolves structured project cards and enforces strict allowlisted navigation actions (`#projects`, `#credentials`, `#contact`, etc.).
   - Transparently routes queries to Component 3 if configured, or serves grounded portfolio facts with `model_status="pending"` if the model service is not yet connected.
3. **VerbiTech Model Inference Service (External)**:
   - Hosts the custom decoder-only Transformer checkpoint (Step 2000) and tokenizer in its native Colab or cloud environment.
   - Communicates with Component 2 via HTTP POST.

---

## Deployment Contract & Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VERBITECH_API_URL` | `""` | URL of the external VerbiTech model inference service (e.g. ngrok tunnel from Colab, Modal endpoint, or RunPod). |
| `PORTFOLIO_DATA_URL` | `https://charudattaportfolio.vercel.app/portfolio-data.json` | Remote canonical facts source URL. |
| `LOCAL_DATA_PATH` | `../portfolio-data.json` | Local canonical fact file path for local development. |
| `CACHE_TTL_SECONDS` | `300` | In-memory fact cache duration (seconds). |
| `ALLOWED_ORIGINS` | `https://charudattaportfolio.vercel.app,http://localhost:3000` | CORS allowed origins (comma-separated). |

---

## Model Status Behavior

- **When `VERBITECH_API_URL` is configured and active**:
  - Backend forwards the grounded prompt to the endpoint.
  - Returns `model_status: "connected"` and `generation_source: "verbitech_model"`.
- **When `VERBITECH_API_URL` is empty or unreachable**:
  - Backend does **NOT** simulate model inference or invent fake weights.
  - Returns `model_status: "pending"` and `generation_source: "grounded_knowledge_fallback"`.
  - Chat responses are deterministically generated from verified `portfolio-data.json` facts.

---

## Local Development & Testing

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run automated tests (17 tests covering fact retrieval, action allowlisting, empty resume handling, and API contracts):
   ```bash
   pytest tests/ -v
   ```

3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Inspect Swagger documentation:
   - API Docs: `http://localhost:8000/docs`
   - Health Status: `http://localhost:8000/api/health`

---

## How to Connect Your Real Colab Model to This Backend

The backend expects the exact VerbiTech Colab inference contract:
- **Endpoint**: `POST /generate`
- **Request**: `{"prompt": "...", "max_tokens": 100}`
- **Response**: `{"text": "...", "tokens_generated": ..., "latency_ms": ..., "tokens_per_sec": ..., "finish_reason": "..."}`

### Step-by-Step Connection Instructions:

1. In your Colab notebook, expose the running FastAPI inference server (e.g. using `ngrok` or `localtunnel`):
   ```python
   from pyngrok import ngrok
   tunnel = ngrok.connect(8000)
   print(f"VerbiTech Colab Endpoint: {tunnel.public_url}/generate")
   ```

2. Set the environment variable on the assistant backend:
   ```bash
   # Both base URL and full /generate URL are supported:
   VERBITECH_API_URL=https://your-colab-tunnel.ngrok-free.app
   # Or:
   VERBITECH_API_URL=https://your-colab-tunnel.ngrok-free.app/generate
   ```

3. `model_status` behavior:
   - Before inference or if Colab is offline, `model_status` reports `"pending"` and serves grounded portfolio facts.
   - Upon the first successful call to `/generate` returning 200 with generated text, `model_status` transitions to `"connected"`.
   - The health endpoint (`GET /api/health`) will report:
     ```json
     {
       "status": "ok",
       "facts_loaded": true,
       "projects_count": 3,
       "model_status": "connected",
       "model_endpoint_configured": true,
       "model_checkpoint_info": "Step 2000 (External Colab/Drive)"
     }
     ```
