import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.api.routes.debug import router as debug_router
from app.services.data_service import data_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and cache the optimized Olympic dataset on startup
    data_service.initialize()
    app.state.data_service = data_service
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for the Olympic Analytics Dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS (Cross-Origin Resource Sharing)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [origin.strip().rstrip("/") for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Health Check endpoint to verify API state and connectivity
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

# Include application routes structured under /api
app.include_router(api_router, prefix="/api")

# Mount temporary debug routes (relative to root /debug)
app.include_router(debug_router, prefix="/debug", tags=["debug"])
