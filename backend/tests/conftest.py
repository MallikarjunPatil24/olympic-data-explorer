import pytest
import pandas as pd

@pytest.fixture
def olympics_sample() -> pd.DataFrame:
    """
    Provides a small, realistic fake DataFrame (7 rows) for unit testing filters.
    Includes columns: name, sex, age, team, noc, year, season, sport, medal.
    Contains USA, JAM, KOR, SUI, JPN, with multiple sports, years, genders.
    JAM (Jamaica) serves as an edgecase with exactly 1 record.
    """
    data = [
        {
            "name": "Michael Phelps",
            "sex": "M",
            "age": 23,
            "team": "United States",
            "noc": "USA",
            "year": 2008,
            "season": "Summer",
            "sport": "Swimming",
            "medal": "Gold"
        },
        {
            "name": "Usain Bolt",
            "sex": "M",
            "age": 21,
            "team": "Jamaica",
            "noc": "JAM",  # Edgecase country with only 1 record
            "year": 2008,
            "season": "Summer",
            "sport": "Athletics",
            "medal": "Gold"
        },
        {
            "name": "Serena Williams",
            "sex": "F",
            "age": 30,
            "team": "United States",
            "noc": "USA",
            "year": 2012,
            "season": "Summer",
            "sport": "Tennis",
            "medal": "Gold"
        },
        {
            "name": "Yuna Kim",
            "sex": "F",
            "age": 19,
            "team": "South Korea",
            "noc": "KOR",
            "year": 2010,
            "season": "Winter",
            "sport": "Figure Skating",
            "medal": "Gold"
        },
        {
            "name": "Simone Biles",
            "sex": "F",
            "age": 19,
            "team": "United States",
            "noc": "USA",
            "year": 2016,
            "season": "Summer",
            "sport": "Gymnastics",
            "medal": "Gold"
        },
        {
            "name": "Roger Federer",
            "sex": "M",
            "age": 30,
            "team": "Switzerland",
            "noc": "SUI",
            "year": 2012,
            "season": "Summer",
            "sport": "Tennis",
            "medal": "Silver"
        },
        {
            "name": "Yuzuru Hanyu",
            "sex": "M",
            "age": 23,
            "team": "Japan",
            "noc": "JPN",
            "year": 2018,
            "season": "Winter",
            "sport": "Figure Skating",
            "medal": "Gold"
        }
    ]
    return pd.DataFrame(data)
