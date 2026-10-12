"""
Tests for FactService: TTL caching, retrieval, project normalization, and grounded context.
"""

import tempfile
import json
import time
from pathlib import Path
from backend.app.facts import FactService


def test_fact_loading_and_projects():
    sample_data = {
        "profile": {
            "name": "Charudatta Lende",
            "eyebrow": "COMPUTER SCIENCE ENGINEER",
            "resumeUrl": "",
            "socials": {"email": "test@example.com", "github": "https://github.com/test"}
        },
        "featuredProject": {
            "id": "project-chat-app",
            "headline": "Chat App",
            "description": "Real-time chat",
            "tags": ["React", "Firebase"],
            "liveUrl": "https://chat-demo.com",
            "githubUrl": "https://github.com/test/chat"
        },
        "projectsGrid": [
            {
                "id": "project-shopsphere",
                "title": "ShopSphere",
                "tag": "E-Commerce",
                "status": "In Development",
                "description": "MERN shopping platform",
                "tags": ["React", "MongoDB"],
                "github": "",
                "link": ""
            }
        ]
    }

    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".json") as tmp:
        json.dump(sample_data, tmp)
        tmp_path = Path(tmp.name)

    try:
        service = FactService(local_path=tmp_path, ttl=10)
        facts = service.get_facts()
        assert facts["profile"]["name"] == "Charudatta Lende"

        projects = service.get_all_projects()
        assert len(projects) == 2
        titles = [p["title"] for p in projects]
        assert "Chat App" in titles
        assert "ShopSphere" in titles

        # Project search
        found = service.find_projects("shopsphere")
        assert len(found) == 1
        assert found[0]["title"] == "ShopSphere"

        found_by_tech = service.find_projects("Firebase")
        assert len(found_by_tech) == 1
        assert found_by_tech[0]["title"] == "Chat App"

    finally:
        tmp_path.unlink()


def test_project_updates_reflection():
    """Verifies that updating or removing projects in data reflects in assistant facts."""
    data_v1 = {
        "profile": {"name": "Charudatta Lende", "resumeUrl": ""},
        "featuredProject": None,
        "projectsGrid": [
            {"id": "p1", "title": "Project Alpha", "status": "Active", "description": "Desc A", "tags": ["Python"]}
        ]
    }

    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".json") as tmp:
        json.dump(data_v1, tmp)
        tmp_path = Path(tmp.name)

    try:
        service = FactService(local_path=tmp_path, ttl=0)  # 0 TTL for immediate refresh
        projects = service.get_all_projects()
        assert len(projects) == 1
        assert projects[0]["title"] == "Project Alpha"

        # Update data with a new project and modify existing
        data_v2 = {
            "profile": {"name": "Charudatta Lende", "resumeUrl": ""},
            "featuredProject": None,
            "projectsGrid": [
                {"id": "p1", "title": "Project Alpha V2", "status": "Completed", "description": "Updated", "tags": ["Python"]},
                {"id": "p2", "title": "Project Beta", "status": "In Development", "description": "Desc B", "tags": ["Node"]}
            ]
        }
        with open(tmp_path, "w") as f:
            json.dump(data_v2, f)

        # Force refresh or TTL check
        service.get_facts(force_refresh=True)
        updated_projects = service.get_all_projects()
        assert len(updated_projects) == 2
        titles = [p["title"] for p in updated_projects]
        assert "Project Alpha V2" in titles
        assert "Project Beta" in titles

    finally:
        tmp_path.unlink()
