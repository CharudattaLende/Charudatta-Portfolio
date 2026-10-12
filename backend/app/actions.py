"""
Action Resolver and Security Guardrails for VerbiTech Portfolio Assistant.
Enforces allowlisted navigation targets, verified external URLs, and deterministic
handling of project cards, social links, and unconfigured resume links.
"""

from typing import List, Optional, Tuple, Set
from .schemas import Action, ProjectCard
from .facts import FactService, fact_service

SAFE_NAV_TARGETS: Set[str] = {
    "#hero",
    "#about",
    "#projects",
    "#journey",
    "#credentials",
    "#contact"
}


def get_verified_urls(service: FactService = fact_service) -> Set[str]:
    """Collects all verified external URLs from canonical facts."""
    urls = set()
    socials = service.get_socials()
    for key, val in socials.items():
        if val:
            if key == "email":
                urls.add(f"mailto:{val}")
            else:
                urls.add(val)
    
    resume = service.get_resume_url()
    if resume:
        urls.add(resume)
        
    for p in service.get_all_projects():
        if p.get("link"):
            urls.add(p["link"])
        if p.get("github"):
            urls.add(p["github"])
            
    return urls


def is_safe_action(action: Action, verified_urls: Set[str]) -> bool:
    """Validates that an action target is strictly allowlisted and verified."""
    if action.type == "navigate":
        return action.target in SAFE_NAV_TARGETS
    elif action.type in ("link", "contact"):
        if action.target.startswith("mailto:"):
            return True
        return action.target in verified_urls
    return False


def filter_safe_actions(actions: List[Action], service: FactService = fact_service) -> List[Action]:
    """Filters actions against the safety allowlist."""
    verified = get_verified_urls(service)
    return [a for a in actions if is_safe_action(a, verified)]


def resolve_intents_and_actions(
    query: str,
    service: FactService = fact_service
) -> Tuple[Optional[str], List[Action], List[ProjectCard], List[str]]:
    """
    Deterministically resolves intents for standard portfolio requests:
    - show projects / projects grid
    - tell me about VerbiTech
    - contact Charudatta
    - open LinkedIn
    - open GitHub
    - show resume
    - specific project inquiries (ShopSphere, Chat App, etc.)
    
    Returns: (deterministic_override_reply, actions, project_cards, quick_replies)
    """
    q = query.strip().lower()
    actions: List[Action] = []
    cards: List[ProjectCard] = []
    quick_replies: List[str] = []
    socials = service.get_socials()

    # 1. Resume Request Handling
    if any(k in q for k in ["resume", "cv", "curriculum vitae", "show resume", "download resume"]):
        resume_url = service.get_resume_url()
        if resume_url:
            reply = "Here is Charudatta's verified resume. You can open or download it below."
            actions.append(Action(type="link", target=resume_url, label="Open Resume"))
        else:
            # Deterministic response when resume link is not yet provided
            reply = (
                "Charudatta's resume is currently being updated and will be available soon. "
                "In the meantime, you can review his verified credentials, education, projects, "
                "or contact him directly."
            )
            actions.append(Action(type="navigate", target="#credentials", label="View Credentials"))
            if socials.get("email"):
                actions.append(Action(type="contact", target=f"mailto:{socials['email']}", label="Email Charudatta"))
        
        quick_replies = ["Show projects", "View credentials", "Contact Charudatta"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 2. LinkedIn Request
    if "linkedin" in q:
        linkedin_url = socials.get("linkedin")
        if linkedin_url:
            reply = f"You can connect with Charudatta on LinkedIn at: {linkedin_url}"
            actions.append(Action(type="link", target=linkedin_url, label="Open LinkedIn Profile"))
            quick_replies = ["Show projects", "Contact Charudatta", "GitHub profile"]
            return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 3. GitHub Request
    if "github" in q or "code" in q and len(q) < 15:
        github_url = socials.get("github")
        if github_url:
            reply = f"Explore Charudatta's open-source repositories and code on GitHub: {github_url}"
            actions.append(Action(type="link", target=github_url, label="Open GitHub Profile"))
            actions.append(Action(type="navigate", target="#projects", label="View Portfolio Projects"))
            quick_replies = ["Show projects", "Tell me about VerbiTech", "Contact Charudatta"]
            return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 4. Contact Request
    if any(k in q for k in ["contact", "email", "get in touch", "reach out", "hire", "collaborate"]):
        email = socials.get("email", "")
        reply = (
            f"You can reach out to Charudatta via email at {email} or connect through "
            "LinkedIn and GitHub. He is currently open to collaborations, projects, and hackathons."
        )
        if email:
            actions.append(Action(type="contact", target=f"mailto:{email}", label="Send Email"))
        if socials.get("linkedin"):
            actions.append(Action(type="link", target=socials["linkedin"], label="LinkedIn"))
        actions.append(Action(type="navigate", target="#contact", label="Go to Contact Section"))
        quick_replies = ["Show projects", "Tell me about VerbiTech", "View credentials"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 5. VerbiTech inquiry
    if "verbitech" in q:
        reply = (
            "VerbiTech is Charudatta's custom decoder-only Transformer language model. "
            "It is designed to serve as an intelligent, factual portfolio assistant that understands "
            "Charudatta's verified projects, technical stack, credentials, and background, "
            "delivering safe structured actions and grounded responses."
        )
        actions.append(Action(type="navigate", target="#projects", label="Explore Projects"))
        if socials.get("github"):
            actions.append(Action(type="link", target=socials["github"], label="GitHub"))
        quick_replies = ["Show projects", "Tell me about ShopSphere", "Tell me about Chat App"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 6. Show all projects
    if any(k in q for k in ["show projects", "list projects", "what projects", "view projects", "all projects"]) or q == "projects":
        reply = "Here are Charudatta's key projects, including active deployments and platforms in development:"
        actions.append(Action(type="navigate", target="#projects", label="Scroll to Projects"))
        for p in service.get_all_projects():
            card = ProjectCard(
                id=p["id"],
                title=p["title"],
                tag=p.get("tag"),
                status=p["status"],
                description=p["description"],
                tags=p.get("tags", []),
                github=p.get("github") or None,
                link=p.get("link") or None
            )
            cards.append(card)
        quick_replies = ["Tell me about ShopSphere", "Tell me about Chat App", "Contact Charudatta"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 7. Specific Project Inquiries (ShopSphere, Chat App, etc.)
    matched_projects = service.find_projects(q)
    if matched_projects:
        p = matched_projects[0]
        reply = (
            f"**{p['title']}** ({p['status']}): {p['description']}\n\n"
            f"**Technologies**: {', '.join(p.get('tags', []))}"
        )
        if p.get("link"):
            actions.append(Action(type="link", target=p["link"], label="Launch Live Demo"))
        if p.get("github"):
            actions.append(Action(type="link", target=p["github"], label="View GitHub Repo"))
        actions.append(Action(type="navigate", target="#projects", label="View in Portfolio"))
        
        cards.append(ProjectCard(
            id=p["id"],
            title=p["title"],
            tag=p.get("tag"),
            status=p["status"],
            description=p["description"],
            tags=p.get("tags", []),
            github=p.get("github") or None,
            link=p.get("link") or None
        ))
        quick_replies = ["Show all projects", "Tell me about VerbiTech", "Contact Charudatta"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 8. Education / Credentials inquiries
    if any(k in q for k in ["education", "degree", "college", "ycce", "credentials", "certifications"]):
        about = service.get_facts().get("about", {})
        edu = about.get("education", {})
        reply = (
            f"Charudatta is pursuing a {edu.get('degree', 'B.Tech CSE (IoT)')} at "
            f"{edu.get('institution', 'YCCE')} ({edu.get('duration', '2024 — 2028')}). "
            "He holds certifications in Programming in Java (NPTEL / IIT Kharagpur) and "
            "Data Analytics (Deloitte Australia)."
        )
        actions.append(Action(type="navigate", target="#credentials", label="View Credentials Section"))
        actions.append(Action(type="navigate", target="#journey", label="View Journey"))
        quick_replies = ["Show projects", "Contact Charudatta", "Where is your resume?"]
        return reply, filter_safe_actions(actions, service), cards, quick_replies

    # 9. Default / Open question: No deterministic override; let grounded inference or fallback handle it
    quick_replies = ["Show projects", "Tell me about VerbiTech", "Contact Charudatta"]
    return None, [], cards, quick_replies
