from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.database import Base, engine
from app.routers import traits, augments, items, skills, champions, images, gods, comps
# Tạo bảng tự động
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TFT API",
    version="1.0.0",
    description="API quản lý dữ liệu Teamfight Tactics",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"statusCode": 500, "message": str(exc), "path": str(request.url)},
    )

app.include_router(traits.router, prefix="/api/v1/traits", tags=["Tộc hệ (Traits)"])
app.include_router(augments.router, prefix="/api/v1/augemnts", tags=["Lõi công nghệ (Augments)"])
app.include_router(items.router, prefix="/api/v1/items", tags=["Trang Bị (Items)"])
app.include_router(skills.router, prefix="/api/v1/skills", tags=["Kỹ Năng (Skills)"])
app.include_router(champions.router, prefix="/api/v1/champions", tags=["Tướng (Champions)"])
app.include_router(images.router, prefix="/api/v1/images", tags=["Ảnh (Images)"])
app.include_router(gods.router, prefix="/api/v1/gods", tags=["Thần (Gods)"])
app.include_router(comps.router, prefix="/api/v1/comps", tags=["Đội Hình (Comps)"])
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
