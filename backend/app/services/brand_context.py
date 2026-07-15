from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import BrandCompetitor, BrandProduct, User


def build_brand_context(db: Session, user: User) -> dict:
    profile = (
        {column.name: getattr(user.brand, column.name) for column in user.brand.__table__.columns}
        if user.brand
        else {}
    )

    products = db.scalars(
        select(BrandProduct)
        .where(BrandProduct.user_id == user.id, BrandProduct.active.is_(True))
        .order_by(BrandProduct.id.desc())
    ).all()

    competitors = db.scalars(
        select(BrandCompetitor)
        .where(BrandCompetitor.user_id == user.id)
        .order_by(BrandCompetitor.id.desc())
    ).all()

    return {
        "profile": profile,
        "products": [
            {
                "name": item.name,
                "description": item.description,
                "benefits": item.benefits,
                "price": item.price,
                "target_segment": item.target_segment,
            }
            for item in products
        ],
        "competitors": [
            {
                "name": item.name,
                "website": item.website,
                "strengths": item.strengths,
                "weaknesses": item.weaknesses,
                "positioning": item.positioning,
            }
            for item in competitors
        ],
    }
