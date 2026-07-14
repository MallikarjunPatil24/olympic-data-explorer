from dataclasses import dataclass
from typing import Optional

@dataclass
class CommonFilters:
    """
    Standard query parameters for filtering Olympic datasets.
    """
    year: Optional[int] = None
    season: Optional[str] = None
    country: Optional[str] = None
    sport: Optional[str] = None
    gender: Optional[str] = None
    medal: Optional[str] = None

