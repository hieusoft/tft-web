import redis
from app.core.config import settings

# Dùng redis_url (ưu tiên REDIS_URL từ Docker, fallback REDIS_* vars cho local)
redis_client = redis.from_url(
    settings.redis_url,
    decode_responses=True,
)

def get_redis() -> redis.Redis:
    return redis_client
