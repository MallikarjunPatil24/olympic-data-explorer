import pytest
import pandas as pd
from app.utils.data_helper import apply_filters
from app.models.filters import CommonFilters

# Checks that filtering by a specific year returns only matching records for that year.
def test_filter_by_year(olympics_sample):
    # Arrange
    filters = CommonFilters(year=2008)
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 2
    assert all(result["year"] == 2008)

# Checks that filtering by season (case-insensitive) matches only records from that season.
def test_filter_by_season(olympics_sample):
    # Arrange
    filters = CommonFilters(season="winter")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 2
    assert all(result["season"] == "Winter")

# Checks that filtering by country matches either the team name or NOC code case-insensitively.
def test_filter_by_country(olympics_sample):
    # Arrange
    filters = CommonFilters(country="usa")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 3
    assert all(result["noc"] == "USA")

# Checks that filtering by a specific sport matches the sport name case-insensitively.
def test_filter_by_sport(olympics_sample):
    # Arrange
    filters = CommonFilters(sport="tennis")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 2
    assert all(result["sport"] == "Tennis")

# Checks that filtering by gender matches the first character case-insensitively (e.g. Female -> F).
def test_filter_by_gender(olympics_sample):
    # Arrange
    filters = CommonFilters(gender="Female")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 3
    assert all(result["sex"] == "F")

# Checks that filtering by a medal matches the medal type case-insensitively.
def test_filter_by_medal(olympics_sample):
    # Arrange
    filters = CommonFilters(medal="silver")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == 1
    assert result.iloc[0]["name"] == "Roger Federer"

# Checks that filtering by a year that doesn't exist in the dataset returns an empty DataFrame.
def test_filter_by_year_no_match(olympics_sample):
    # Arrange
    filters = CommonFilters(year=2024)
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert result.empty

# Checks that filtering by a season that doesn't exist returns an empty DataFrame.
def test_filter_by_season_no_match(olympics_sample):
    # Arrange
    filters = CommonFilters(season="Autumn")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert result.empty

# Checks that filtering by a country that doesn't exist in the dataset returns an empty DataFrame.
def test_filter_by_country_no_match(olympics_sample):
    # Arrange
    filters = CommonFilters(country="FRA")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert result.empty

# Checks that filtering by a sport that doesn't exist in the dataset returns an empty DataFrame.
def test_filter_by_sport_no_match(olympics_sample):
    # Arrange
    filters = CommonFilters(sport="Basketball")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert result.empty

# Checks that filtering by a gender that has no records in a specific subset returns an empty DataFrame.
def test_filter_by_gender_no_match(olympics_sample):
    # Arrange
    # Subset to only male records first, then apply Female filter
    males_only = olympics_sample[olympics_sample["sex"] == "M"]
    filters = CommonFilters(gender="F")
    
    # Act
    result = apply_filters(males_only, filters)
    
    # Assert
    assert result.empty

# Checks that filtering by a medal type that doesn't exist in the dataset returns an empty DataFrame.
def test_filter_by_medal_no_match(olympics_sample):
    # Arrange
    filters = CommonFilters(medal="Bronze")
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert result.empty

# Checks that applying combinations of year, country, and sport filters returns the expected number of matching rows.
@pytest.mark.parametrize(
    "year, country, sport, expected_count",
    [
        (2008, "USA", "Swimming", 1),      # Michael Phelps
        (2012, "USA", "Tennis", 1),        # Serena Williams
        (2008, "JAM", "Athletics", 1),     # Usain Bolt (single-record edgecase country)
        (2012, "USA", "Gymnastics", 0),    # No match combination
    ]
)
def test_apply_filters_parameterized(olympics_sample, year, country, sport, expected_count):
    # Arrange
    filters = CommonFilters(year=year, country=country, sport=sport)
    
    # Act
    result = apply_filters(olympics_sample, filters)
    
    # Assert
    assert len(result) == expected_count
