from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PARIVYAYA_DATA_DIR: Path = Field(..., env="PARIVYAYA_DATA_DIR")
    LOGGER_NAME: str = "parivyaya"
    CURRENCY: str = "CAD"
    COUNTRY_CODE: str = "CA"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
