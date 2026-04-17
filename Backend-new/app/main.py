import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.lifespan import lifespan
from app.routers import traits, augments

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(
    title="TFT API",
    version="1.0.0",
    description="API quản lý dữ liệu Teamfight Tactics",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_check():
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"statusCode": 500, "message": str(exc), "path": str(request.url)},
    )

app.include_router(traits.router, prefix="/api/v1/traits", tags=["Tộc hệ"])
app.include_router(augments.router, prefix="/api/v1/augemnts", tags=["Lõi công nghệ"])
app.include_router(augments.router, prefix="/api/v1/items", tags=["Trang Bị (Items)"])
# Custom OpenAPI schema — thêm API Key security vào Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
        }
    }
    for path in schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"ApiKeyAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi
