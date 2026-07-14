from pydantic import BaseModel, Field


class BrandPayload(BaseModel):
    brand_name: str | None = None
    slogan: str | None = None
    website: str | None = None
    business_type: str | None = None
    business_description: str | None = None
    audience: str | None = None
    audience_pains: str | None = None
    audience_goals: str | None = None
    tone: str | None = None
    brand_personality: str | None = None
    value_proposition: str | None = None
    preferred_cta: str | None = None
    preferred_words: str | None = None
    forbidden_words: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    city: str | None = None
    country: str | None = None
    language: str = "fa"


class ProductPayload(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str | None = None
    benefits: str | None = None
    price: float | None = Field(default=None, ge=0)
    target_segment: str | None = None
    active: bool = True


class CompetitorPayload(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    website: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    positioning: str | None = None


class GeneratePayload(BaseModel):
    feature: str
    text: str = Field(min_length=2)
    preferred_provider: str | None = None
    compare: bool = False


class ImprovePayload(BaseModel):
    instruction: str | None = None
    preferred_provider: str | None = None


class FeedbackPayload(BaseModel):
    feedback: str


class PlanPayload(BaseModel):
    plan: str
