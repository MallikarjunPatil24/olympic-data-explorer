import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    """
    with TestClient(app) as c:
        yield c

# Checks that requesting the historical medal trends with a single year filter returns a 200 OK status.
def test_get_medal_trends_valid(client):
    # Act
    response = client.get("/api/medals?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# Checks that requesting the medal distribution grouped by country (NOC) returns a 200 OK status and correct grouping.
def test_get_medal_distribution_by_country_valid(client):
    # Act
    response = client.get("/api/medals/distribution?group_by=country")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "group" in data[0]
        assert "gold" in data[0]

# Checks that requesting medal trends with no active filters returns a 200 OK status and lists the general trend.
def test_get_medal_trends_no_filters(client):
    # Act
    response = client.get("/api/medals")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# Checks that requesting medal trends for a year with no matches returns a 200 OK status and an empty list.
def test_get_medal_trends_no_match(client):
    # Act
    response = client.get("/api/medals?year=1800")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data == []

# Checks that passing an invalid non-numeric year to the trends endpoint results in a 422 Unprocessable Entity error.
def test_get_medal_trends_invalid_year(client):
    # Act
    response = client.get("/api/medals?year=not-a-year")
    
    # Assert
    assert response.status_code == 422

# Mocking is used here to test medal trend calculations without querying the filesystem, using a controlled in-memory dataset instead.
@patch("app.services.data_service.DataService.get_data")
def test_get_medal_trends_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom Olympic athlete records to verify the historical year-by-year counts are aggregate correctly.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/medals")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, we have years 2008, 2010, 2012, 2016, 2018 (5 distinct years)
    assert len(data) == 5
    years = [item["year"] for item in data]
    assert 2008 in years
    assert 2012 in years

# Mocking is used here to verify grouping distributions (e.g. by sport) on a known set of sample rows, preventing database dependency.
@patch("app.services.data_service.DataService.get_data")
def test_get_medal_distribution_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to ensure that medal tallies are calculated against a predictable input subset.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/medals/distribution?group_by=sport")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, sports with medals are Swimming, Athletics, Tennis, Figure Skating, Gymnastics (5 sports)
    assert len(data) == 5
    sports = [item["group"] for item in data]
    assert "Swimming" in sports
    assert "Tennis" in sports
