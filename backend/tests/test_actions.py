"""
Tests for action safety, allowlisting, intent resolution, and empty resumeUrl handling.
"""

from backend.app.schemas import Action
from backend.app.facts import FactService
from backend.app.actions import (
    filter_safe_actions,
    resolve_intents_and_actions,
    SAFE_NAV_TARGETS
)


def test_action_allowlist_filtering():
    """Ensures unauthorized or arbitrary navigation targets and links are strictly blocked."""
    actions = [
        Action(type="navigate", target="#projects", label="Valid Section"),
        Action(type="navigate", target="#arbitrary-hack", label="Invalid Section"),
        Action(type="navigate", target="javascript:alert(1)", label="XSS Attempt"),
        Action(type="link", target="https://github.com/CharudattaLende", label="Valid GitHub"),
        Action(type="link", target="https://malicious-site.com", label="Untrusted Link"),
        Action(type="contact", target="mailto:charudatta.lende.dev@gmail.com", label="Valid Email")
    ]

    safe = filter_safe_actions(actions)
    safe_targets = [a.target for a in safe]

    assert "#projects" in safe_targets
    assert "https://github.com/CharudattaLende" in safe_targets
    assert "mailto:charudatta.lende.dev@gmail.com" in safe_targets

    # Dangerous or unallowlisted targets must be stripped
    assert "#arbitrary-hack" not in safe_targets
    assert "javascript:alert(1)" not in safe_targets
    assert "https://malicious-site.com" not in safe_targets


def test_empty_resume_handling():
    """
    Verifies that when resumeUrl is empty, requesting 'show resume'
    returns a deterministic message stating it is being updated,
    and DOES NOT create a fictional URL.
    """
    reply, actions, cards, quick_replies = resolve_intents_and_actions("show resume")
    assert reply is not None
    assert "currently being updated" in reply.lower()
    
    # Check that no action has a fake URL
    for a in actions:
        if a.type == "link":
            assert False, f"Unexpected link action found for empty resume: {a.target}"
    
    # Must offer safe navigation to credentials
    targets = [a.target for a in actions]
    assert "#credentials" in targets


def test_contact_intent():
    """Tests 'contact Charudatta' intent returns mailto and LinkedIn actions."""
    reply, actions, cards, quick_replies = resolve_intents_and_actions("contact Charudatta")
    assert reply is not None
    assert "charudatta.lende.dev@gmail.com" in reply
    targets = [a.target for a in actions]
    assert "mailto:charudatta.lende.dev@gmail.com" in targets
    assert "#contact" in targets


def test_linkedin_and_github_intents():
    """Tests 'open LinkedIn' and 'open GitHub' return verified URLs."""
    reply_li, actions_li, _, _ = resolve_intents_and_actions("open LinkedIn")
    assert "https://www.linkedin.com/in/charudatta-lende-812009326" in [a.target for a in actions_li]

    reply_gh, actions_gh, _, _ = resolve_intents_and_actions("open GitHub")
    assert "https://github.com/CharudattaLende" in [a.target for a in actions_gh]


def test_verbitech_inquiry():
    """Tests 'tell me about VerbiTech' intent."""
    reply, actions, cards, quick_replies = resolve_intents_and_actions("tell me about VerbiTech")
    assert reply is not None
    assert "custom decoder-only Transformer" in reply
