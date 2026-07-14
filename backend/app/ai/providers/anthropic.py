from __future__ import annotations
import time, httpx
from app.ai.base import AIProvider
from app.ai.types import AIRequest, AIResponse

class AnthropicProvider(AIProvider):
    name='anthropic'
    def __init__(self,api_key:str,model:str): self.api_key=api_key; self.model=model
    def configured(self)->bool: return bool(self.api_key)
    async def generate(self,request:AIRequest)->AIResponse:
        if not self.configured(): raise RuntimeError('ANTHROPIC_API_KEY تنظیم نشده است.')
        started=time.perf_counter()
        async with httpx.AsyncClient(timeout=120) as client:
            r=await client.post('https://api.anthropic.com/v1/messages',headers={'x-api-key':self.api_key,'anthropic-version':'2023-06-01','content-type':'application/json'},json={'model':self.model,'system':request.system_prompt,'messages':[{'role':'user','content':request.prompt}],'temperature':request.temperature,'max_tokens':request.max_tokens})
            r.raise_for_status(); data=r.json()
        text=''.join(x.get('text','') for x in data.get('content',[]) if x.get('type')=='text').strip(); usage=data.get('usage') or {}
        return AIResponse(self.name,self.model,text,int((time.perf_counter()-started)*1000),usage.get('input_tokens'),usage.get('output_tokens'))
