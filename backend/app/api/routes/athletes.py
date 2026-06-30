import logging
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Query
from app.models.responses import AthleteSearchResponse, AthleteSearchItem, AthleteProfileResponse, AppearanceItem

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("", response_model=AthleteSearchResponse)
async def search_athletes(
    request: Request,
    search: Optional[str] = Query(None, description="Case-insensitive partial athlete name search"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Performs case-insensitive partial searches on athlete names. Returns matching names with 
    summarized counts (appearances, medals, NOC affiliation), supporting limit/offset pagination.
    """
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return AthleteSearchResponse(total_results=0, limit=limit, offset=offset, results=[])
        
    try:
        # Check if ID column exists to handle duplicate names
        id_col = 'id' if 'id' in df.columns else ('athlete_id' if 'athlete_id' in df.columns else None)
        
        # Filter matching records by search criteria
        if search:
            search_clean = search.strip().lower()
            matching_df = df[df['name'].astype(str).str.lower().str.contains(search_clean, na=False)]
        else:
            matching_df = df
            
        results = []
        if id_col:
            # Group by unique ID
            grouped = matching_df.groupby(id_col)
            unique_ids = list(grouped.groups.keys())
            total_results = len(unique_ids)
            paginated_ids = unique_ids[offset:offset+limit]
            
            for aid in paginated_ids:
                ath_df = matching_df[matching_df[id_col] == aid]
                name = str(ath_df['name'].iloc[0])
                sex = str(ath_df['sex'].iloc[0]) if 'sex' in ath_df.columns else "U"
                noc = str(ath_df['noc'].iloc[0]) if 'noc' in ath_df.columns else "Unknown"
                team = str(ath_df['team'].iloc[0]) if 'team' in ath_df.columns else "Unknown"
                sport = str(ath_df['sport'].iloc[0]) if 'sport' in ath_df.columns else "Unknown"
                appearances = len(ath_df)
                medals = int(ath_df['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze']).sum())
                
                results.append(AthleteSearchItem(
                    name=name,
                    sex=sex,
                    noc=noc,
                    team=team,
                    sport=sport,
                    total_appearances=appearances,
                    total_medals=medals
                ))
        else:
            # Fallback: Group by Name
            unique_names = matching_df['name'].dropna().unique()
            total_results = len(unique_names)
            paginated_names = unique_names[offset:offset+limit]
            
            for name in paginated_names:
                ath_df = matching_df[matching_df['name'] == name]
                sex = str(ath_df['sex'].iloc[0]) if 'sex' in ath_df.columns else "U"
                noc = str(ath_df['noc'].iloc[0]) if 'noc' in ath_df.columns else "Unknown"
                team = str(ath_df['team'].iloc[0]) if 'team' in ath_df.columns else "Unknown"
                sport = str(ath_df['sport'].iloc[0]) if 'sport' in ath_df.columns else "Unknown"
                appearances = len(ath_df)
                medals = int(ath_df['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze']).sum())
                
                results.append(AthleteSearchItem(
                    name=str(name),
                    sex=sex,
                    noc=noc,
                    team=team,
                    sport=sport,
                    total_appearances=appearances,
                    total_medals=medals
                ))
                
        return AthleteSearchResponse(
            total_results=total_results,
            limit=limit,
            offset=offset,
            results=results
        )
    except Exception as e:
        logger.error(f"Error searching athletes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to query athletes database: {str(e)}")


@router.get("/{athlete_id_or_name}", response_model=AthleteProfileResponse)
async def get_athlete_profile(request: Request, athlete_id_or_name: str):
    """
    Returns the comprehensive profile of an athlete by matching either their numeric ID 
    or exact name string. Lists physical characteristics, overall medal tallies, 
    and chronological historical appearances.
    """
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No dataset loaded.")
        
    try:
        # Check if ID column exists
        id_col = 'id' if 'id' in df.columns else ('athlete_id' if 'athlete_id' in df.columns else None)
        
        athlete_df = pd.DataFrame()
        # Attempt to parse as ID integer
        try:
            parsed_id = int(athlete_id_or_name.strip())
            if id_col:
                athlete_df = df[df[id_col] == parsed_id]
        except ValueError:
            # Not an integer, or ID column not present; match by exact name
            pass
            
        if athlete_df.empty:
            name_clean = athlete_id_or_name.strip().lower()
            athlete_df = df[df['name'].astype(str).str.lower() == name_clean]
            
        if athlete_df.empty:
            raise HTTPException(status_code=404, detail=f"Athlete '{athlete_id_or_name}' not found in the dataset.")
            
        # Compile latest bio details (take non-null values from latest year appearance)
        sorted_ath_df = athlete_df.sort_values(by='year', ascending=False)
        latest_record = sorted_ath_df.iloc[0]
        
        name = str(latest_record['name'])
        sex = str(latest_record['sex']) if 'sex' in latest_record else "U"
        noc = str(latest_record['noc']) if 'noc' in latest_record else "Unknown"
        team = str(latest_record['team']) if 'team' in latest_record else "Unknown"
        
        # Get age/height/weight (first available in latest records)
        age = float(latest_record['age']) if ('age' in latest_record and pd.notnull(latest_record['age'])) else None
        height = float(latest_record['height']) if ('height' in latest_record and pd.notnull(latest_record['height'])) else None
        weight = float(latest_record['weight']) if ('weight' in latest_record and pd.notnull(latest_record['weight'])) else None
        
        # Count overall medals
        medals_col = athlete_df['medal'].astype(str).str.lower()
        gold = int((medals_col == 'gold').sum())
        silver = int((medals_col == 'silver').sum())
        bronze = int((medals_col == 'bronze').sum())
        total_medals = gold + silver + bronze
        
        # List individual appearances
        appearances = []
        for _, row in sorted_ath_df.iterrows():
            games = str(row['games']) if 'games' in row else f"{row.get('year', '')} {row.get('season', '')}".strip()
            year = int(row['year']) if 'year' in row else 0
            season = str(row['season']) if 'season' in row else "Unknown"
            city = str(row['city']) if 'city' in row else "Unknown"
            sport = str(row['sport']) if 'sport' in row else "Unknown"
            event = str(row['event']) if 'event' in row else "Unknown"
            medal = str(row['medal']) if 'medal' in row else "None"
            
            appearances.append(AppearanceItem(
                games=games,
                year=year,
                season=season,
                city=city,
                sport=sport,
                event=event,
                medal=medal
            ))
            
        return AthleteProfileResponse(
            name=name,
            sex=sex,
            age_latest=age,
            height_latest=height,
            weight_latest=weight,
            noc=noc,
            team=team,
            total_appearances=len(athlete_df),
            gold_count=gold,
            silver_count=silver,
            bronze_count=bronze,
            total_medals=total_medals,
            appearances=appearances
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error retrieving athlete profile for {athlete_id_or_name}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load athlete profile: {str(e)}")
