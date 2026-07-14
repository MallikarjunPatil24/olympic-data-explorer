import logging
from typing import List
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from typing import List, Optional
from app.models.filters import CommonFilters
from app.models.responses import DashboardStatsResponse, AgeBucketItem
from app.utils.data_helper import apply_filters

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory caches for static database queries
_stats_cache = {}
_age_cache = {}

@router.get("", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    request: Request,
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
    """
    Aggregates high-level statistical summaries (Athletes, NOCs, Sports, Events, Medals, and Games)
    for dashboard indicators, respecting active filters.
    """
    filters = CommonFilters(
        year=year,
        season=season,
        country=country,
        sport=sport,
        gender=gender,
        medal=medal
    )
    cache_key = (
        filters.year,
        filters.season,
        filters.country,
        filters.sport,
        filters.gender,
        filters.medal
    )
    if cache_key in _stats_cache:
        logger.debug(f"Serving dashboard stats from cache for filters: {cache_key}")
        return _stats_cache[cache_key]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return DashboardStatsResponse(
            total_athletes=0, total_countries=0, total_sports=0, total_events=0, total_medals=0, total_games=0
        )
        
    try:
        # Apply pre-filtering
        f_df = apply_filters(df, filters)
        
        # Calculate summary parameters
        total_athletes = f_df['name'].nunique() if 'name' in f_df.columns else 0
        
        total_countries = 0
        if 'noc' in f_df.columns:
            total_countries = f_df['noc'].nunique()
        elif 'team' in f_df.columns:
            total_countries = f_df['team'].nunique()
            
        total_sports = f_df['sport'].nunique() if 'sport' in f_df.columns else 0
        total_events = f_df['event'].nunique() if 'event' in f_df.columns else 0
        
        total_games = 0
        if 'games' in f_df.columns:
            total_games = f_df['games'].nunique()
        elif 'year' in f_df.columns:
            total_games = f_df['year'].nunique()
            
        # Count only actual awards (Gold, Silver, Bronze)
        total_medals = 0
        if 'medal' in f_df.columns:
            medal_mask = f_df['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze'])
            total_medals = int(medal_mask.sum())
            
        res = DashboardStatsResponse(
            total_athletes=total_athletes,
            total_countries=total_countries,
            total_sports=total_sports,
            total_events=total_events,
            total_medals=total_medals,
            total_games=total_games
        )
        _stats_cache[cache_key] = res
        return res
    except Exception as e:
        logger.error(f"Error compiling dashboard stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate dashboard statistics: {str(e)}")


@router.get("/age-distribution", response_model=List[AgeBucketItem])
async def get_age_distribution(
    request: Request,
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
    """
    Aggregates athlete ages into standard bins, respecting active query filters.
    Ranges: Under 15, 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50+.
    """
    filters = CommonFilters(
        year=year,
        season=season,
        country=country,
        sport=sport,
        gender=gender,
        medal=medal
    )
    cache_key = (
        filters.year,
        filters.season,
        filters.country,
        filters.sport,
        filters.gender,
        filters.medal
    )
    if cache_key in _age_cache:
        logger.debug(f"Serving age distribution from cache for filters: {cache_key}")
        return _age_cache[cache_key]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        f_df = apply_filters(df, filters)
        
        if 'age' not in f_df.columns:
            return []
            
        # Filter duplicates per athlete and get latest age entry to prevent skewing
        if 'name' in f_df.columns:
            unique_athletes = f_df.sort_values(by='year', ascending=False).drop_duplicates(subset=['name'])
            age_series = unique_athletes['age'].dropna()
        else:
            age_series = f_df['age'].dropna()
            
        bins = [0, 14, 19, 24, 29, 34, 39, 44, 49, 120]
        labels = ["Under 15", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50+"]
        
        # Default empty dict
        buckets_dict = {label: 0 for label in labels}
        
        if not age_series.empty:
            import pandas as pd
            bucketed = pd.cut(age_series, bins=bins, labels=labels)
            counts = bucketed.value_counts().sort_index().to_dict()
            for label, count in counts.items():
                buckets_dict[label] = int(count)
                
        res = [AgeBucketItem(range=label, count=count) for label, count in buckets_dict.items()]
        _age_cache[cache_key] = res
        return res
    except Exception as e:
        logger.error(f"Error compiling age distribution: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate age distribution: {str(e)}")
