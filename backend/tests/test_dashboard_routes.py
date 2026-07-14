import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.dashboard import _stats_cache, _age_cache

@pytest.fixture(autouse=True)
def clear_dashboard_cache():
    """
    Clears the in-memory route caches in dashboard.py before and after each test.
    """
    _stats_cache.clear()
    _age_cache.clear()
    yield
    _stats_cache.clear()
    _age_cache.clear()

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    """
    with TestClient(app) as c:
        yield c

# Checks that requesting high-level dashboard indicators with a single filter returns a 200 OK status.
def test_get_dashboard_stats_valid(client):
    # Act
    response = client.get("/api/dashboard?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "total_athletes" in data
    assert "total_medals" in data

# Checks that requesting the age distribution of athletes with a single filter returns a 200 OK status.
def test_get_age_distribution_valid(client):
    # Act
    response = client.get("/api/dashboard/age-distribution?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# Checks that requesting dashboard stats with no filters returns a 200 OK status and positive counts.
def test_get_dashboard_stats_no_filters(client):
    # Act
    response = client.get("/api/dashboard")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["total_athletes"] > 0

# Checks that requesting dashboard stats with filters that match nothing returns zero counts.
def test_get_dashboard_stats_no_match(client):
    # Act
    response = client.get("/api/dashboard?year=1800")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["total_athletes"] == 0
    assert data["total_medals"] == 0

# Checks that passing an invalid non-numeric year value to dashboard stats endpoint returns a 422 Unprocessable Entity error.
def test_get_dashboard_stats_invalid_year(client):
    # Act
    response = client.get("/api/dashboard?year=not-a-year")
    
    # Assert
    assert response.status_code == 422

# Mocking is used here to test high-level statistical summaries against a deterministic test DataFrame, bypassing disk reads.
@patch("app.services.data_service.DataService.get_data")
def test_get_dashboard_stats_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom Olympic athlete records to verify the historical year-by-year counts are aggregate correctly.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/dashboard")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, we have 7 unique athletes, 5 countries, 5 sports, 7 games
    assert data["total_athletes"] == 7
    assert data["total_countries"] == 5
    assert data["total_sports"] == 5
    assert data["total_medals"] == 7  # All 7 rows in the mock sample represent won medals (6 Gold, 1 Silver)
    assert data["total_games"] == 5

# Mocking is used here to test age distribution calculations on a predictable mock DataFrame, preventing file access.
@patch("app.services.data_service.DataService.get_data")
def test_get_age_distribution_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to test age bin sorting defensively.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/dashboard/age-distribution")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Ages in olympics_sample: 23, 21, 30, 19, 19, 30, 23
    # 19, 19: 15-19 bucket (count 2)
    # 21, 23, 23: 20-24 bucket (count 3)
    # 30, 30: 30-34 bucket (count 2)
    # Total count across all buckets should equal 7
    total_count = sum(item["count"] for item in data)
    assert total_count == 7
