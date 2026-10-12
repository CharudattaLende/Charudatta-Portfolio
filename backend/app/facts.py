"""
Portfolio Fact Service
Handles TTL caching, live updates from portfolio-data.json or remote Vercel URL,
project querying, and grounded context generation.
"""

import json
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from .config import LOCAL_DATA_PATH, PORTFOLIO_DATA_URL, CACHE_TTL_SECONDS

logger = logging.getLogger(__name__)


# Fallback facts in case network and local file are both unavailable
FALLBACK_FACTS: Dict[str, Any] = {
    "profile": {
        "name": "Charudatta Lende",
        "eyebrow": "COMPUTER SCIENCE ENGINEER",
        "positioning": "Full-Stack Developer · Data Engineering Enthusiast",
        "heroHeadline": "Building software that solves real problems.",
        "heroDescription": "I'm a CSE student building full-stack web applications with the MERN stack, while exploring data engineering and modern software systems.",
        "availability": "Open to Collaborations & Projects",
        "location": "YCCE, Nagpur, India",
        "resumeUrl": "",
        "socials": {
            "email": "charudatta.lende.dev@gmail.com",
            "github": "https://github.com/CharudattaLende",
            "linkedin": "https://www.linkedin.com/in/charudatta-lende-812009326",
            "x": "https://x.com/Charudatta59"
        }
    },
    "featuredProject": {
        "id": "project-chat-app",
        "headline": "Chat App",
        "tag": "Featured Project",
        "category": "Full-Stack / Real-Time Application",
        "description": "A real-time messaging application built with React and Firebase, enabling users to communicate through a responsive web interface.",
        "tags": ["React.js", "Firebase", "Real-Time Sync", "Responsive Web"],
        "liveUrl": "https://chat-app-topaz-theta.vercel.app/Chat",
        "githubUrl": "https://github.com/CharudattaLende/chat-app"
    },
    "projectsGrid": [
        {
            "id": "project-shopsphere",
            "title": "ShopSphere",
            "tag": "AI-Powered E-Commerce Platform",
            "status": "In Development",
            "description": "A full-stack e-commerce platform currently being developed with a focus on modern web architecture, backend APIs, authentication and data-driven features.",
            "tags": ["MERN Stack", "React", "Node.js", "Express", "MongoDB"],
            "github": "",
            "link": ""
        },
        {
            "id": "project-future-1",
            "title": "Upcoming Project",
            "tag": "Full-Stack / Systems Exploration",
            "status": "In Ideation",
            "description": "Planned application exploring scalable backend services, custom API integrations, and robust database management.",
            "tags": ["Planned: Node.js", "Express", "Databases"],
            "github": "",
            "link": ""
        }
    ],
    "about": {
        "verifiedFacts": [
            { "label": "Degree & Major", "value": "B.Tech CSE (IoT)" },
            { "label": "Institution", "value": "YCCE" },
            { "label": "Primary Stack", "value": "MERN Stack" },
            { "label": "Coding Club", "value": "Codeware Club" }
        ],
        "education": {
            "degree": "B.Tech — Computer Science & Engineering (IoT)",
            "institution": "Yeshwantrao Chavan College of Engineering (YCCE)",
            "duration": "2024 — 2028"
        }
    },
    "journey": [
        {
            "role": "Application Developer",
            "organization": "Codeware Coding Club · YCCE",
            "period": "Feb 2026 — Present",
            "description": "Contributing to application development within the college coding club, working on software projects and collaborating with other student developers.",
            "tags": ["JavaScript", "Web Development", "Git/GitHub", "Team Collaboration"]
        }
    ],
    "certifications": [
        {
            "title": "Programming in Java",
            "organization": "NPTEL / IIT Kharagpur",
            "desc": "Course and certification covering core Java, object-oriented programming, and algorithmic concepts."
        },
        {
            "title": "Data Analytics Job Simulation",
            "organization": "Deloitte Australia",
            "desc": "Practical job simulation covering data analysis, data-driven insights, and dashboard reporting."
        },
        {
            "title": "Responsive Web Design",
            "organization": "Developer Certification",
            "desc": "Foundations of responsive web layout, CSS architecture, flexbox, and modern UI standards."
        }
    ],
    "contact": {
        "socials": {
            "email": "charudatta.lende.dev@gmail.com",
            "github": "https://github.com/CharudattaLende",
            "linkedin": "https://www.linkedin.com/in/charudatta-lende-812009326",
            "x": "https://x.com/Charudatta59"
        }
    }
}


class FactService:
    def __init__(self, local_path: Optional[Path] = None, remote_url: Optional[str] = None, ttl: int = CACHE_TTL_SECONDS):
        self.local_path = local_path or LOCAL_DATA_PATH
        self.remote_url = remote_url or PORTFOLIO_DATA_URL
        self.ttl = ttl
        self._cache: Optional[Dict[str, Any]] = None
        self._cache_time: float = 0

    def get_facts(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Returns verified portfolio facts with TTL in-memory caching."""
        now = time.time()
        if not force_refresh and self._cache and (now - self._cache_time < self.ttl):
            return self._cache

        # Attempt 1: Read from local JSON file if available
        if self.local_path and self.local_path.exists():
            try:
                with open(self.local_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._cache = data
                    self._cache_time = now
                    logger.info("Loaded portfolio facts from local file: %s", self.local_path)
                    return self._cache
            except Exception as e:
                logger.warning("Failed to read local portfolio-data.json: %s", e)

        # Attempt 2: Fetch via HTTP GET from remote Vercel deployment
        if self.remote_url:
            try:
                with httpx.Client(timeout=5.0) as client:
                    resp = client.get(self.remote_url)
                    if resp.status_code == 200:
                        data = resp.json()
                        self._cache = data
                        self._cache_time = now
                        logger.info("Loaded portfolio facts from remote URL: %s", self.remote_url)
                        return self._cache
            except Exception as e:
                logger.warning("Failed to fetch remote portfolio facts from %s: %s", self.remote_url, e)

        # Attempt 3: Use fallback facts
        if not self._cache:
            logger.info("Using built-in fallback facts")
            self._cache = FALLBACK_FACTS
            self._cache_time = now

        return self._cache

    def get_profile(self) -> Dict[str, Any]:
        return self.get_facts().get("profile", {})

    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Consolidates featuredProject and projectsGrid into a clean normalized list."""
        facts = self.get_facts()
        projects: List[Dict[str, Any]] = []

        # Featured project
        featured = facts.get("featuredProject")
        if featured and isinstance(featured, dict):
            projects.append({
                "id": featured.get("id", "project-chat-app"),
                "title": featured.get("headline", "Chat App"),
                "tag": featured.get("tag", "Featured Project"),
                "status": "Live / Deployed",
                "description": featured.get("description", ""),
                "tags": featured.get("tags", []),
                "github": featured.get("githubUrl", ""),
                "link": featured.get("liveUrl", "")
            })

        # Grid projects
        for p in facts.get("projectsGrid", []):
            projects.append({
                "id": p.get("id", ""),
                "title": p.get("title", ""),
                "tag": p.get("tag", ""),
                "status": p.get("status", "Active"),
                "description": p.get("description", ""),
                "tags": p.get("tags", []),
                "github": p.get("github", ""),
                "link": p.get("link", "")
            })

        return projects

    def find_projects(self, query: str) -> List[Dict[str, Any]]:
        """Matches projects based on title, description, or technology tag."""
        q = query.lower()
        matched = []
        for p in self.get_all_projects():
            title = p.get("title", "").lower()
            desc = p.get("description", "").lower()
            tag = p.get("tag", "").lower()
            tags = [t.lower() for t in p.get("tags", [])]
            if (q in title) or (title in q) or (q in tag) or any(q in t for t in tags):
                matched.append(p)
            elif any(token in title or token in tags for token in q.split() if len(token) > 3):
                matched.append(p)
        return matched

    def get_resume_url(self) -> str:
        """Returns resume URL or empty string if not configured."""
        profile = self.get_profile()
        return profile.get("resumeUrl", "") or ""

    def get_socials(self) -> Dict[str, str]:
        profile = self.get_profile()
        return profile.get("socials", {})

    def build_grounded_context(self, query: str) -> str:
        """
        Builds a concise factual context block tailored to the query.
        Ensures the language model operates on strict verified facts.
        """
        facts = self.get_facts()
        profile = facts.get("profile", {})
        about = facts.get("about", {})
        contact = facts.get("contact", {}).get("socials", profile.get("socials", {}))
        projects = self.get_all_projects()

        lines = [
            f"Subject: {profile.get('name', 'Charudatta Lende')}",
            f"Title: {profile.get('eyebrow', 'Computer Science Engineer')} — {profile.get('positioning', 'Full-Stack Developer')}",
            f"Education: {about.get('education', {}).get('degree', 'B.Tech CSE (IoT)')} at {about.get('education', {}).get('institution', 'YCCE')} ({about.get('education', {}).get('duration', '2024-2028')})",
            f"Location: {profile.get('location', 'YCCE, Nagpur, India')}",
            f"Availability: {profile.get('availability', 'Open to Collaborations')}",
            f"Contact Email: {contact.get('email', '')}",
            f"GitHub: {contact.get('github', '')}",
            f"LinkedIn: {contact.get('linkedin', '')}",
            f"Resume URL Status: {'Available (' + profile.get('resumeUrl') + ')' if profile.get('resumeUrl') else 'Not yet available / Being updated'}",
            "",
            "Verified Projects:"
        ]

        for p in projects:
            p_line = f"- {p['title']} ({p['status']}): {p['description']} | Tags: {', '.join(p['tags'])}"
            if p.get('link'):
                p_line += f" | Demo: {p['link']}"
            if p.get('github'):
                p_line += f" | Code: {p['github']}"
            lines.append(p_line)

        # Add Journey & Milestones
        lines.append("")
        lines.append("Experience & Activities:")
        for j in facts.get("journey", []):
            lines.append(f"- {j.get('role')} at {j.get('organization')} ({j.get('period')}): {j.get('description')}")

        # Add Certifications
        lines.append("")
        lines.append("Certifications:")
        for c in facts.get("certifications", []):
            lines.append(f"- {c.get('title')} ({c.get('organization')}): {c.get('desc')}")

        return "\n".join(lines)


# Global singleton instance
fact_service = FactService()
