from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # 1. ĐỔI TÊN CHO KHỚP VỚI .ENV
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "hieusoft"
    DB_PASSWORD: str = "123456"
    DB_NAME: str = "hieusoft"

    DATABASE_URL: Optional[str] = None

    # Redis (Đã khớp với .env của bác)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URL: Optional[str] = None

    API_KEY: str = "secret"

    @property
    def db_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Sửa lại mapping ở đây
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def redis_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        password = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else "@"
        return f"redis://{password}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # 2. CẤU HÌNH CHO PYDANTIC V2
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"  # Ép nó lờ đi nếu thấy biến lạ trong .env
    )

settings = Settings()