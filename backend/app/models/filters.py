from typing import Optional
from fastapi import Query

class CommonFilters:
    """
    Standard query parameters for filtering Olympic datasets.
    Reused across routes via FastAPI Depends().
    """
    def __init__(
        self,
        year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
        season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
        country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
        sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
        gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
        medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
    ):
        self.year = year
        self.season = season
        self.country = country
        self.sport = sport
        self.gender = gender
        self.medal = medal
