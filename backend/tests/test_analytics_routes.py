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

# Checks that requesting Olympic history insights returns a 200 OK status.
def test_get_insights_valid(client):
    # Act
    response = client.get("/api/analytics/insights")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data

# Checks that requesting historical events for 'on this day' returns a 200 OK status.
def test_get_on_this_day_valid(client):
    # Act
    response = client.get("/api/analytics/on-this-day")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

# Checks that requesting the medals heatmap with a single filter returns a 200 OK status.
def test_get_heatmap_valid(client):
    # Act
    response = client.get("/api/analytics/heatmap?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# Checks that requesting a comparison between entity lists returns a 200 OK status.
def test_compare_entities_valid(client):
    # Act
    response = client.get("/api/analytics/compare?countries=USA,JAM&sports=Swimming,Athletics")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "countries" in data
    assert "sports" in data

# Checks that passing an invalid year type to the heatmap endpoint triggers a 422 validation response.
def test_get_heatmap_invalid_year(client):
    # Act
    response = client.get("/api/analytics/heatmap?year=not-a-year")
    
    # Assert
    assert response.status_code == 422

# Mocking is used here to test insight generation logic on a predictable, mock dataset without hitting the filesystem.
@patch("app.services.data_service.DataService.get_data")
def test_get_insights_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to inject custom Olympic athlete records to verify insights are computed correctly.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/analytics/insights")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert "fact" in data

# Mocking is used here to test comparison operations (like country/sport headcounts and medals) in isolation.
@patch("app.services.data_service.DataService.get_data")
def test_compare_entities_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Mocking is used to verify entity comparisons are calculated against custom, predictable records.
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/analytics/compare?countries=USA,JAM&sports=Swimming")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data["countries"]) > 0
    assert len(data["sports"]) > 0
    # Michael Phelps (Swimming, USA) in olympics_sample
    usa_comp = next((item for item in data["countries"] if "(USA)" in item["label"]), None)
    assert usa_comp is not None
    assert usa_comp["gold"] == 3  # Phelps, Serena, Biles all have Gold in olympics_sample
