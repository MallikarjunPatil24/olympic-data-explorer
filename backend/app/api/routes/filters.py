import logging
from fastapi import APIRouter, Request, HTTPException
from app.models.responses import FilterOptionsResponse, CountryOption

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("", response_model=FilterOptionsResponse)
async def get_filter_options(request: Request):
    """
    Provides all unique dropdown filter parameters computed from the dataset:
    years, seasons, country structures (NOC code + Team name), sports, genders, and medals.
    """
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    if df is None or df.empty:
        return FilterOptionsResponse(
            years=[], seasons=[], countries=[], sports=[], genders=[], medals=[]
        )
        
    try:
        # Years (sorted descending)
        years = sorted(df['year'].dropna().unique().tolist(), reverse=True) if 'year' in df.columns else []
        
        # Seasons (Summer/Winter)
        seasons = sorted(df['season'].dropna().unique().tolist()) if 'season' in df.columns else []
        
        # Sports (Athletics, Swimming, Gymnastics, etc.)
        sports = sorted(df['sport'].dropna().unique().tolist()) if 'sport' in df.columns else []
        
        # Genders (M, F)
        genders = sorted(df['sex'].dropna().unique().tolist()) if 'sex' in df.columns else []
        
        # Medal Types (Gold, Silver, Bronze, None)
        medals = sorted(df['medal'].dropna().unique().tolist()) if 'medal' in df.columns else []
        
        # Countries mapping (NOC -> Team Name lookup options)
        countries_list = []
        if 'noc' in df.columns:
            team_col = 'team' if 'team' in df.columns else 'noc'
            # Group by NOC and retrieve the primary Team name
            grouped = df.groupby('noc')[team_col].agg(lambda x: x.mode().iloc[0] if not x.empty else str(x.name))
            for noc, team in sorted(grouped.items()):
                countries_list.append(CountryOption(noc=str(noc), name=str(team)))
        else:
            if 'team' in df.columns:
                for team in sorted(df['team'].dropna().unique()):
                    countries_list.append(CountryOption(noc=str(team)[:3].upper(), name=str(team)))
                    
        return FilterOptionsResponse(
            years=[int(y) for y in years],
            seasons=[str(s) for s in seasons],
            countries=countries_list,
            sports=[str(sp) for sp in sports],
            genders=[str(g) for g in genders],
            medals=[str(m) for m in medals]
        )
    except Exception as e:
        logger.error(f"Error compiling filter options: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load filter options: {str(e)}")
