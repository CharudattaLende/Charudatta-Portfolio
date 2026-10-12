"""
FastAPI application for the VerbiTech Portfolio AI Assistant.
Exposes endpoints for chat inference, facts inspection, and health checking.
"""

import logging
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS
from .schemas import ChatRequest, ChatResponse, HealthResponse, Action
from .facts import fact_service
from .actions import resolve_intents_and_actions, filter_safe_actions
from .model import inference_engine

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("verbitech_backend")

app = FastAPI(
    title="VerbiTech Portfolio Assistant API",
    description="Inference and Grounded Fact Retrieval API for Charudatta Lende's Portfolio",
    version="1.0.0"
)

# Enable CORS for live portfolio and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Verifies backend operational status, fact readiness, and model connection status."""
    try:
        facts = fact_service.get_facts()
        projects = fact_service.get_all_projects()
        return HealthResponse(
            status="ok",
            version="1.0.0",
            facts_loaded=bool(facts),
            projects_count=len(projects),
            model_status=inference_engine.get_model_status(),
            model_endpoint_configured=inference_engine.is_endpoint_configured(),
            model_checkpoint_info="Step 2000 (External Colab/Drive)"
        )
    except Exception as e:
        logger.error("Health check error: %s", e)
        raise HTTPException(status_code=500, detail="Service unhealthy")


@app.get("/api/facts")
def get_portfolio_facts() -> Dict[str, Any]:
    """Returns canonical portfolio facts snapshot."""
    return fact_service.get_facts()


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Main chat endpoint. Resolves intents, queries facts, generates safe grounded responses,
    and returns verified actions and project cards.
    """
    query = request.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    logger.info("Received query: '%s'", query)

    # 1. Deterministic Intent & Action Resolution
    override_reply, actions, project_cards, quick_replies = resolve_intents_and_actions(query, fact_service)

    # 2. If deterministic intent matched, return immediately with clear source metadata
    if override_reply is not None:
        return ChatResponse(
            reply=override_reply,
            actions=actions,
            project_cards=project_cards,
            quick_replies=quick_replies,
            model_status=inference_engine.get_model_status(),
            generation_source="deterministic_rule"
        )

    # 3. Model Inference or Grounded Knowledge Fallback
    generated_reply, model_status, generation_source = inference_engine.generate_response(query, request.history)

    # 4. Check if query references projects to attach cards if any
    matched = fact_service.find_projects(query)
    for p in matched:
        if not any(c.id == p["id"] for c in project_cards):
            project_cards.append({
                "id": p["id"],
                "title": p["title"],
                "tag": p.get("tag"),
                "status": p["status"],
                "description": p["description"],
                "tags": p.get("tags", []),
                "github": p.get("github") or None,
                "link": p.get("link") or None
            })

    # 5. Ensure actions are strictly filtered through the allowlist
    safe_actions = filter_safe_actions(actions, fact_service)

    return ChatResponse(
        reply=generated_reply,
        actions=safe_actions,
        project_cards=project_cards,
        quick_replies=quick_replies or ["Show projects", "Tell me about VerbiTech", "Contact Charudatta"],
        model_status=model_status,
        generation_source=generation_source
    )
