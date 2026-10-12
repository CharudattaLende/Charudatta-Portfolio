"""
Integration tests for FastAPI endpoints: /api/health, /api/facts, and /api/chat.
Verifies response schemas, action safety, and transparent model_status reporting.
"""

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.model import inference_engine

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["facts_loaded"] is True
    assert data["projects_count"] >= 2
    assert "model_status" in data
    assert "model_checkpoint_info" in data


def test_facts_endpoint():
    response = client.get("/api/facts")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert data["profile"]["name"] == "Charudatta Lende"
    assert data["profile"]["resumeUrl"] == ""


def test_chat_show_projects():
    response = client.post("/api/chat", json={"message": "show projects"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["project_cards"]) >= 2
    titles = [c["title"] for c in data["project_cards"]]
    assert "Chat App" in titles
    assert "ShopSphere" in titles
    assert any(a["target"] == "#projects" for a in data["actions"])
    assert data["generation_source"] == "deterministic_rule"


def test_chat_specific_project():
    response = client.post("/api/chat", json={"message": "tell me about ShopSphere"})
    assert response.status_code == 200
    data = response.json()
    assert "ShopSphere" in data["reply"]
    assert len(data["project_cards"]) == 1
    assert data["project_cards"][0]["title"] == "ShopSphere"
    assert data["generation_source"] == "deterministic_rule"


def test_chat_resume_pending():
    response = client.post("/api/chat", json={"message": "show resume"})
    assert response.status_code == 200
    data = response.json()
    assert "currently being updated" in data["reply"].lower()
    # Ensure no fabricated link action is present
    for a in data["actions"]:
        assert a["type"] != "link"
    assert data["generation_source"] == "deterministic_rule"


def test_chat_contact():
    response = client.post("/api/chat", json={"message": "contact Charudatta"})
    assert response.status_code == 200
    data = response.json()
    assert "charudatta.lende.dev@gmail.com" in data["reply"]
    assert any("mailto:charudatta.lende.dev@gmail.com" in a["target"] for a in data["actions"])


def test_chat_open_question_model_pending():
    """
    Verifies that when an open question is asked and no external model is configured,
    the API transparently reports model_status='pending' and generation_source='grounded_knowledge_fallback'.
    """
    response = client.post("/api/chat", json={"message": "What skills does Charudatta have in web engineering?"})
    assert response.status_code == 200
    data = response.json()
    assert "mern" in data["reply"].lower()
    assert data["model_status"] == "pending"
    assert data["generation_source"] == "grounded_knowledge_fallback"


def test_chat_unknown_question_safely_declines():
    """Verifies that an ungrounded or unknown question returns a polite grounded refusal."""
    response = client.post("/api/chat", json={"message": "What is Charudatta's secret cooking recipe?"})
    assert response.status_code == 200
    data = response.json()
    assert "do not have verified information" in data["reply"].lower()
    assert data["generation_source"] == "grounded_knowledge_fallback"


def test_external_model_inference_contract(monkeypatch):
    """
    Tests the client contract with an active external VerbiTech FastAPI endpoint.
    When the external service responds with generated text, the backend
    returns model_status='connected' and generation_source='verbitech_model'.
    """
    class MockResponse:
        status_code = 200
        def json(self):
            return {"reply": "Generated answer directly from VerbiTech Transformer step 2000."}

    class MockClient:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, url, json=None):
            return MockResponse()

    import httpx
    monkeypatch.setattr(httpx, "Client", MockClient)
    
    # Temporarily set endpoint URL
    original_url = inference_engine.endpoint_url
    try:
        inference_engine.endpoint_url = "https://mock-colab-verbitech.ngrok-free.app/inference"
        response = client.post("/api/chat", json={"message": "Deep architecture analysis of data pipelines"})
        assert response.status_code == 200
        data = response.json()
        assert data["model_status"] == "connected"
        assert data["generation_source"] == "verbitech_model"
        assert "Generated answer directly from VerbiTech" in data["reply"]
    finally:
        inference_engine.endpoint_url = original_url


def test_chat_empty_validation():
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code in (400, 422)
