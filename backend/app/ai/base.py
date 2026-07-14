from __future__ import annotations
from abc import ABC, abstractmethod
from app.ai.types import AIRequest, AIResponse

class AIProvider(ABC):
    name: str
    @abstractmethod
    async def generate(self, request: AIRequest) -> AIResponse: ...
    @abstractmethod
    def configured(self) -> bool: ...
