import pytest
import pandas as pd
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

# Checks that requesting the list of Olympic years/editions returns a 200 OK status.
def test_get_olympic_years_valid(client):
    # Act
    response = client.get("/api/years")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "year" in data[0]
        assert "season" in data[0]

# Mocking is used here to isolate the years/editions aggregation logic, running it against a deterministic 7-row DataFrame.
@patch("app.services.data_service.DataService.get_data")
def test_get_olympic_years_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom Olympic athlete records to verify the historical year-by-year counts are aggregate correctly.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/years")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, we have 5 distinct editions: 2018 Winter, 2016 Summer, 2012 Summer, 2010 Winter, 2008 Summer
    assert len(data) == 5
    # The output is sorted descending by year, then season
    assert data[0]["year"] == 2018
    assert data[0]["season"] == "Winter"
    assert data[0]["athlete_count"] == 1
    assert data[0]["sport_count"] == 1

# Mocking is used here to verify that if the underlying database is empty, the endpoint handles it gracefully and returns an empty list.
@patch("app.services.data_service.DataService.get_data")
def test_get_olympic_years_empty_mocked(mock_get_data, client):
    # Arrange
    # Mocking is used to inject an empty DataFrame to test negative path coverage defensively.
    mock_get_data.return_value = pd.DataFrame()
    
    # Act
    response = client.get("/api/years")
    
    # Assert
    assert response.status_code == 200
    assert response.json() == []
