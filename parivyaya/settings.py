from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PLAID_CLIENT_ID: str = Field(..., env="PLAID_CLIENT_ID")
    PLAID_SECRET: str = Field(..., env="PLAID_SECRET")
    PARIVYAYA_DATA_DIR: Path = Field(..., env="PARIVYAYA_DATA_DIR")
    LOGGER_NAME: str = "parivyaya"
    DEFAULT_CURRENCY: str = "CAD"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
