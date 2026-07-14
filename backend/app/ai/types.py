from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

@dataclass
class AIRequest:
    prompt: str
    system_prompt: str
    task_type: str = "general"
    mode: str = "auto"
    preferred_provider: str | None = None
    max_tokens: int = 2800
    temperature: float = 0.55
    metadata: dict[str, Any] = field(default_factory=dict)

@dataclass
class AIResponse:
    provider: str
    model: str
    text: str
    latency_ms: int
    input_tokens: int | None = None
    output_tokens: int | None = None
    estimated_cost: float | None = None
