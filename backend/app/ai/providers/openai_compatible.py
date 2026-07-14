from __future__ import annotations
import time, httpx
from app.ai.base import AIProvider
from app.ai.types import AIRequest, AIResponse

class OpenAICompatibleProvider(AIProvider):
    def __init__(self, name:str, api_key:str, base_url:str, model:str):
        self.name=name; self.api_key=api_key; self.base_url=base_url.rstrip('/'); self.model=model
    def configured(self)->bool: return bool(self.api_key)
    async def generate(self, request:AIRequest)->AIResponse:
        if not self.configured(): raise RuntimeError(f"کلید {self.name} تنظیم نشده است.")
        started=time.perf_counter()
        async with httpx.AsyncClient(timeout=120) as client:
            r=await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization":f"Bearer {self.api_key}"},
                json={"model":self.model,"messages":[{"role":"system","content":request.system_prompt},{"role":"user","content":request.prompt}],"temperature":request.temperature,"max_tokens":request.max_tokens},
            )
            r.raise_for_status(); data=r.json()
        usage=data.get('usage') or {}
        return AIResponse(self.name,self.model,data['choices'][0]['message']['content'].strip(),int((time.perf_counter()-started)*1000),usage.get('prompt_tokens'),usage.get('completion_tokens'))
