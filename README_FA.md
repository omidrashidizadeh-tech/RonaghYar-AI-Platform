# RonaghYar AI Platform — Sprint 1

نسخه پایه معماری نهایی پلتفرم رونق‌یار:

- Frontend: Next.js + TypeScript + Tailwind
- Backend: FastAPI + SQLAlchemy 2 + Alembic
- Database: PostgreSQL
- Cache/Queue foundation: Redis
- Auth: JWT
- AI Router: Groq / OpenAI / Gemini / Anthropic (قابل توسعه)
- Deployment: Docker Compose

## اجرای سریع با Docker

1. فایل `.env.example` را به `.env` کپی کن.
2. کلید سرویس AI را در `.env` وارد کن.
3. اجرا:

```bash
cp .env.example .env
docker compose up --build
```

سپس:

- وب‌اپ: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## حساب آزمایشی

در صفحه ورود، حساب جدید بساز. هر حساب جدید با پلن Free و ۵ درخواست روزانه ایجاد می‌شود.

## امکانات Sprint 1

- ثبت‌نام و ورود JWT
- داشبورد فارسی و RTL
- Brand Brain / DNA برند
- AI Studio برای کپشن، ریلز، ایده، تبلیغات، هوک و بازنویسی
- AI Growth Director و تقویم برای پلن‌های حرفه‌ای
- تاریخچه تولیدات
- Free / Pro / Business policy engine
- PostgreSQL + Redis + Docker

## مرحله بعدی

Campaign Builder، Analytics، Automation Hub، Billing واقعی، OAuth و پنل مدیریت در Sprintهای بعدی روی همین هسته افزوده می‌شوند.


## Sprint 1.1 — Documentation & Multi-AI Core
- مجموعه ۲۶ سند رسمی در پوشه `docs/`
- Provider Contract مستقل
- Auto routing و fallback
- Adapter اجرایی Groq، OpenAI، Anthropic و Gemini
- Endpoint جدید `/api/v1/ai/providers`
- امکان `preferred_provider` در درخواست Generate
- پورت Frontend قابل تنظیم با `FRONTEND_PORT` و پیش‌فرض 3001

### اجرا
```bash
docker compose down
docker compose up -d --build
```
وب‌اپ: `http://localhost:3001`
