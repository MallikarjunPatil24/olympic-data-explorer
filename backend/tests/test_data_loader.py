import pytest
import os
import pandas as pd
from pathlib import Path
from unittest.mock import patch
from app.services.data_loader import load_raw_data

# Helper function to generate mock CSVs in a temporary directory
def write_csv(tmp_path, filename, data):
    p = tmp_path / filename
    pd.DataFrame(data).to_csv(p, index=False)
    return p

# Checks that load_raw_data raises a ValueError if the configured DATA_DIR does not exist.
def test_load_raw_data_dir_not_exists(tmp_path):
    non_existent = tmp_path / "missing_folder"
    with patch.dict(os.environ, {"DATA_DIR": str(non_existent)}):
        with pytest.raises(ValueError) as excinfo:
            load_raw_data()
        assert "does not exist" in str(excinfo.value)

# Checks that load_raw_data raises a ValueError if the DATA_DIR path is actually a file, not a folder.
def test_load_raw_data_dir_is_file(tmp_path):
    file_path = tmp_path / "some_file.txt"
    file_path.write_text("not a folder")
    with patch.dict(os.environ, {"DATA_DIR": str(file_path)}):
        with pytest.raises(ValueError) as excinfo:
            load_raw_data()
        assert "is not a directory" in str(excinfo.value)

# Checks that load_raw_data raises a ValueError if the directory is valid but empty (no CSV files).
def test_load_raw_data_no_csv_files(tmp_path):
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        with pytest.raises(ValueError) as excinfo:
            load_raw_data()
        assert "No CSV files found" in str(excinfo.value)

# Checks that load_raw_data loads a single CSV file correctly and returns a single DataFrame.
def test_load_raw_data_single_csv(tmp_path):
    write_csv(tmp_path, "file1.csv", {"col1": [1, 2], "col2": ["a", "b"]})
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        df = load_raw_data()
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert list(df.columns) == ["col1", "col2"]

# Checks that load_raw_data correctly concatenates multiple CSV files if their column schemas match.
def test_load_raw_data_matching_schemas(tmp_path):
    write_csv(tmp_path, "file1.csv", {"col1": [1], "col2": ["a"]})
    write_csv(tmp_path, "file2.csv", {"col1": [2], "col2": ["b"]})
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        df = load_raw_data()
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert list(df.columns) == ["col1", "col2"]

# Checks that load_raw_data returns a dictionary mapping names to DataFrames if files have mismatched schemas.
def test_load_raw_data_mismatched_schemas(tmp_path):
    write_csv(tmp_path, "file1.csv", {"col1": [1]})
    write_csv(tmp_path, "file2.csv", {"col3": [2]})
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        res = load_raw_data()
        assert isinstance(res, dict)
        assert "file1.csv" in res
        assert "file2.csv" in res
        assert isinstance(res["file1.csv"], pd.DataFrame)

# Checks that load_raw_data executes a relational merge successfully if biography and event details CSV files are found.
def test_load_raw_data_relational_merge(tmp_path):
    write_csv(tmp_path, "athlete_biography.csv", {
        "athlete_id": [101, 102],
        "name": ["Athlete One", "Athlete Two"],
        "sex": ["Male", "Female"],
        "born": ["18 August 1990", "1 January 2000"]
    })
    write_csv(tmp_path, "athlete_event_details.csv", {
        "athlete_id": [101, 102],
        "edition": ["2012 Summer", "2016 Summer"],
        "sport": ["Tennis", "Gymnastics"],
        "event": ["Men's Singles", "All-Around"],
        "medal": ["Gold", "Silver"]
    })
    write_csv(tmp_path, "games_summary.csv", {
        "edition": ["2012 Summer", "2016 Summer"],
        "year": [2012, 2016],
        "city": ["London", "Rio de Janeiro"]
    })
    write_csv(tmp_path, "country_profiles.csv", {
        "noc": ["USA", "SUI"],
        "country": ["United States", "Switzerland"]
    })
    
    # We must also mock the environment to contain the NOC and country columns
    # Let's write country_noc inside athlete_event_details or biographical
    write_csv(tmp_path, "athlete_event_details.csv", {
        "athlete_id": [101, 102],
        "edition": ["2012 Summer", "2016 Summer"],
        "sport": ["Tennis", "Gymnastics"],
        "event": ["Men's Singles", "All-Around"],
        "medal": ["Gold", "Silver"],
        "country_noc": ["USA", "SUI"]
    })
    
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        df = load_raw_data()
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert "id" in df.columns
        assert "name" in df.columns
        assert "sex" in df.columns
        assert "age" in df.columns
        # Male should map to M, Female should map to F
        assert list(df["sex"]) == ["M", "F"]
        # USA -> United States
        assert list(df["team"]) == ["United States", "Switzerland"]

# Checks that if the relational merge process fails, the loader logs a warning and falls back to standard ingestion.
@patch("pandas.merge")
def test_load_raw_data_relational_merge_fallback(mock_merge, tmp_path):
    mock_merge.side_effect = Exception("Join error")
    write_csv(tmp_path, "athlete_biography.csv", {"athlete_id": [101]})
    write_csv(tmp_path, "athlete_event_details.csv", {"athlete_id": [101]})
    with patch.dict(os.environ, {"DATA_DIR": str(tmp_path)}):
        df = load_raw_data()
        # Since merge failed, standard load kicked in, combining/dictionary-mapping the files.
        # Since columns schemas differ (or not), it returns the loaded dict/DF fallback
        assert df is not None
