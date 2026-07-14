import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.countries import _countries_summary_cache, _country_profile_cache

@pytest.fixture(autouse=True)
def clear_countries_cache():
    """
    Clears the in-memory route caches in countries.py before and after each test.
    """
    _countries_summary_cache.clear()
    _country_profile_cache.clear()
    yield
    _countries_summary_cache.clear()
    _country_profile_cache.clear()

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    """
    with TestClient(app) as c:
        yield c

# Checks that requesting the countries summary with a single year filter returns a 200 OK status.
def test_get_countries_summary_valid(client):
    # Act
    response = client.get("/api/countries?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# Checks that requesting a profile for a valid country code (e.g. USA) returns a 200 OK status and correct country info.
def test_get_country_profile_valid(client):
    # Act
    response = client.get("/api/countries/USA")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["noc"] == "USA"
    assert "country_name" in data

# Checks that requesting the countries summary with no active filters returns a 200 OK status and the full country listing.
def test_get_countries_summary_no_filters(client):
    # Act
    response = client.get("/api/countries")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# Checks that requesting the countries summary with filters that match nothing returns an empty list.
def test_get_countries_summary_no_match(client):
    # Act
    response = client.get("/api/countries?year=1800")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data == []

# Checks that requesting a profile for a country code that doesn't exist in the database returns a 404 Not Found error.
def test_get_country_profile_no_match(client):
    # Act
    response = client.get("/api/countries/NONEXISTENT")
    
    # Assert
    assert response.status_code == 404

# Checks that passing an invalid year type to the summary endpoint results in a 422 Unprocessable Entity error.
def test_get_countries_summary_invalid_year(client):
    # Act
    response = client.get("/api/countries?year=not-a-year")
    
    # Assert
    assert response.status_code == 422

# Mocking is used here to test country medal aggregations against a deterministic in-memory dataset, preventing real file dependencies.
@patch("app.services.data_service.DataService.get_data")
def test_get_countries_summary_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom athlete data without reading real CSV biography files.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/countries")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, we have USA, JAM, KOR, SUI, JPN (5 countries)
    assert len(data) == 5
    nocs = [item["noc"] for item in data]
    assert "USA" in nocs
    assert "JAM" in nocs

# Mocking is used here to verify detailed country profile parsing (e.g. medal counts and top sports) on a known mock dataset.
@patch("app.services.data_service.DataService.get_data")
def test_get_country_profile_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to ensure profile logic computes deterministically against our test subject.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/countries/JAM")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["noc"] == "JAM"
    assert data["total_athletes_sent"] == 1
    assert data["gold_count"] == 1
    assert data["total_medals"] == 1
