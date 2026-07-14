import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.sports import _sports_summary_cache

@pytest.fixture(autouse=True)
def clear_sports_cache():
    """
    Clears the in-memory route cache before and after every test to prevent
    real cached results from leaking into mocked tests or vice versa.
    """
    _sports_summary_cache.clear()
    yield
    _sports_summary_cache.clear()

@pytest.fixture
def client():
    """
    Provides a FastAPI TestClient configured within a lifespan context manager.
    Using the context manager ('with TestClient(app)') is necessary to trigger
    FastAPI's startup event, which initializes and registers the DataService.
    """
    with TestClient(app) as c:
        yield c

# Checks that applying a single query filter (year=2008) correctly returns a 200 OK status and a list of sports.
def test_get_sports_summary_single_filter(client):
    # Act
    response = client.get("/api/sports?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        for item in data:
            assert "sport" in item
            assert "athlete_count" in item

# Checks that applying a combination of multiple query filters returns a 200 OK status and correctly filtered sports results.
def test_get_sports_summary_multiple_filters(client):
    # Act
    response = client.get("/api/sports?year=2008&country=USA&sport=Swimming")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["sport"] == "Swimming"

# Checks that requesting the endpoint without any query filters returns a 200 OK status and the full, unfiltered sports dataset.
def test_get_sports_summary_no_filters(client):
    # Act
    response = client.get("/api/sports")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# Checks that passing filters that match nothing in the dataset returns a 200 OK status and an empty list response.
def test_get_sports_summary_no_match(client):
    # Act
    response = client.get("/api/sports?year=1800")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data == []

# Checks that passing an invalid data type (like a non-numeric string for year) triggers FastAPI's automatic 422 validation response.
def test_get_sports_summary_invalid_type(client):
    # Act
    response = client.get("/api/sports?year=not-a-year")
    
    # Assert
    assert response.status_code == 422
    assert "detail" in response.json()

# Mocking is used here to isolate the API endpoint logic from the filesystem. By patching the DataService's
# data loader method, we can inject a small fake DataFrame and verify correct filtering behavior in milliseconds
# without reading or cleaning the actual 55MB dataset file from disk.
@patch("app.services.data_service.DataService.get_data")
def test_get_sports_summary_single_filter_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Configure the mocked get_data function to return our small 7-row sample DataFrame instead of reading the real dataset
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/sports?year=2008")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, we have 2 records for 2008: Swimming (USA) and Athletics (JAM)
    assert len(data) == 2
    sports = [item["sport"] for item in data]
    assert "Swimming" in sports
    assert "Athletics" in sports

# Mocking is used here to test multi-parameter query combinations against a deterministic in-memory dataset,
# ensuring test speed and stability without relying on the file path configuration of real CSVs on disk.
@patch("app.services.data_service.DataService.get_data")
def test_get_sports_summary_multiple_filters_mocked(mock_get_data, client, olympics_sample):
    # Arrange
    # Instruct the mock to return our deterministic test fixture
    mock_get_data.return_value = olympics_sample
    
    # Act
    response = client.get("/api/sports?year=2008&country=JAM&sport=Athletics")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    # In olympics_sample, only Usain Bolt matches this combination (NOC: JAM, Sport: Athletics, Year: 2008)
    assert len(data) == 1
    assert data[0]["sport"] == "Athletics"
    assert data[0]["athlete_count"] == 1
    assert data[0]["medal_count"] == 1
