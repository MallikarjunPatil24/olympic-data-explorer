from fastapi import APIRouter
from app.api.routes.analytics import router as analytics_router
from app.api.routes.filters import router as filters_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.countries import router as countries_router
from app.api.routes.sports import router as sports_router
from app.api.routes.athletes import router as athletes_router
from app.api.routes.medals import router as medals_router
from app.api.routes.years import router as years_router

api_router = APIRouter()

api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(filters_router, prefix="/filters", tags=["filters"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(countries_router, prefix="/countries", tags=["countries"])
api_router.include_router(sports_router, prefix="/sports", tags=["sports"])
api_router.include_router(athletes_router, prefix="/athletes", tags=["athletes"])
api_router.include_router(medals_router, prefix="/medals", tags=["medals"])
api_router.include_router(years_router, prefix="/years", tags=["years"])
