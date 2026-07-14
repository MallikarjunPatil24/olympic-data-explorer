import logging
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from app.models.filters import CommonFilters
from app.models.responses import MedalYearTrendItem, MedalDistributionItem
from app.utils.data_helper import apply_filters

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("", response_model=List[MedalYearTrendItem])
async def get_medal_trends(
    request: Request,
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
    """
    Returns the historical timeline of medals won over the years (for line/area charts),
    respecting active query filters.
    """
    filters = CommonFilters(
        year=year,
        season=season,
        country=country,
        sport=sport,
        gender=gender,
        medal=medal
    )
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        f_df = apply_filters(df, filters)
        
        if 'year' not in f_df.columns:
            return []
            
        yearly_groups = f_df.groupby('year')
        results = []
        
        for year, group in yearly_groups:
            medals = group['medal'].astype(str).str.lower()
            gold = int((medals == 'gold').sum())
            silver = int((medals == 'silver').sum())
            bronze = int((medals == 'bronze').sum())
            total = gold + silver + bronze
            
            # Fetch games description if available, otherwise default to year string
            games_str = str(group['games'].iloc[0]) if 'games' in group.columns else str(year)
            
            results.append(MedalYearTrendItem(
                year=int(year),
                games=games_str,
                gold_count=gold,
                silver_count=silver,
                bronze_count=bronze,
                total_medals=total
            ))
            
        # Ensure chronological ordering
        results.sort(key=lambda x: x.year)
        return results
    except Exception as e:
        logger.error(f"Error compiling medal trends: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate medal trends: {str(e)}")


@router.get("/distribution", response_model=List[MedalDistributionItem])
async def get_medal_distribution(
    request: Request,
    group_by: Optional[str] = Query(None, description="Group distribution by: 'country' (NOC) or 'sport'"),
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
    """
    Returns the count of gold, silver, and bronze medals awarded.
    Can be grouped by 'country' (NOC code) or 'sport' using the group_by query parameter.
    """
    filters = CommonFilters(
        year=year,
        season=season,
        country=country,
        sport=sport,
        gender=gender,
        medal=medal
    )
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        f_df = apply_filters(df, filters)
        
        if 'medal' not in f_df.columns:
            return []
            
        results = []
        
        if not group_by:
            # Overall Distribution
            medals = f_df['medal'].astype(str).str.lower()
            gold = int((medals == 'gold').sum())
            silver = int((medals == 'silver').sum())
            bronze = int((medals == 'bronze').sum())
            results.append(MedalDistributionItem(
                group="Overall",
                gold=gold,
                silver=silver,
                bronze=bronze,
                total=gold + silver + bronze
            ))
            
        elif group_by.strip().lower() == 'country':
            noc_col = 'noc' if 'noc' in f_df.columns else ('team' if 'team' in f_df.columns else None)
            if noc_col:
                noc_groups = f_df.groupby(noc_col)
                for noc, group in noc_groups:
                    medals = group['medal'].astype(str).str.lower()
                    gold = int((medals == 'gold').sum())
                    silver = int((medals == 'silver').sum())
                    bronze = int((medals == 'bronze').sum())
                    total = gold + silver + bronze
                    
                    if total > 0:
                        results.append(MedalDistributionItem(
                            group=str(noc),
                            gold=gold,
                            silver=silver,
                            bronze=bronze,
                            total=total
                        ))
                # Sort descending by total medals
                results.sort(key=lambda x: x.total, reverse=True)
                
        elif group_by.strip().lower() == 'sport':
            if 'sport' in f_df.columns:
                sport_groups = f_df.groupby('sport')
                for sport, group in sport_groups:
                    medals = group['medal'].astype(str).str.lower()
                    gold = int((medals == 'gold').sum())
                    silver = int((medals == 'silver').sum())
                    bronze = int((medals == 'bronze').sum())
                    total = gold + silver + bronze
                    
                    if total > 0:
                        results.append(MedalDistributionItem(
                            group=str(sport),
                            gold=gold,
                            silver=silver,
                            bronze=bronze,
                            total=total
                        ))
                # Sort descending by total medals
                results.sort(key=lambda x: x.total, reverse=True)
                
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid group_by parameter. Supported values: 'country', 'sport'."
            )
            
        return results
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error compiling medal distribution grouped by {group_by}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate medal distributions: {str(e)}")
