"""
Configuration settings for the VerbiTech FastAPI assistant backend.
Reads from environment variables with sensible defaults.

Three decoupled components:
1. Portfolio Frontend: Hosted on Vercel (https://charudattaportfolio.vercel.app/)
2. Portfolio Assistant Backend: FastAPI service (this directory) handling facts, action routing, and guardrails
3. VerbiTech Model Inference Service: Separate GPU/Colab/Modal/RunPod service running the Step 2000 checkpoint & tokenizer
"""

import os
from pathlib import Path
from typing import List

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
DEFAULT_LOCAL_DATA_FILE = REPO_ROOT / "portfolio-data.json"

# Portfolio Data Configuration
PORTFOLIO_DATA_URL: str = os.getenv(
    "PORTFOLIO_DATA_URL",
    "https://charudattaportfolio.vercel.app/portfolio-data.json"
)
LOCAL_DATA_PATH: Path = Path(os.getenv("LOCAL_DATA_PATH", str(DEFAULT_LOCAL_DATA_FILE)))
CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))  # 5 minutes

# CORS Origins (portfolio origin and local development origins)
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://charudattaportfolio.vercel.app,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
)
ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

# VerbiTech Model Inference Service Configuration (Component 3)
# Target URL where the external VerbiTech FastAPI model service is reachable (e.g. ngrok tunnel from Colab, RunPod, Modal)
VERBITECH_API_URL: str = os.getenv(
    "VERBITECH_API_URL",
    os.getenv("VERBITECH_INFERENCE_URL", "")
).strip()
