from app.services.ai import build_prompt


def test_build_prompt_includes_profile_products_and_competitors():
    brand = {
        "profile": {
            "brand_name": "رونق‌یار",
            "tone": "حرفه‌ای و صمیمی",
            "audience": "مدیران کسب‌وکار",
        },
        "products": [
            {
                "name": "پلن حرفه‌ای",
                "description": "دستیار هوشمند بازاریابی",
                "benefits": "صرفه‌جویی در زمان",
                "target_segment": "کسب‌وکارهای کوچک",
            }
        ],
        "competitors": [
            {
                "name": "رقیب نمونه",
                "positioning": "ابزار تولید محتوا",
                "strengths": "رابط ساده",
                "weaknesses": "فاقد Brand Brain",
            }
        ],
    }

    prompt = build_prompt("caption", "معرفی محصول", brand, 1)

    assert "رونق‌یار" in prompt
    assert "پلن حرفه‌ای" in prompt
    assert "رقیب نمونه" in prompt
    assert "فاقد Brand Brain" in prompt
