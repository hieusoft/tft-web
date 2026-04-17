from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Kết nối DB theo từng biến (dùng khi chạy local)
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "tft"

    # Override toàn bộ (dùng khi chạy Docker — docker-compose truyền thẳng URL)
    DATABASE_URL: Optional[str] = None

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    # Override toàn bộ (dùng khi chạy Docker)
    REDIS_URL: Optional[str] = None

    API_KEY: str = "secret"

    @property
    def db_url(self) -> str:
        """Ưu tiên DATABASE_URL từ env (Docker), fallback về build từ POSTGRES_* vars."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def redis_url(self) -> str:
        """Ưu tiên REDIS_URL từ env (Docker), fallback về build từ REDIS_* vars."""
        if self.REDIS_URL:
            return self.REDIS_URL
        password = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else "@"
        return f"redis://{password}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    class Config:
        env_file = ".env"


settings = Settings()
