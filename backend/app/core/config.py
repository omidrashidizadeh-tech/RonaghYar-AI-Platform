from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = 'RonaghYar AI Platform'
    api_prefix: str = '/api/v1'
    app_env: str = 'development'
    enforce_usage_limits: bool = False
    database_url: str = 'postgresql+psycopg://ronaghyar:ronaghyar_dev_password@db:5432/ronaghyar'
    redis_url: str = 'redis://redis:6379/0'
    jwt_secret: str = 'change-this-in-production'
    jwt_algorithm: str = 'HS256'
    jwt_expire_minutes: int = 1440

    ai_provider: str = 'auto'
    ai_routing_mode: str = 'auto'
    groq_api_key: str = ''
    openai_api_key: str = ''
    gemini_api_key: str = ''
    anthropic_api_key: str = ''

    groq_model: str = 'llama-3.3-70b-versatile'
    openai_model: str = 'gpt-4.1-mini'
    anthropic_model: str = 'claude-sonnet-4-5'
    gemini_model: str = 'gemini-2.5-flash'
    ai_compare_max_providers: int = 3

    model_config = SettingsConfigDict(env_file='.env', extra='ignore', case_sensitive=False)

settings=Settings()
