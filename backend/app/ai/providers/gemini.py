from __future__ import annotations
import time, httpx
from app.ai.base import AIProvider
from app.ai.types import AIRequest, AIResponse

class GeminiProvider(AIProvider):
    name='gemini'
    def __init__(self,api_key:str,model:str): self.api_key=api_key; self.model=model
    def configured(self)->bool: return bool(self.api_key)
    async def generate(self,request:AIRequest)->AIResponse:
        if not self.configured(): raise RuntimeError('GEMINI_API_KEY تنظیم نشده است.')
        started=time.perf_counter(); url=f'https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}'
        payload={'systemInstruction':{'parts':[{'text':request.system_prompt}]},'contents':[{'role':'user','parts':[{'text':request.prompt}]}],'generationConfig':{'temperature':request.temperature,'maxOutputTokens':request.max_tokens}}
        async with httpx.AsyncClient(timeout=120) as client:
            r=await client.post(url,json=payload); r.raise_for_status(); data=r.json()
        parts=data['candidates'][0]['content']['parts']; text=''.join(x.get('text','') for x in parts).strip(); usage=data.get('usageMetadata') or {}
        return AIResponse(self.name,self.model,text,int((time.perf_counter()-started)*1000),usage.get('promptTokenCount'),usage.get('candidatesTokenCount'))
