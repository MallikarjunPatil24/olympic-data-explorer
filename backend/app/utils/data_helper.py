import logging
import pandas as pd
from app.models.filters import CommonFilters

logger = logging.getLogger(__name__)

def apply_filters(df: pd.DataFrame, filters: CommonFilters) -> pd.DataFrame:
    """
    Applies standard CommonFilters parameters to a Pandas DataFrame defensively.
    """
    if df is None or df.empty:
        return df
        
    filtered = df.copy()
    
    # 1. Year Filter
    if filters.year is not None:
        if 'year' in filtered.columns:
            filtered = filtered[filtered['year'] == filters.year]
            
    # 2. Season Filter
    if filters.season:
        if 'season' in filtered.columns:
            season_clean = filters.season.strip().lower()
            filtered = filtered[filtered['season'].astype(str).str.lower() == season_clean]
            
    # 3. Country Filter (checks both NOC code and Team name)
    if filters.country:
        country_clean = filters.country.strip().lower()
        noc_col = 'noc' if 'noc' in filtered.columns else None
        team_col = 'team' if 'team' in filtered.columns else None
        
        mask = pd.Series(False, index=filtered.index)
        if noc_col:
            mask |= filtered[noc_col].astype(str).str.lower() == country_clean
        if team_col:
            mask |= filtered[team_col].astype(str).str.lower() == country_clean
            
        if noc_col or team_col:
            filtered = filtered[mask]
            
    # 4. Sport Filter
    if filters.sport:
        if 'sport' in filtered.columns:
            sport_clean = filters.sport.strip().lower()
            filtered = filtered[filtered['sport'].astype(str).str.lower() == sport_clean]
            
    # 5. Gender Filter (expects M or F, maps first char)
    if filters.gender:
        g = filters.gender.strip().upper()
        gender_char = g[0] if g else ""
        if gender_char in ['M', 'F'] and 'sex' in filtered.columns:
            filtered = filtered[filtered['sex'].astype(str).str.upper() == gender_char]
            
    # 6. Medal Filter (Gold, Silver, Bronze, None)
    if filters.medal:
        if 'medal' in filtered.columns:
            medal_clean = filters.medal.strip().lower()
            filtered = filtered[filtered['medal'].astype(str).str.lower() == medal_clean]
            
    return filtered
