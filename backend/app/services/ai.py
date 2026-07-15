from __future__ import annotations
from app.ai.router import ai_router
from app.ai.types import AIRequest

FEATURES = {
    "caption": "کپشن حرفه‌ای با هوک، بدنه، CTA و هشتگ بنویس.",
    "reels": "سناریوی کامل ریلز با هوک سه ثانیه اول، شات‌ها، متن گوینده و CTA بنویس.",
    "stories": "یک دنباله استوری هدفمند با هوک، تعامل، ارزش و CTA طراحی کن.",
    "carousel": "ساختار کامل کاروسل شامل کاور، اسلایدها، جمع‌بندی و CTA تولید کن.",
    "ideas": "ایده‌های محتوایی عملی با قالب، هوک و CTA ارائه کن.",
    "ads": "متن تبلیغاتی قانع‌کننده با مسئله، ارزش پیشنهادی و CTA بنویس.",
    "hooks": "هوک‌های کوتاه، قوی و غیرکلیشه‌ای تولید کن.",
    "hashtags": "استراتژی هشتگ بساز: هشتگ عمومی، تخصصی، محلی، برند و کمپین؛ تکراری و اسپم نباشد.",
    "rewrite": "متن را طبیعی، حرفه‌ای و جذاب بازنویسی کن.",
    "director": "مثل مدیر رشد، مسئله کسب‌وکار را تحلیل و برنامه عملی اولویت‌بندی‌شده ارائه کن.",
    "calendar": "تقویم محتوایی ۳۰ روزه با موضوع، قالب، هوک، CTA و هدف هر روز بساز.",
}

SYSTEM = (
    "تو رونق‌یار، مدیر رشد و استراتژیست بازاریابی بازار فارسی هستی. "
    "خروجی باید طبیعی، دقیق، کاربردی، منطبق با برند، غیرترجمه‌ای و آماده اجرا باشد. "
    "هیچ ادعای آماری ساختگی تولید نکن و در صورت نبود داده، آن را صریح بگو."
)


def _brand_context(brand: dict | None) -> str:
    if not brand:
        return ""

    profile = brand.get("profile", brand)
    products = brand.get("products", [])
    competitors = brand.get("competitors", [])

    labels = {
        "brand_name": "نام برند",
        "slogan": "شعار",
        "website": "وب‌سایت",
        "business_type": "حوزه فعالیت",
        "business_description": "شرح کسب‌وکار",
        "audience": "مخاطب هدف",
        "audience_pains": "دردهای مخاطب",
        "audience_goals": "اهداف مخاطب",
        "tone": "لحن برند",
        "brand_personality": "شخصیت برند",
        "value_proposition": "ارزش پیشنهادی",
        "preferred_cta": "CTA ترجیحی",
        "preferred_words": "واژه‌های ترجیحی",
        "forbidden_words": "واژه‌های ممنوع",
        "city": "شهر",
        "country": "کشور",
        "language": "زبان",
    }

    sections: list[str] = []

    profile_lines = [
        f"- {labels.get(key, key)}: {value}"
        for key, value in profile.items()
        if value and key in labels
    ]
    if profile_lines:
        sections.append("پروفایل برند:\n" + "\n".join(profile_lines))

    if products:
        product_lines = []
        for item in products:
            details = [
                item.get("description"),
                f"مزایا: {item.get('benefits')}" if item.get("benefits") else None,
                f"مخاطب محصول: {item.get('target_segment')}" if item.get("target_segment") else None,
            ]
            product_lines.append(
                f"- {item.get('name')}: "
                + " | ".join(part for part in details if part)
            )
        sections.append("محصولات و خدمات:\n" + "\n".join(product_lines))

    if competitors:
        competitor_lines = []
        for item in competitors:
            details = [
                f"جایگاه: {item.get('positioning')}" if item.get("positioning") else None,
                f"قوت: {item.get('strengths')}" if item.get("strengths") else None,
                f"ضعف: {item.get('weaknesses')}" if item.get("weaknesses") else None,
            ]
            competitor_lines.append(
                f"- {item.get('name')}: "
                + " | ".join(part for part in details if part)
            )
        sections.append("رقبا:\n" + "\n".join(competitor_lines))

    if not sections:
        return ""

    return "\n\nزمینه کامل Brand Brain:\n" + "\n\n".join(sections)


def build_prompt(feature: str, text: str, brand: dict | None, outputs: int) -> str:
    if feature not in FEATURES:
        raise ValueError("قابلیت نامعتبر است.")
    rule = (
        f"{outputs} گزینه واقعاً متفاوت تولید کن، مزیت هر گزینه را کوتاه بگو و بهترین را مشخص کن."
        if outputs > 1 else "یک خروجی نهایی، تمیز و آماده استفاده ارائه کن."
    )
    hashtag_rule = "\nهشتگ‌ها را دسته‌بندی کن و از ادعای Reach یا ترند بدون داده واقعی خودداری کن." if feature == "hashtags" else ""
    return f"{FEATURES[feature]}{_brand_context(brand)}\nقانون خروجی: {rule}{hashtag_rule}\nدرخواست کاربر: {text}"


def quality_score(text: str) -> int:
    score = 65
    if len(text) > 180: score += 8
    if len(text) > 450: score += 5
    if any(x in text for x in ("هوک", "عنوان", "اسلاید")): score += 6
    if any(x in text for x in ("CTA", "دایرکت", "کامنت", "تماس", "اقدام")): score += 7
    if "#" in text: score += 4
    if any(x in text for x in ("نام برند", "لحن برند", "مخاطب")): score += 3
    return min(100, score)


def task_type(feature: str) -> str:
    if feature in {"director", "calendar"}: return "deep_strategy"
    if feature in {"caption", "hooks", "rewrite", "hashtags"}: return "fast_content"
    return "general"


async def generate(feature: str, text: str, brand: dict | None, outputs: int, preferred_provider: str | None = None) -> tuple[str, int, dict]:
    request = AIRequest(
        prompt=build_prompt(feature, text, brand, outputs),
        system_prompt=SYSTEM,
        task_type=task_type(feature),
        preferred_provider=preferred_provider,
    )
    response = await ai_router.generate(request)
    return response.text, quality_score(response.text), {
        "provider": response.provider,
        "model": response.model,
        "latency_ms": response.latency_ms,
    }


async def compare(feature: str, text: str, brand: dict | None, outputs: int, max_providers: int = 3) -> list[dict]:
    request = AIRequest(
        prompt=build_prompt(feature, text, brand, outputs),
        system_prompt=SYSTEM,
        task_type=task_type(feature),
    )
    responses = await ai_router.compare(request, max_providers=max_providers)
    return [
        {
            "provider": r.provider,
            "model": r.model,
            "output": r.text,
            "quality_score": quality_score(r.text),
            "latency_ms": r.latency_ms,
        }
        for r in responses
    ]
