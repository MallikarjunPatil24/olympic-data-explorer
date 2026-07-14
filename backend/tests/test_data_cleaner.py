import pytest
import pandas as pd
import numpy as np
from app.services.data_cleaner import clean_data

# Checks that clean_data standardizes column names to lowercase snake_case and strips whitespaces.
def test_clean_data_column_standardization():
    # Arrange
    raw_df = pd.DataFrame({
        "  Athlete Name  ": ["Michael Phelps"],
        "EVENT-detail.val": ["100m Fly"],
        "Year": [2008],
        "Sport": ["Swimming"]
    })
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    expected_cols = ["athlete_name", "event_detail_val", "year", "sport"]
    assert list(cleaned_df.columns) == expected_cols

# Checks that clean_data removes extra leading and trailing whitespace from string values in object columns.
def test_clean_data_string_values_stripping():
    # Arrange
    raw_df = pd.DataFrame({
        "name": ["  Usain Bolt  "],
        "sport": [" Athletics "],
        "year": [2008]
    }, dtype=object)
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    assert cleaned_df.iloc[0]["name"] == "Usain Bolt"
    assert cleaned_df.iloc[0]["sport"] == "Athletics"

# Checks that clean_data drops rows where critical identifying columns (name, year, sport) are missing.
def test_clean_data_drop_critical_missing():
    # Arrange
    raw_df = pd.DataFrame({
        "name": ["Athlete A", None, "Athlete C", "Athlete D"],
        "year": [2012, 2012, None, 2012],
        "sport": ["Tennis", "Tennis", "Tennis", None]
    })
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    # Only Athlete A should remain because all others have at least one critical missing field
    assert len(cleaned_df) == 1
    assert cleaned_df.iloc[0]["name"] == "Athlete A"

# Checks that clean_data converts numeric columns (age, height, weight) to float and retains missing values as NaN.
def test_clean_data_numeric_coercion():
    # Arrange
    raw_df = pd.DataFrame({
        "name": ["Athlete A", "Athlete B"],
        "year": [2012, 2012],
        "sport": ["Tennis", "Tennis"],
        "age": ["23", None],
        "height": ["185.5", "invalid_height"]
    })
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    assert isinstance(cleaned_df.iloc[0]["age"], float)
    assert cleaned_df.iloc[0]["age"] == 23.0
    assert pd.isnull(cleaned_df.iloc[1]["age"])
    assert cleaned_df.iloc[0]["height"] == 185.5
    assert pd.isnull(cleaned_df.iloc[1]["height"])

# Checks that clean_data safely imputes missing categorical fields (medal maps to None, others map to Unknown).
def test_clean_data_categorical_imputation():
    # Arrange
    raw_df = pd.DataFrame({
        "name": ["Athlete A"],
        "year": [2012],
        "sport": ["Tennis"],
        "medal": [None],
        "sex": [None],
        "team": [None]
    })
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    assert cleaned_df.iloc[0]["medal"] == "None"
    assert cleaned_df.iloc[0]["sex"] == "Unknown"
    assert cleaned_df.iloc[0]["team"] == "Unknown"

# Checks that clean_data successfully identifies and drops exact duplicate rows.
def test_clean_data_remove_duplicates():
    # Arrange
    raw_df = pd.DataFrame({
        "name": ["Athlete A", "Athlete A"],
        "year": [2012, 2012],
        "sport": ["Tennis", "Tennis"]
    })
    
    # Act
    cleaned_df = clean_data(raw_df)
    
    # Assert
    assert len(cleaned_df) == 1

# Checks that clean_data correctly merges and processes a dictionary mapping names to DataFrames.
def test_clean_data_dict_input():
    # Arrange
    raw_dict = {
        "file1": pd.DataFrame({"name": ["Athlete A"], "year": [2008], "sport": ["Swimming"]}),
        "file2": pd.DataFrame({"name": ["Athlete B"], "year": [2012], "sport": ["Athletics"]})
    }
    
    # Act
    cleaned_df = clean_data(raw_dict)
    
    # Assert
    assert len(cleaned_df) == 2
    names = list(cleaned_df["name"])
    assert "Athlete A" in names
    assert "Athlete B" in names
