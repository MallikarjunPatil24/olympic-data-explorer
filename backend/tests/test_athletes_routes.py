import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    Using the context manager ('with TestClient(app)') triggers the startup event
    to initialize the backend data service state.
    """
    with TestClient(app) as c:
        yield c

# Checks that searching for an athlete using a partial name query returns a 200 OK status and correct search results.
def test_search_athletes_valid(client):
    # Act
    response = client.get("/api/athletes?search=Phelps&limit=5")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "total_results" in data
    assert isinstance(data["results"], list)

# Checks that retrieving a valid athlete's profile by name returns a 200 OK status and detailed bio.
def test_get_athlete_profile_valid(client):
    # Act
    response = client.get("/api/athletes/Michael Phelps")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Michael Phelps"
    assert "noc" in data

# Checks that searching for a non-existent name returns a 200 OK status with zero results.
def test_search_athletes_no_match(client):
    # Act
    response = client.get("/api/athletes?search=nonexistentathlete123")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] == 0
    assert len(data["results"]) == 0

# Checks that requesting a profile for an athlete that does not exist returns a 404 Not Found error.
def test_get_athlete_profile_no_match(client):
    # Act
    response = client.get("/api/athletes/nonexistentathlete123")
    
    # Assert
    assert response.status_code == 404

# Checks that providing an invalid limit parameter value type triggers FastAPI's automatic 422 validation response.
def test_search_athletes_invalid_limit(client):
    # Act
    response = client.get("/api/athletes?limit=not-a-number")
    
    # Assert
    assert response.status_code == 422

# Mocking is used here to run athlete searches in isolation from the filesystem, validating the logic against a deterministic 7-row DataFrame.
@patch("app.services.data_service.DataService.get_data")
def test_search_athletes_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom athlete data without reading real CSV biography files.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/athletes?search=Bolt")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] == 1
    assert data["results"][0]["name"] == "Usain Bolt"
    assert data["results"][0]["noc"] == "JAM"

# Mocking is used here to verify detailed profile aggregation (like total appearances and medals) on a predictable mock DataFrame.
@patch("app.services.data_service.DataService.get_data")
def test_get_athlete_profile_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to define a custom test subject whose biography stats are fully known.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/athletes/Michael Phelps")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Michael Phelps"
    assert data["sex"] == "M"
    assert data["noc"] == "USA"
    assert data["total_appearances"] == 1
    assert data["gold_count"] == 1
    assert data["total_medals"] == 1
