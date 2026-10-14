"""
VerbiTech Model Integration and Inference Client.

Connects to the Colab/cloud inference API:
- Endpoint: POST /generate
- Request JSON: {"prompt": "...", "max_tokens": 100}
- Response JSON: {"text": "...", "tokens_generated": ..., "latency_ms": ..., "tokens_per_sec": ..., "finish_reason": "..."}

Model Status Contract:
- model_status starts as "pending".
- Becomes "connected" ONLY after a real successful call to POST /generate returns HTTP 200 with generated text.
- Reverts to "pending" if an inference call fails or if VERBITECH_API_URL is unconfigured.
"""

import logging
from typing import Optional, Tuple
import httpx

from .config import VERBITECH_API_URL, VERBITECH_MAX_TOKENS
from .facts import FactService, fact_service

logger = logging.getLogger(__name__)


class VerbiTechInferenceClient:
    def __init__(self, service: FactService = fact_service):
        self.service = service
        self.endpoint_url = VERBITECH_API_URL
        self.max_tokens = VERBITECH_MAX_TOKENS
        # model_status becomes 'connected' ONLY after a real successful inference call
        self._is_connected = False

    def is_endpoint_configured(self) -> bool:
        """Returns True if an external inference service URL is defined in the environment."""
        return bool(self.endpoint_url and self.endpoint_url.strip())

    def get_generate_url(self) -> str:
        """
        Normalizes target endpoint. If base URL is provided, appends '/generate'.
        Examples:
        - 'https://xxxx.ngrok-free.app' -> 'https://xxxx.ngrok-free.app/generate'
        - 'https://xxxx.ngrok-free.app/generate' -> 'https://xxxx.ngrok-free.app/generate'
        """
        if not self.is_endpoint_configured():
            return ""
        url = self.endpoint_url.strip()
        if url.endswith("/generate"):
            return url
        return url.rstrip("/") + "/generate"

    def get_model_status(self) -> str:
        """
        Returns 'connected' ONLY if a real inference call has successfully executed.
        Otherwise returns 'pending'.
        """
        return "connected" if self._is_connected else "pending"

    def generate_response(
        self,
        query: str,
        conversation_history: Optional[list] = None
    ) -> Tuple[str, str, str]:
        """
        Executes query inference against the Colab /generate API contract.
        Returns a tuple: (reply_text, model_status, generation_source)
        
        generation_source:
        - 'verbitech_model': Real text generation from VerbiTech Step 2000 checkpoint
        - 'grounded_knowledge_fallback': Deterministic response derived from portfolio facts
        """
        grounded_context = self.service.build_grounded_context(query)
        target_url = self.get_generate_url()

        # 1. Attempt call to Colab VerbiTech /generate inference endpoint
        if target_url:
            # Ensure prompt fits comfortably within VerbiTech's 256-token context window
            compact_context = grounded_context.strip().replace("\n\n", " ")
            if len(compact_context) > 350:
                compact_context = compact_context[:350].rsplit(" ", 1)[0] + "..."

            prompt = (
                f"Context: {compact_context}\n\n"
                f"Question: {query}\n"
                f"Answer:"
            )
            payload = {
                "prompt": prompt,
                "max_tokens": self.max_tokens
            }

            try:
                headers = {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                    "User-Agent": "VerbiTech-Assistant-Backend/1.0"
                }
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(target_url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        generated_text = data.get("text")
                        if generated_text is not None and str(generated_text).strip():
                            # Successfully verified real inference output!
                            self._is_connected = True
                            clean_text = str(generated_text).strip()
                            # Clean prompt prefix if decoder echo is returned
                            if clean_text.startswith(prompt):
                                clean_text = clean_text[len(prompt):].strip()
                            elif "Answer:" in clean_text:
                                clean_text = clean_text.split("Answer:")[-1].strip()

                            logger.info(
                                "Successfully generated inference via VerbiTech (tokens: %s, latency: %sms)",
                                data.get("tokens_generated"),
                                data.get("latency_ms")
                            )
                            return clean_text, "connected", "verbitech_model"
                    
                    logger.warning("VerbiTech /generate returned HTTP %s: %s", resp.status_code, resp.text[:200])
                    self._is_connected = False
            except Exception as e:
                logger.warning("Inference call to %s failed: %s", target_url, e)
                self._is_connected = False

        # 2. Grounded Portfolio Knowledge Fallback
        fallback_reply = self._generate_grounded_reply(query)
        return fallback_reply, "pending", "grounded_knowledge_fallback"

    def _generate_grounded_reply(self, query: str) -> str:
        """
        Deterministic factual response derived strictly from canonical portfolio-data.json facts.
        Used when the external model service is not yet connected or during outages.
        """
        q = query.lower().strip()
        facts = self.service.get_facts()
        profile = facts.get("profile", {})
        about = facts.get("about", {})
        skills_groups = facts.get("techStackArea", {}).get("groups", [])
        journey = facts.get("journey", [])

        # Technical Stack & Skills
        if any(w in q for w in ["skill", "stack", "technolog", "mern", "react", "node", "database", "python", "java"]):
            build_items = []
            for g in skills_groups:
                build_items.append(f"{g.get('name')}: {', '.join(g.get('items', []))}")
            return (
                f"Charudatta specializes in the **MERN stack** and modern web software engineering:\n\n"
                + "\n".join([f"• **{g}**" for g in build_items]) +
                "\n\nHe is also expanding into **Data Engineering** pipelines, distributed databases, and AI systems."
            )

        # Biography & Identity
        if any(w in q for w in ["who is", "about charudatta", "tell me about yourself", "bio", "background"]):
            bio1 = about.get("bioParagraph1", profile.get("heroDescription", ""))
            return (
                f"{bio1}\n\n"
                f"He is located at **{profile.get('location', 'YCCE, Nagpur, India')}** and is currently pursuing "
                f"his **{about.get('education', {}).get('degree', 'B.Tech CSE (IoT)')}** (2024 — 2028)."
            )

        # Practical Experience & Coding Club
        if any(w in q for w in ["experience", "journey", "club", "codeware", "hackathon", "role"]):
            if journey:
                j_lines = [f"• **{j.get('role')}** at {j.get('organization')} ({j.get('period')}): {j.get('description')}" for j in journey]
                return "Here is Charudatta's verified developer experience:\n\n" + "\n".join(j_lines)

        # Unverified or Unknown Question
        return (
            "I do not have verified information on that specific topic in Charudatta's portfolio. "
            "You can ask me about his verified projects (such as **Chat App** or **ShopSphere**), "
            "technical skills in MERN and Data Engineering, academic education at YCCE, "
            "or how to get in touch with him."
        )


# Global inference client instance
inference_engine = VerbiTechInferenceClient()
