import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.sports import _sport_detail_cache, _sports_summary_cache

@pytest.fixture(autouse=True)
def clear_sports_routes_caches():
    """
    Clears the in-memory route caches in sports.py before and after each test.
    """
    _sport_detail_cache.clear()
    _sports_summary_cache.clear()
    yield
    _sport_detail_cache.clear()
    _sports_summary_cache.clear()

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    """
    with TestClient(app) as c:
        yield c

# Checks that requesting sport details for a valid sport returns a 200 OK status and correct sport properties.
def test_get_sport_detail_valid(client):
    # Act
    response = client.get("/api/sports/Swimming")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["sport"] == "Swimming"
    assert "participating_countries_count" in data
    assert "gender_split" in data

# Checks that requesting details for a sport that does not exist in the dataset returns a 404 Not Found error.
def test_get_sport_detail_not_found(client):
    # Act
    response = client.get("/api/sports/nonexistentsport123")
    
    # Assert
    assert response.status_code == 404

# Mocking is used here to test sport details calculations against a deterministic 7-row DataFrame, avoiding large CSV file reads.
@patch("app.services.data_service.DataService.get_data")
def test_get_sport_detail_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom Olympic athlete records to verify the historical year-by-year counts are aggregate correctly.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/sports/Tennis")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["sport"] == "Tennis"
    assert data["participating_countries_count"] == 2 # USA and SUI in olympics_sample
    assert data["gender_split"]["male_count"] == 1 # Roger Federer
    assert data["gender_split"]["female_count"] == 1 # Serena Williams
    assert len(data["historical_trend"]) == 1 # Year 2012
    assert len(data["top_athletes"]) == 2 # Serena and Federer

# Mocking is used here to test route behavior when the underlying dataset is missing critical columns, ensuring 500 status safety.
@patch("app.services.data_service.DataService.get_data")
def test_get_sport_detail_missing_column(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to simulate a corrupt/mismatched DataFrame without a sport column.
    mock_get_data.return_value = olympics_sample.drop(columns=["sport"])
    
    # Act
    response = client.get("/api/sports/Swimming")
    
    # Assert
    assert response.status_code == 500
