from typing import List, Optional
from pydantic import BaseModel

# --- Common Schema Items ---
class MedalTrendItem(BaseModel):
    year: int
    gold: int
    silver: int
    bronze: int
    total: int

# --- Filter Endpoint ---
class CountryOption(BaseModel):
    noc: str
    name: str

class FilterOptionsResponse(BaseModel):
    years: List[int]
    seasons: List[str]
    countries: List[CountryOption]
    sports: List[str]
    genders: List[str]
    medals: List[str]

# --- Dashboard Endpoint ---
class DashboardStatsResponse(BaseModel):
    total_athletes: int
    total_countries: int
    total_sports: int
    total_events: int
    total_medals: int
    total_games: int

# --- Country Endpoints ---
class CountryMedalsItem(BaseModel):
    noc: str
    country_name: str
    athlete_count: int
    gold_count: int
    silver_count: int
    bronze_count: int
    total_medals: int

class SportMedalItem(BaseModel):
    sport: str
    gold: int
    silver: int
    bronze: int
    total: int

class CountryProfileResponse(BaseModel):
    noc: str
    country_name: str
    gold_count: int
    silver_count: int
    bronze_count: int
    total_medals: int
    total_athletes_sent: int
    medal_trend: List[MedalTrendItem]
    top_sports: List[SportMedalItem]

# --- Sport Endpoints ---
class SportItemResponse(BaseModel):
    sport: str
    athlete_count: int
    event_count: int
    medal_count: int

class GenderSplit(BaseModel):
    male_count: int
    female_count: int
    male_pct: float
    female_pct: float

class SportAthleteItem(BaseModel):
    name: str
    noc: str
    gold_count: int
    silver_count: int
    bronze_count: int
    total_medals: int

class SportDetailResponse(BaseModel):
    sport: str
    participating_countries_count: int
    gender_split: GenderSplit
    historical_trend: List[MedalTrendItem]
    top_athletes: List[SportAthleteItem]

# --- Athlete Endpoints ---
class AthleteSearchItem(BaseModel):
    name: str
    sex: str
    noc: str
    team: str
    sport: str
    total_appearances: int
    total_medals: int

class AthleteSearchResponse(BaseModel):
    total_results: int
    limit: int
    offset: int
    results: List[AthleteSearchItem]

class AppearanceItem(BaseModel):
    games: str
    year: int
    season: str
    city: str
    sport: str
    event: str
    medal: str

class AthleteProfileResponse(BaseModel):
    name: str
    sex: str
    age_latest: Optional[float] = None
    height_latest: Optional[float] = None
    weight_latest: Optional[float] = None
    noc: str
    team: str
    total_appearances: int
    gold_count: int
    silver_count: int
    bronze_count: int
    total_medals: int
    appearances: List[AppearanceItem]

# --- Medal Endpoints ---
class MedalYearTrendItem(BaseModel):
    year: int
    games: str
    gold_count: int
    silver_count: int
    bronze_count: int
    total_medals: int

class MedalDistributionItem(BaseModel):
    group: str
    gold: int
    silver: int
    bronze: int
    total: int

# --- Year/Editions Endpoints ---
class YearEditionItem(BaseModel):
    year: int
    season: str
    games: str
    city: str
    athlete_count: int
    country_count: int
    sport_count: int
    event_count: int
    male_athlete_count: Optional[int] = None
    female_athlete_count: Optional[int] = None

# --- Age Distribution Endpoints ---
class AgeBucketItem(BaseModel):
    range: str
    count: int
