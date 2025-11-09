from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    LOGGER_NAME: str = "parivyaya"
    CURRENCY: str = "CAD"
    COUNTRY_CODE: str = "CA"
    GOOGLE_API_KEY: str = Field(..., env="GOOGLE_API_KEY")
    KAFKA_BOOTSTRAP_SERVERS: str = Field(
        default="localhost:9092", env="KAFKA_BOOTSTRAP_SERVERS"
    )
    KAFKA_TOPIC: str = Field(default="gemini-tasks", env="KAFKA_TOPIC")
    KAFKA_GROUP_ID: str = Field(default="gemini-workers", env="KAFKA_GROUP_ID")

    # Database settings
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/parivyaya",
        env="DATABASE_URL",
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()
