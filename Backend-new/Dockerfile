# ─────────────────────────────────────────────
# Stage 1: builder — cài dependencies
# ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Cài build tools cần thiết cho psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài vào /install để copy sang stage sau
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────
# Stage 2: runtime — image gọn nhất
# ─────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Chỉ cài runtime lib của postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy packages đã cài từ builder
COPY --from=builder /install /usr/local

# Copy source code
COPY . .

# Tạo user không phải root để tăng bảo mật
RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

# Production: không dùng --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
