"""
Comprehensive end-to-end verification script for Charudatta Portfolio & VerbiTech Assistant.
"""

import httpx
import json
import sys


def run_tests():
    print("=== 1. VERIFYING FRONTEND ASSETS ON PORT 3000 ===")
    with httpx.Client(base_url="http://localhost:3000") as client:
        r = client.get("/index.html")
        assert r.status_code == 200, "index.html failed"
        assert "chat-widget.css" in r.text, "chat-widget.css missing in index.html"
        assert "chat-widget.js" in r.text, "chat-widget.js missing in index.html"
        print("[OK] index.html loads and includes chat widget styles & scripts")

        r = client.get("/portfolio-data.json")
        assert r.status_code == 200, "portfolio-data.json failed"
        data = r.json()
        assert data["profile"]["name"] == "Charudatta Lende"
        assert data["profile"]["resumeUrl"] == "", "resumeUrl must be empty"
        print("[OK] portfolio-data.json served with status 200 and resumeUrl == \"\"")

        r = client.get("/portfolio-data.js")
        assert r.status_code == 200, "portfolio-data.js failed"
        assert "portfolioDataLoaded" in r.text
        print("[OK] portfolio-data.js sync script served")

        r = client.get("/chat-widget.css")
        assert r.status_code == 200, "chat-widget.css failed"
        assert ".verbitech-launcher" in r.text
        assert "max-width: 768px" in r.text
        print("[OK] chat-widget.css served with mobile bottom bar clearance styles")

        r = client.get("/chat-widget.js")
        assert r.status_code == 200, "chat-widget.js failed"
        assert "SAFE_NAV_TARGETS" in r.text
        print("[OK] chat-widget.js served with allowlisted safety targets")

        r = client.get("/sw.js")
        assert r.status_code == 200, "sw.js failed"
        assert "charudatta-portfolio-v1.1" in r.text
        assert "/chat-widget.js" in r.text
        assert "/portfolio-data.json" in r.text
        print("[OK] sw.js updated with cache v1.1 and precaching all new assets")

    print("\n=== 2. VERIFYING BACKEND API ON PORT 8000 ===")
    with httpx.Client(base_url="http://127.0.0.1:8000") as client:
        r = client.get("/api/health")
        assert r.status_code == 200
        health = r.json()
        assert health["status"] == "ok"
        assert health["facts_loaded"] is True
        print(f"[OK] Backend health OK (Projects count: {health['projects_count']})")

        queries = [
            ("show projects", ["key projects"], "#projects", ["Chat App", "ShopSphere"]),
            ("tell me about VerbiTech", ["custom decoder-only Transformer"], "#projects", []),
            ("contact Charudatta", ["charudatta.lende.dev@gmail.com"], "#contact", []),
            ("open LinkedIn", ["linkedin.com"], None, []),
            ("open GitHub", ["github.com/CharudattaLende"], None, []),
            ("show resume", ["currently being updated"], "#credentials", []),
            ("tell me about ShopSphere", ["ShopSphere", "MERN Stack"], "#projects", ["ShopSphere"]),
            ("What is your secret recipe?", ["do not have verified information"], None, [])
        ]

        for q, expected_substrings, expected_action_target, expected_card_titles in queries:
            r = client.post("/api/chat", json={"message": q})
            assert r.status_code == 200, f"Query '{q}' failed"
            resp = r.json()
            for sub in expected_substrings:
                assert sub.lower() in resp["reply"].lower(), f"Expected '{sub}' in reply for '{q}'"
            if expected_action_target:
                targets = [a["target"] for a in resp["actions"]]
                assert expected_action_target in targets, f"Expected target '{expected_action_target}' in actions for '{q}'"
            if expected_card_titles:
                card_titles = [c["title"] for c in resp["project_cards"]]
                for ct in expected_card_titles:
                    assert ct in card_titles, f"Expected card title '{ct}' in project_cards for '{q}'"
            
            # Verify action target security
            for act in resp["actions"]:
                if act["type"] == "navigate":
                    assert act["target"].startswith("#"), f"Invalid navigate target: {act['target']}"
                elif act["type"] == "link":
                    assert act["target"].startswith("http"), f"Invalid link target: {act['target']}"
                elif act["type"] == "contact":
                    assert act["target"].startswith("mailto:"), f"Invalid contact target: {act['target']}"
            
            # Verify model_status and generation_source schema presence
            assert "model_status" in resp, f"model_status missing in response for '{q}'"
            assert "generation_source" in resp, f"generation_source missing in response for '{q}'"

            print(f"[OK] Query '{q}' -> Success (Actions: {len(resp['actions'])}, Cards: {len(resp['project_cards'])}, Source: {resp['generation_source']})")

    print("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"Verification Error: {e}")
        sys.exit(1)
