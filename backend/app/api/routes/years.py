import logging
from typing import List
from fastapi import APIRouter, Request, HTTPException
from app.models.responses import YearEditionItem

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("", response_model=List[YearEditionItem])
async def get_olympic_years(request: Request):
    """
    Returns a distinct list of Olympic editions (year + season combinations)
    along with participating headcounts, events, sports, and cities.
    Useful for timeline-based maps or navigation menus.
    """
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return []
        
    try:
        # Group by year and season to represent unique Olympic editions
        group_cols = []
        if 'year' in df.columns:
            group_cols.append('year')
        if 'season' in df.columns:
            group_cols.append('season')
            
        if not group_cols:
            return []
            
        grouped = df.groupby(group_cols)
        results = []
        
        for keys, group in grouped:
            # Handle single key (only year or only season) vs composite tuple
            year = int(keys[0] if isinstance(keys, tuple) else keys)
            season = str(keys[1] if isinstance(keys, tuple) else "")
            
            # Fetch games label and city
            games_label = str(group['games'].iloc[0]) if 'games' in group.columns else f"{year} {season}".strip()
            city = str(group['city'].iloc[0]) if 'city' in group.columns else "Unknown"
            
            # Calculate counts for this edition
            athlete_count = int(group['name'].nunique()) if 'name' in group.columns else 0
            
            country_count = 0
            if 'noc' in group.columns:
                country_count = int(group['noc'].nunique())
            elif 'team' in group.columns:
                country_count = int(group['team'].nunique())
                
            sport_count = int(group['sport'].nunique()) if 'sport' in group.columns else 0
            event_count = int(group['event'].nunique()) if 'event' in group.columns else 0
            
            # Calculate gender splits based on unique athlete names in this edition
            male_athlete_count = 0
            female_athlete_count = 0
            if 'sex' in group.columns and 'name' in group.columns:
                unique_athletes = group.drop_duplicates(subset=['name'])
                sex_counts = unique_athletes['sex'].value_counts()
                male_athlete_count = int(sex_counts.get('M', 0))
                female_athlete_count = int(sex_counts.get('F', 0))
                
            results.append(YearEditionItem(
                year=year,
                season=season,
                games=games_label,
                city=city,
                athlete_count=athlete_count,
                country_count=country_count,
                sport_count=sport_count,
                event_count=event_count,
                male_athlete_count=male_athlete_count,
                female_athlete_count=female_athlete_count
            ))
            
        # Sort descending by year, then season name
        results.sort(key=lambda x: (x.year, x.season), reverse=True)
        return results
    except Exception as e:
        logger.error(f"Error compiling Olympic years summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate Olympic editions timeline: {str(e)}")
