"""
Pydantic schemas for VerbiTech Portfolio API requests and responses.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender ('user' or 'assistant')")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's question or message")
    session_id: Optional[str] = Field(None, description="Optional session identifier")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Conversation history")


class Action(BaseModel):
    type: str = Field(..., description="Type of action: 'navigate', 'link', or 'contact'")
    target: str = Field(..., description="Target section id (e.g. '#projects') or verified URL / mailto")
    label: str = Field(..., description="Human-readable button label")


class ProjectCard(BaseModel):
    id: str = Field(..., description="Unique project identifier")
    title: str = Field(..., description="Project name")
    tag: Optional[str] = Field(None, description="Category or short headline tag")
    status: str = Field(..., description="Project status (e.g. 'Completed', 'In Development', 'In Ideation')")
    description: str = Field(..., description="Concise description of the project")
    tags: List[str] = Field(default_factory=list, description="Key technologies used")
    github: Optional[str] = Field(None, description="Verified GitHub repository link, if available")
    link: Optional[str] = Field(None, description="Verified live demo URL, if available")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Grounded, conversational response")
    actions: List[Action] = Field(default_factory=list, description="List of allowlisted navigation or action links")
    project_cards: List[ProjectCard] = Field(default_factory=list, description="Structured project cards relevant to query")
    quick_replies: List[str] = Field(default_factory=list, description="Suggested next questions or actions")
    model_status: str = Field("pending", description="Status of external VerbiTech model integration: 'connected' or 'pending'")
    generation_source: str = Field("grounded_knowledge_fallback", description="Source of response: 'verbitech_model', 'deterministic_rule', or 'grounded_knowledge_fallback'")


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    facts_loaded: bool = False
    projects_count: int = 0
    model_status: str = Field("pending", description="Status of external VerbiTech model integration: 'connected' or 'pending'")
    model_endpoint_configured: bool = Field(False, description="Whether VERBITECH_API_URL is configured in environment")
    model_checkpoint_info: str = Field("Step 2000 (External Colab/Drive)", description="Description of target trained checkpoint")
