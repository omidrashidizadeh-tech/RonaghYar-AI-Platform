> Version: 1.0
> Status: Active Living Document
> Owner: Omid Rashidizadeh
> Product: RonaghYar AI Platform
> Codename: Phoenix

# System Architecture Bible

Frontend: Next.js + TypeScript + Tailwind.
Backend: FastAPI + SQLAlchemy + Alembic.
Data: PostgreSQL + Redis.
AI: Provider Adapters + Router + Evaluator.
Infra: Docker Compose در توسعه، Cloud-ready در تولید.

معماری در ابتدا Modular Monolith است؛ جداسازی سرویس فقط بر اساس نیاز واقعی انجام می‌شود.
