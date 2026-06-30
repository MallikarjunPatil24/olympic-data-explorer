import logging
from typing import List
from fastapi import APIRouter, Request, HTTPException, Depends
from app.models.filters import CommonFilters
from app.models.responses import SportItemResponse, SportDetailResponse, GenderSplit, MedalTrendItem, SportAthleteItem
from app.utils.data_helper import apply_filters

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory caches for static database queries
_sports_summary_cache = {}
_sport_detail_cache = {}

@router.get("", response_model=List[SportItemResponse])
async def get_sports_summary(
    request: Request,
    filters: CommonFilters = Depends(CommonFilters)
):
    """
    Returns lists of Olympic sports along with athlete headcounts, event counts, 
    and total medals won, respecting active filter criteria.
    """
    cache_key = (
        filters.year,
        filters.season,
        filters.country,
        filters.sport,
        filters.gender,
        filters.medal
    )
    if cache_key in _sports_summary_cache:
        logger.debug(f"Serving sports summary from cache for filters: {cache_key}")
        return _sports_summary_cache[cache_key]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        # Filter dataset
        f_df = apply_filters(df, filters)
        
        sport_col = 'sport' if 'sport' in f_df.columns else None
        if not sport_col:
            return []
            
        # Group by sport and aggregate
        sport_groups = f_df.groupby('sport')
        
        results = []
        for sport, group in sport_groups:
            athlete_count = int(group['name'].nunique()) if 'name' in group.columns else 0
            event_count = int(group['event'].nunique()) if 'event' in group.columns else 0
            
            medal_count = 0
            if 'medal' in group.columns:
                medal_mask = group['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze'])
                medal_count = int(medal_mask.sum())
                
            results.append(SportItemResponse(
                sport=str(sport),
                athlete_count=athlete_count,
                event_count=event_count,
                medal_count=medal_count
            ))
            
        # Sort descending by athlete headcount
        results.sort(key=lambda x: x.athlete_count, reverse=True)
        _sports_summary_cache[cache_key] = results
        return results
    except Exception as e:
        logger.error(f"Error compiling sports summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate sports summary: {str(e)}")


@router.get("/{sport_name}", response_model=SportDetailResponse)
async def get_sport_detail(request: Request, sport_name: str):
    """
    Returns detailed insights for a single Olympic sport: unique participating countries, 
    gender split profiles, historical medal progress trends, and top medal-winning athletes.
    """
    sport_clean = sport_name.strip().lower()
    if sport_clean in _sport_detail_cache:
        logger.debug(f"Serving sport detail from cache for: {sport_clean}")
        return _sport_detail_cache[sport_clean]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No dataset loaded.")
        
    try:
        sport_col = 'sport' if 'sport' in df.columns else None
        if not sport_col:
            raise HTTPException(status_code=500, detail="Sport column missing in dataset.")
            
        sport_df = df[df['sport'].astype(str).str.lower() == sport_clean]
        
        if sport_df.empty:
            raise HTTPException(status_code=404, detail=f"Sport '{sport_name}' not found in the Olympic dataset.")
            
        # Resolved Name (preserve case)
        sport_resolved = str(sport_df['sport'].iloc[0])
        
        # Participating Countries count
        noc_col = 'noc' if 'noc' in sport_df.columns else ('team' if 'team' in sport_df.columns else None)
        countries_count = sport_df[noc_col].nunique() if noc_col else 0
        
        # Gender split
        m_count = 0
        f_count = 0
        if 'sex' in sport_df.columns:
            # Calculate unique male and female athlete counts
            # Group by name to get unique sex associations
            unique_athletes = sport_df.drop_duplicates(subset=['name']) if 'name' in sport_df.columns else sport_df
            sex_counts = unique_athletes['sex'].value_counts()
            m_count = int(sex_counts.get('M', 0))
            f_count = int(sex_counts.get('F', 0))
            
        total_genders = m_count + f_count
        male_pct = round((m_count / total_genders) * 100, 2) if total_genders > 0 else 0.0
        female_pct = round((f_count / total_genders) * 100, 2) if total_genders > 0 else 0.0
        
        # Historical Trend
        trend_list = []
        if 'year' in sport_df.columns:
            yearly_groups = sport_df.groupby('year')
            for year, year_group in yearly_groups:
                y_medals = year_group['medal'].astype(str).str.lower()
                y_gold = int((y_medals == 'gold').sum())
                y_silver = int((y_medals == 'silver').sum())
                y_bronze = int((y_medals == 'bronze').sum())
                trend_list.append(MedalTrendItem(
                    year=int(year),
                    gold=y_gold,
                    silver=y_silver,
                    bronze=y_bronze,
                    total=y_gold + y_silver + y_bronze
                ))
            # Sort chronologically
            trend_list.sort(key=lambda x: x.year)
            
        # Top Athletes in that sport
        top_athletes = []
        if 'name' in sport_df.columns:
            athlete_groups = sport_df.groupby(['name', 'noc' if 'noc' in sport_df.columns else 'team'])
            for (name, noc), grp in athlete_groups:
                medals = grp['medal'].astype(str).str.lower()
                gold = int((medals == 'gold').sum())
                silver = int((medals == 'silver').sum())
                bronze = int((medals == 'bronze').sum())
                total = gold + silver + bronze
                
                # Only list athletes who won at least one medal
                if total > 0:
                    top_athletes.append(SportAthleteItem(
                        name=str(name),
                        noc=str(noc),
                        gold_count=gold,
                        silver_count=silver,
                        bronze_count=bronze,
                        total_medals=total
                    ))
            # Sort by total medals descending
            top_athletes.sort(key=lambda x: (x.total_medals, x.gold_count), reverse=True)
            top_athletes = top_athletes[:10]
            
        res = SportDetailResponse(
            sport=sport_resolved,
            participating_countries_count=countries_count,
            gender_split=GenderSplit(
                male_count=m_count,
                female_count=f_count,
                male_pct=male_pct,
                female_pct=female_pct
            ),
            historical_trend=trend_list,
            top_athletes=top_athletes
        )
        _sport_detail_cache[sport_clean] = res
        return res
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error compiling details for sport {sport_name}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load sport details: {str(e)}")
