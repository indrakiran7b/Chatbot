from pydantic import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./app.db"
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1/responses"
    OPENAI_MODEL: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"

settings = Settings()
