import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, Query, Depends
from pydantic import BaseModel
from app.utils.data_helper import apply_filters
from app.models.filters import CommonFilters

router = APIRouter()
logger = logging.getLogger(__name__)


class InsightItem(BaseModel):
    title: str
    text: str


class InsightsResponse(BaseModel):
    insights: List[InsightItem]
    fact: Optional[str] = None


class OnThisDayResponse(BaseModel):
    message: str
    year: Optional[int] = None
    city: Optional[str] = None
    host: Optional[str] = None


class HeatmapCell(BaseModel):
    country: str
    noc: str
    year: int
    total: int


class CompareItem(BaseModel):
    label: str
    gold: int
    silver: int
    bronze: int
    total: int
    athletes: int


class CompareResponse(BaseModel):
    countries: List[CompareItem]
    sports: List[CompareItem]


@router.get("/insights", response_model=InsightsResponse)
async def get_insights(request: Request):
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService not initialized")
    df = data_service.get_data()
    if df is None or df.empty:
        return InsightsResponse(insights=[], fact="Olympic history spans from 1896 to 2022.")

    insights = []
    try:
        if 'noc' in df.columns and 'medal' in df.columns:
            medals = df['medal'].astype(str).str.lower()
            medal_df = df[medals.isin(['gold', 'silver', 'bronze'])]
            if not medal_df.empty:
                top = medal_df.groupby('noc').size().sort_values(ascending=False)
                if len(top) > 0:
                    top_noc = top.index[0]
                    team = str(df[df['noc'] == top_noc]['team'].mode().iloc[0]) if 'team' in df.columns else top_noc
                    insights.append(InsightItem(
                        title="Top Medal Nation",
                        text=f"{team} ({top_noc}) leads the all-time medal count with {int(top.iloc[0]):,} medals in the dataset."
                    ))

        if 'name' in df.columns:
            athlete_medals = df.copy()
            athlete_medals['is_medal'] = athlete_medals['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze']) if 'medal' in df.columns else False
            if athlete_medals['is_medal'].any():
                top_ath = athlete_medals[athlete_medals['is_medal']].groupby('name').size().sort_values(ascending=False)
                if len(top_ath) > 0:
                    insights.append(InsightItem(
                        title="Most Decorated Athlete",
                        text=f"{top_ath.index[0]} holds the record with {int(top_ath.iloc[0])} Olympic medals in this dataset."
                    ))

        if 'sport' in df.columns and 'medal' in df.columns:
            sport_medals = df[df['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze'])]
            if not sport_medals.empty:
                top_sport = sport_medals.groupby('sport').size().sort_values(ascending=False)
                insights.append(InsightItem(
                    title="Most Medals by Sport",
                    text=f"{top_sport.index[0]} has produced the most medals ({int(top_sport.iloc[0]):,}) across all Olympic editions."
                ))

        if 'sex' in df.columns and 'name' in df.columns:
            female_pct = (df[df['sex'] == 'F']['name'].nunique() / max(df['name'].nunique(), 1)) * 100
            insights.append(InsightItem(
                title="Gender Participation",
                text=f"Women represent {female_pct:.1f}% of unique athletes in the Olympic dataset."
            ))

        fact = insights[0].text if insights else f"The dataset contains {len(df):,} records across Olympic history."
        return InsightsResponse(insights=insights[:5], fact=fact)
    except Exception as e:
        logger.error(f"Insights error: {e}", exc_info=True)
        return InsightsResponse(insights=[], fact="Explore 126 years of Olympic history from 1896 to 2022.")


@router.get("/on-this-day", response_model=OnThisDayResponse)
async def get_on_this_day(request: Request):
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService not initialized")
    df = data_service.get_data()
    today = datetime.now()
    month_day = today.strftime("%d %B").lstrip("0")

    if df is None or df.empty or 'year' not in df.columns:
        return OnThisDayResponse(
            message=f"Today is {today.strftime('%B %d')} — explore Olympic history from 1896 to 2022.",
            year=2022, city="Beijing", host="CHN"
        )

    try:
        # Find edition closest to today's month
        if 'city' in df.columns and 'games' in df.columns:
            editions = df.groupby(['year', 'city']).first().reset_index()
            if not editions.empty:
                pick = editions.iloc[today.day % len(editions)]
                games = str(pick.get('games', f"{pick['year']} Olympics"))
                city = str(pick.get('city', 'Unknown'))
                host = str(pick.get('noc', '')) if 'noc' in pick else None
                return OnThisDayResponse(
                    message=f"On {today.strftime('%B %d')}: The {games} were held in {city}.",
                    year=int(pick['year']),
                    city=city,
                    host=host
                )
        return OnThisDayResponse(message=f"Today is {month_day} — browse Olympic editions from 1896 to 2022.")
    except Exception as e:
        logger.error(f"On-this-day error: {e}", exc_info=True)
        return OnThisDayResponse(message="Explore Olympic history spanning over a century of sport.")


@router.get("/heatmap", response_model=List[HeatmapCell])
async def get_heatmap(
    request: Request,
    year: Optional[int] = Query(None, description="Filter by Olympic year (e.g., 2008)"),
    season: Optional[str] = Query(None, description="Filter by season (Summer or Winter)"),
    country: Optional[str] = Query(None, description="Filter by Country NOC code or Team name (e.g., USA)"),
    sport: Optional[str] = Query(None, description="Filter by sport name (e.g., Athletics)"),
    gender: Optional[str] = Query(None, alias="sex", description="Filter by gender (M or F)"),
    medal: Optional[str] = Query(None, description="Filter by medal type (Gold, Silver, Bronze, or None)")
):
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
        raise HTTPException(status_code=500, detail="DataService not initialized")
    df = data_service.get_data()
    if df is None or df.empty:
        return []

    try:
        f_df = apply_filters(df, filters)
        if 'year' not in f_df.columns or 'noc' not in f_df.columns:
            return []

        medals = f_df['medal'].astype(str).str.lower().isin(['gold', 'silver', 'bronze']) if 'medal' in f_df.columns else None
        medal_df = f_df[medals] if medals is not None else f_df

        team_col = 'team' if 'team' in medal_df.columns else 'noc'
        results = []
        grouped = medal_df.groupby(['noc', 'year'])
        for (noc, year), group in grouped:
            total = len(group)
            if total > 0:
                country = str(group[team_col].mode().iloc[0]) if team_col in group.columns else str(noc)
                results.append(HeatmapCell(country=country, noc=str(noc), year=int(year), total=total))

        # Limit to top 20 countries by total medals for readability
        country_totals = {}
        for r in results:
            country_totals[r.noc] = country_totals.get(r.noc, 0) + r.total
        top_nocs = sorted(country_totals, key=country_totals.get, reverse=True)[:20]
        results = [r for r in results if r.noc in top_nocs]
        results.sort(key=lambda x: (x.noc, x.year))
        return results
    except Exception as e:
        logger.error(f"Heatmap error: {e}", exc_info=True)
        return []


@router.get("/compare", response_model=CompareResponse)
async def compare_entities(
    request: Request,
    countries: Optional[str] = Query(None, description="Comma-separated NOC codes"),
    sports: Optional[str] = Query(None, description="Comma-separated sport names"),
):
    data_service = getattr(request.app.state, "data_service", None)
    if not data_service:
        raise HTTPException(status_code=500, detail="DataService not initialized")
    df = data_service.get_data()
    if df is None or df.empty:
        return CompareResponse(countries=[], sports=[])

    country_results = []
    sport_results = []

    try:
        if countries:
            for noc in [c.strip().upper() for c in countries.split(',') if c.strip()]:
                c_df = df[df['noc'].str.upper() == noc] if 'noc' in df.columns else df.iloc[0:0]
                if c_df.empty:
                    continue
                medals = c_df['medal'].astype(str).str.lower()
                team = str(c_df['team'].mode().iloc[0]) if 'team' in c_df.columns else noc
                country_results.append(CompareItem(
                    label=f"{team} ({noc})",
                    gold=int((medals == 'gold').sum()),
                    silver=int((medals == 'silver').sum()),
                    bronze=int((medals == 'bronze').sum()),
                    total=int(medals.isin(['gold', 'silver', 'bronze']).sum()),
                    athletes=int(c_df['name'].nunique()) if 'name' in c_df.columns else 0
                ))

        if sports:
            for sport in [s.strip() for s in sports.split(',') if s.strip()]:
                s_df = df[df['sport'].str.lower() == sport.lower()] if 'sport' in df.columns else df.iloc[0:0]
                if s_df.empty:
                    continue
                medals = s_df['medal'].astype(str).str.lower()
                sport_results.append(CompareItem(
                    label=sport,
                    gold=int((medals == 'gold').sum()),
                    silver=int((medals == 'silver').sum()),
                    bronze=int((medals == 'bronze').sum()),
                    total=int(medals.isin(['gold', 'silver', 'bronze']).sum()),
                    athletes=int(s_df['name'].nunique()) if 'name' in s_df.columns else 0
                ))

        return CompareResponse(countries=country_results, sports=sport_results)
    except Exception as e:
        logger.error(f"Compare error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
