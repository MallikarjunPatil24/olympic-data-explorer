import pytest
import pandas as pd
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.services.data_service import DataService, data_service

# Checks that DataService prevents re-initialization if __init__ is called multiple times on the instance.
def test_data_service_prevent_reinitialization():
    service = DataService()
    # Manually change df to a dummy value
    dummy_df = pd.DataFrame({"a": [1]})
    service.df = dummy_df
    # Run init again
    service.__init__()
    # It should not have reset df to None
    assert service.df is dummy_df

# Checks that initialize() loads the pre-processed file directly when the path exists.
@patch("app.services.data_service.Path.exists")
@patch("pandas.read_csv")
@patch("app.services.data_service.optimize_memory")
def test_initialize_from_preprocessed(mock_optimize_memory, mock_read_csv, mock_exists):
    mock_exists.return_value = True
    mock_df = pd.DataFrame({"test": [1]})
    mock_read_csv.return_value = mock_df
    mock_optimize_memory.return_value = mock_df
    
    service = DataService()
    service.df = None
    
    service.initialize()
    
    assert service.df is mock_df
    mock_read_csv.assert_called_once()
    mock_optimize_memory.assert_called_once_with(mock_df)

# Checks that initialize() runs the raw CSV ingestion pipeline when the pre-processed file does not exist.
@patch("app.services.data_service.Path.exists")
@patch("app.services.data_service.load_raw_data")
@patch("app.services.data_service.clean_data")
@patch("app.services.data_service.optimize_memory")
def test_initialize_fallback(mock_optimize_memory, mock_clean_data, mock_load_raw_data, mock_exists):
    mock_exists.return_value = False
    dummy_raw = pd.DataFrame({"raw": [1]})
    dummy_cleaned = pd.DataFrame({"clean": [1]})
    dummy_opt = pd.DataFrame({"opt": [1]})
    
    mock_load_raw_data.return_value = dummy_raw
    mock_clean_data.return_value = dummy_cleaned
    mock_optimize_memory.return_value = dummy_opt
    
    service = DataService()
    service.df = None
    
    service.initialize()
    
    assert service.df is dummy_opt
    mock_load_raw_data.assert_called_once()
    mock_clean_data.assert_called_once_with(dummy_raw)
    mock_optimize_memory.assert_called_once_with(dummy_cleaned)

# Checks that any errors occurring during initialize() are properly propagated and logged.
@patch("app.services.data_service.Path.exists")
@patch("app.services.data_service.load_raw_data")
def test_initialize_exception(mock_load_raw_data, mock_exists):
    mock_exists.return_value = False
    mock_load_raw_data.side_effect = Exception("Ingestion error")
    
    service = DataService()
    
    with pytest.raises(Exception) as excinfo:
        service.initialize()
        
    assert "Ingestion error" in str(excinfo.value)

# Checks that calling get_data() when df is None dynamically runs the initialize pipeline.
@patch.object(DataService, "initialize")
def test_get_data_dynamic_initialization(mock_initialize):
    service = DataService()
    service.df = None
    
    # We trigger get_data
    service.get_data()
    
    mock_initialize.assert_called_once()
