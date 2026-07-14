from __future__ import annotations
import asyncio
from app.ai.types import AIRequest, AIResponse
from app.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.ai.providers.anthropic import AnthropicProvider
from app.ai.providers.gemini import GeminiProvider
from app.core.config import settings

class AIRouter:
    def __init__(self):
        self.providers={
            'groq':OpenAICompatibleProvider('groq',settings.groq_api_key,'https://api.groq.com/openai/v1',settings.groq_model),
            'openai':OpenAICompatibleProvider('openai',settings.openai_api_key,'https://api.openai.com/v1',settings.openai_model),
            'anthropic':AnthropicProvider(settings.anthropic_api_key,settings.anthropic_model),
            'gemini':GeminiProvider(settings.gemini_api_key,settings.gemini_model),
        }

    def available(self)->list[str]: return [n for n,p in self.providers.items() if p.configured()]

    def candidates(self,request:AIRequest)->list[str]:
        available=self.available()
        if request.preferred_provider and request.preferred_provider in available:
            return [request.preferred_provider]+[x for x in available if x!=request.preferred_provider]
        preferences={
            'deep_strategy':['anthropic','openai','gemini','groq'],
            'image_analysis':['gemini','openai','anthropic','groq'],
            'fast_content':['groq','openai','gemini','anthropic'],
        }
        order=preferences.get(request.task_type,['groq','openai','anthropic','gemini'])
        return [x for x in order if x in available]

    async def generate(self,request:AIRequest)->AIResponse:
        names=self.candidates(request)
        if not names: raise RuntimeError('هیچ Provider هوش مصنوعی تنظیم نشده است.')
        errors=[]
        for name in names:
            try: return await self.providers[name].generate(request)
            except Exception as exc: errors.append(f'{name}: {exc}')
        raise RuntimeError('همه Providerها ناموفق بودند. '+' | '.join(errors))

    async def compare(self,request:AIRequest,max_providers:int=3)->list[AIResponse]:
        names=self.candidates(request)[:max_providers]
        if len(names)<2: raise RuntimeError('برای Compare حداقل دو Provider باید تنظیم شده باشد.')
        results=await asyncio.gather(*(self.providers[n].generate(request) for n in names),return_exceptions=True)
        responses=[r for r in results if isinstance(r,AIResponse)]
        if not responses: raise RuntimeError('هیچ پاسخ موفقی در Compare دریافت نشد.')
        return responses

ai_router=AIRouter()
