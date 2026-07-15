from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, BrandProfile, BrandProduct, BrandCompetitor, Generation
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.platform import (
    BrandPayload, ProductPayload, CompetitorPayload, GeneratePayload,
    ImprovePayload, FeedbackPayload, PlanPayload,
)
from app.core.security import hash_password, verify_password, create_token, current_user
from app.services.plans import get_plan
from app.services.ai import generate, compare
from app.services.brand_context import build_brand_context
from app.core.config import settings

router = APIRouter()


def brand_dict(brand: BrandProfile | None):
    return {} if not brand else {c.name: getattr(brand, c.name) for c in brand.__table__.columns}


def consume_usage(user: User):
    today = date.today().isoformat()
    if user.usage_date != today:
        user.daily_usage = 0
        user.usage_date = today
    plan = get_plan(user.plan)
    if user.daily_usage >= plan.daily_limit:
        raise HTTPException(status_code=429, detail="سهمیه امروز تمام شده است.")
    return plan


@router.get("/health")
def health():
    return {"status": "ok", "platform": "RonaghYar AI Platform", "version": "1.2.0"}


@router.post("/auth/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(409, "این ایمیل قبلاً ثبت شده است.")
    user = User(email=payload.email, full_name=payload.full_name, password_hash=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    return TokenResponse(access_token=create_token(user.id))


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "ایمیل یا رمز عبور نادرست است.")
    return TokenResponse(access_token=create_token(user.id))


@router.get("/me")
def me(user: User = Depends(current_user)):
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "plan": user.plan, "daily_usage": user.daily_usage, "total_usage": user.total_usage,
    }


@router.get("/brand")
def get_brand(user: User = Depends(current_user), db: Session = Depends(get_db)):
    products = db.scalars(select(BrandProduct).where(BrandProduct.user_id == user.id).order_by(BrandProduct.id.desc())).all()
    competitors = db.scalars(select(BrandCompetitor).where(BrandCompetitor.user_id == user.id).order_by(BrandCompetitor.id.desc())).all()
    return {
        "profile": brand_dict(user.brand),
        "products": [{c.name: getattr(x, c.name) for c in x.__table__.columns} for x in products],
        "competitors": [{c.name: getattr(x, c.name) for c in x.__table__.columns} for x in competitors],
    }


@router.put("/brand")
def save_brand(payload: BrandPayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    brand = user.brand or BrandProfile(user_id=user.id)
    for key, value in payload.model_dump().items():
        setattr(brand, key, value)
    db.add(brand); db.commit(); db.refresh(brand)
    return {"ok": True, "profile": brand_dict(brand)}


@router.post("/brand/products", status_code=status.HTTP_201_CREATED)
def add_product(payload: ProductPayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    product = BrandProduct(user_id=user.id, **payload.model_dump())
    db.add(product); db.commit(); db.refresh(product)
    return {c.name: getattr(product, c.name) for c in product.__table__.columns}


@router.delete("/brand/products/{product_id}")
def delete_product(product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    product = db.scalar(select(BrandProduct).where(BrandProduct.id == product_id, BrandProduct.user_id == user.id))
    if not product: raise HTTPException(404, "محصول پیدا نشد.")
    db.delete(product); db.commit(); return {"ok": True}


@router.post("/brand/competitors", status_code=status.HTTP_201_CREATED)
def add_competitor(payload: CompetitorPayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    competitor = BrandCompetitor(user_id=user.id, **payload.model_dump())
    db.add(competitor); db.commit(); db.refresh(competitor)
    return {c.name: getattr(competitor, c.name) for c in competitor.__table__.columns}


@router.delete("/brand/competitors/{competitor_id}")
def delete_competitor(competitor_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    competitor = db.scalar(select(BrandCompetitor).where(BrandCompetitor.id == competitor_id, BrandCompetitor.user_id == user.id))
    if not competitor: raise HTTPException(404, "رقیب پیدا نشد.")
    db.delete(competitor); db.commit(); return {"ok": True}


@router.post("/generate")
async def create_generation(payload: GeneratePayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = consume_usage(user)
    if payload.feature in {"director", "calendar"} and not plan.advanced:
        raise HTTPException(403, "این قابلیت مخصوص Pro و Business است.")
    brand = build_brand_context(db, user)
    if payload.compare:
        if user.plan == "FREE": raise HTTPException(403, "Compare مخصوص Pro و Business است.")
        results = await compare(payload.feature, payload.text, brand, plan.outputs, settings.ai_compare_max_providers)
        user.daily_usage += 1; user.total_usage += 1; db.commit()
        return {"mode": "compare", "results": results}
    try:
        output, score, ai_meta = await generate(payload.feature, payload.text, brand, plan.outputs, payload.preferred_provider)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(503, f"خطای سرویس هوش مصنوعی: {exc}") from exc
    generation = Generation(user_id=user.id, feature=payload.feature, input_text=payload.text, output_text=output, quality_score=score)
    user.daily_usage += 1; user.total_usage += 1
    db.add(generation); db.commit(); db.refresh(generation)
    return {"id": generation.id, "output": output, "quality_score": score, "ai": ai_meta, "mode": "single"}


@router.post("/generations/{generation_id}/improve")
async def improve_generation(generation_id: int, payload: ImprovePayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    source = db.scalar(select(Generation).where(Generation.id == generation_id, Generation.user_id == user.id))
    if not source: raise HTTPException(404, "خروجی پیدا نشد.")
    plan = consume_usage(user)
    instruction = payload.instruction or "این خروجی را جذاب‌تر، دقیق‌تر، برندمحورتر و آماده‌تر برای انتشار کن."
    improvement_input = f"متن قبلی:\n{source.output_text}\n\nدرخواست بهبود:\n{instruction}"
    output, score, ai_meta = await generate("rewrite", improvement_input, build_brand_context(db, user), plan.outputs, payload.preferred_provider)
    improved = Generation(
        user_id=user.id, feature=source.feature, input_text=improvement_input,
        output_text=output, quality_score=score, parent_generation_id=source.id,
    )
    source.feedback = "IMPROVED"
    user.daily_usage += 1; user.total_usage += 1
    db.add(improved); db.commit(); db.refresh(improved)
    return {"id": improved.id, "output": output, "quality_score": score, "ai": ai_meta}


@router.post("/generations/{generation_id}/favorite")
def toggle_favorite(generation_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    generation = db.scalar(select(Generation).where(Generation.id == generation_id, Generation.user_id == user.id))
    if not generation: raise HTTPException(404, "خروجی پیدا نشد.")
    generation.favorite = not generation.favorite
    db.commit(); return {"ok": True, "favorite": generation.favorite}


@router.post("/generations/{generation_id}/feedback")
def generation_feedback(generation_id: int, payload: FeedbackPayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if payload.feedback not in {"ACCEPTED", "REJECTED"}:
        raise HTTPException(400, "بازخورد نامعتبر است.")
    generation = db.scalar(select(Generation).where(Generation.id == generation_id, Generation.user_id == user.id))
    if not generation: raise HTTPException(404, "خروجی پیدا نشد.")
    generation.feedback = payload.feedback
    db.commit(); return {"ok": True}


@router.get("/history")
def history(user: User = Depends(current_user), db: Session = Depends(get_db), favorites_only: bool = False):
    query = select(Generation).where(Generation.user_id == user.id)
    if favorites_only: query = query.where(Generation.favorite.is_(True))
    rows = db.scalars(query.order_by(Generation.id.desc()).limit(50)).all()
    return [
        {
            "id": row.id, "feature": row.feature, "input_text": row.input_text,
            "output_text": row.output_text, "quality_score": row.quality_score,
            "favorite": row.favorite, "feedback": row.feedback,
            "parent_generation_id": row.parent_generation_id, "created_at": row.created_at,
        }
        for row in rows
    ]


@router.post("/plan")
def set_plan(payload: PlanPayload, user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = payload.plan.upper()
    if plan not in {"FREE", "PRO", "BUSINESS"}: raise HTTPException(400, "پلن نامعتبر است.")
    user.plan = plan; db.commit(); return {"ok": True, "plan": plan}


@router.get("/ai/providers")
def ai_providers(user: User = Depends(current_user)):
    from app.ai.router import ai_router
    return {"available": ai_router.available(), "mode": settings.ai_routing_mode, "compare_max": settings.ai_compare_max_providers}
