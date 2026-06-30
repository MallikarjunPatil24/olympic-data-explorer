import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Olympic Analytics Dashboard API"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173"]
    DATA_DIR: str = "./app/data"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                # Try parsing as a JSON array (e.g. '["http://localhost:5173"]')
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Fall back to comma-separated string (e.g. 'http://localhost:5173,http://localhost:3000')
                return [i.strip() for i in v.split(",")]
        return v

    # Configure Pydantic to read from backend/.env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
