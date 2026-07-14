import logging
from typing import List
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from typing import List, Optional
from app.models.filters import CommonFilters
from app.models.responses import CountryMedalsItem, CountryProfileResponse, MedalTrendItem, SportMedalItem
from app.utils.data_helper import apply_filters

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory caches for static database queries
_countries_summary_cache = {}
_country_profile_cache = {}

@router.get("", response_model=List[CountryMedalsItem])
async def get_countries_summary(
    request: Request,
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
    """
    Returns a sorted table of countries (NOC codes) with their athlete headcounts
    and medal counts (Gold, Silver, Bronze), respecting active filter selections.
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
    if cache_key in _countries_summary_cache:
        logger.debug(f"Serving countries summary from cache for filters: {cache_key}")
        return _countries_summary_cache[cache_key]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        # Pre-filter dataset
        f_df = apply_filters(df, filters)
        
        noc_col = 'noc' if 'noc' in f_df.columns else None
        if not noc_col:
            return []
            
        # Determine country name column
        team_col = 'team' if 'team' in f_df.columns else 'noc'
        
        # Calculate athlete counts by country
        athlete_counts = f_df.groupby('noc')['name'].nunique()
        
        # Aggregate medals
        noc_groups = f_df.groupby('noc')
        
        results = []
        team_names = f_df.groupby('noc')[team_col].agg(lambda x: x.mode().iloc[0] if not x.empty else str(x.name))
        
        for noc, group in noc_groups:
            medals = group['medal'].astype(str).str.lower()
            gold = int((medals == 'gold').sum())
            silver = int((medals == 'silver').sum())
            bronze = int((medals == 'bronze').sum())
            total = gold + silver + bronze
            athlete_count = int(athlete_counts.get(noc, 0))
            
            results.append(CountryMedalsItem(
                noc=str(noc),
                country_name=str(team_names.get(noc, noc)),
                athlete_count=athlete_count,
                gold_count=gold,
                silver_count=silver,
                bronze_count=bronze,
                total_medals=total
            ))
            
        # Sort descending by total medals, then gold, then athlete count
        results.sort(key=lambda x: (x.total_medals, x.gold_count, x.athlete_count), reverse=True)
        _countries_summary_cache[cache_key] = results
        return results
    except Exception as e:
        logger.error(f"Error compiling countries summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load countries list: {str(e)}")


@router.get("/{country_code}", response_model=CountryProfileResponse)
async def get_country_profile(request: Request, country_code: str):
    """
    Returns a comprehensive performance profile for a specific country (by NOC code, e.g. USA):
    overall medal counts, unique athlete count, year-over-year medal trends, and top sports.
    """
    country_clean = country_code.strip().upper()
    if country_clean in _country_profile_cache:
        logger.debug(f"Serving country profile from cache for: {country_clean}")
        return _country_profile_cache[country_clean]

    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No dataset loaded.")
        
    try:
        # Check if country exists in database
        noc_col = 'noc' if 'noc' in df.columns else None
        if not noc_col:
            raise HTTPException(status_code=500, detail="NOC column missing in dataset.")
            
        country_df = df[df['noc'].str.upper() == country_clean]
        
        if country_df.empty:
            # Fall back to Team column check if NOC fails
            if 'team' in df.columns:
                country_df = df[df['team'].str.lower() == country_code.strip().lower()]
                
        if country_df.empty:
            raise HTTPException(status_code=404, detail=f"Country code '{country_code}' not found in the Olympic dataset.")
            
        # Extract country name
        team_col = 'team' if 'team' in country_df.columns else 'noc'
        country_name = str(country_df[team_col].mode().iloc[0]) if not country_df.empty else country_clean
        
        # General stats
        medals_col = country_df['medal'].astype(str).str.lower()
        gold_count = int((medals_col == 'gold').sum())
        silver_count = int((medals_col == 'silver').sum())
        bronze_count = int((medals_col == 'bronze').sum())
        total_medals = gold_count + silver_count + bronze_count
        
        total_athletes_sent = country_df['name'].nunique() if 'name' in country_df.columns else 0
        
        # Medal Trend by Year
        trend_list = []
        if 'year' in country_df.columns:
            yearly_groups = country_df.groupby('year')
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
            
        # Top Sports for that Country
        sports_list = []
        if 'sport' in country_df.columns:
            sport_groups = country_df.groupby('sport')
            for sport, sport_group in sport_groups:
                s_medals = sport_group['medal'].astype(str).str.lower()
                s_gold = int((s_medals == 'gold').sum())
                s_silver = int((s_medals == 'silver').sum())
                s_bronze = int((s_medals == 'bronze').sum())
                s_total = s_gold + s_silver + s_bronze
                
                # We only keep sports where they won medals, or have entries
                if s_total > 0:
                    sports_list.append(SportMedalItem(
                        sport=str(sport),
                        gold=s_gold,
                        silver=s_silver,
                        bronze=s_bronze,
                        total=s_total
                    ))
            # Sort by total medals descending
            sports_list.sort(key=lambda x: x.total, reverse=True)
            # Limit to top 15
            sports_list = sports_list[:15]
            
        res = CountryProfileResponse(
            noc=country_clean,
            country_name=country_name,
            gold_count=gold_count,
            silver_count=silver_count,
            bronze_count=bronze_count,
            total_medals=total_medals,
            total_athletes_sent=total_athletes_sent,
            medal_trend=trend_list,
            top_sports=sports_list
        )
        _country_profile_cache[country_clean] = res
        return res
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error compiling country profile for {country_code}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate country profile: {str(e)}")
