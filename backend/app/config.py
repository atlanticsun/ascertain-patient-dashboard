"""Central application settings.

Values come from environment variables, with a local .env file as a fallback.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed settings object shared across the app."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/dashboard"
    )


settings = Settings()
