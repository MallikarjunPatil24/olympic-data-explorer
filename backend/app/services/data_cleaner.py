import logging
import re
from typing import Dict, Union
import pandas as pd

logger = logging.getLogger(__name__)

def clean_data(df: Union[pd.DataFrame, Dict[str, pd.DataFrame]]) -> pd.DataFrame:
    """
    Standardizes column names, handles missing values, cleans string whitespaces,
    casts dtypes correctly, removes exact duplicate records, and returns the cleaned DataFrame.
    """
    # Merge dictionary of DataFrames if returned by the data loader
    if isinstance(df, dict):
        logger.info("clean_data: Dictionary of DataFrames received. Merging using outer join.")
        df = pd.concat(df.values(), ignore_index=True, sort=False)
        
    initial_row_count = len(df)
    logger.info(f"Initializing data cleaner. Base row count: {initial_row_count}")
    
    # Count missing values before cleaning
    missing_before = df.isnull().sum().to_dict()
    
    # a) Standardize column names (lowercase, snake_case, strip whitespace)
    logger.info("Standardizing column names...")
    original_cols = list(df.columns)
    
    def standardize_name(name: str) -> str:
        # Standardize strings to lowercase snake_case
        n = str(name).strip().lower()
        n = re.sub(r'[^a-z0-9]+', '_', n)  # Replace spaces, slashes, dashes, dots with underscores
        n = re.sub(r'_+', '_', n)          # Condense multiple underscores
        return n.strip('_')
        
    df.columns = [standardize_name(col) for col in df.columns]
    col_mapping = dict(zip(original_cols, df.columns))
    logger.info(f"Column standardized mapping: {col_mapping}")
    
    # Clean up string columns of extra leading/trailing whitespace
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
            
    # Identify standard column names for critical drops
    name_col = next((c for c in df.columns if c in ['name', 'athlete_name', 'athlete']), None)
    year_col = 'year' if 'year' in df.columns else None
    sport_col = 'sport' if 'sport' in df.columns else None
    
    # Drop rows only if critical identifying fields are missing
    critical_missing_mask = pd.Series(False, index=df.index)
    if name_col:
        critical_missing_mask |= df[name_col].isnull()
    if year_col:
        critical_missing_mask |= df[year_col].isnull()
    if sport_col:
        critical_missing_mask |= df[sport_col].isnull()
        
    dropped_critical_count = critical_missing_mask.sum()
    if dropped_critical_count > 0:
        logger.warning(f"Dropping {dropped_critical_count} row(s) missing critical identifying fields (name, year, sport).")
        df = df[~critical_missing_mask].copy()
        
    # b) Handle missing values & c) Fix data types
    
    # Fix Year column dtype (since we dropped rows with missing years, it can be cast cleanly to integer)
    if year_col and year_col in df.columns:
        try:
            df[year_col] = pd.to_numeric(df[year_col], errors='coerce').fillna(0).astype(int)
            logger.info("Cast 'year' column to integer.")
        except Exception as e:
            logger.error(f"Error casting 'year' column: {str(e)}")

    # Numeric Columns (age, height, weight): coerce to float
    numeric_target_cols = ['age', 'height', 'weight']
    for col in numeric_target_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            # Documented Reason for leaving missing values as NaN:
            # Olympic athlete physiology is sport-specific (e.g. basketball vs gymnastics).
            # Imputing a global average (like median) would skew statistics and correlation indices
            # when grouped by sport. It is cleaner to leave missing records as NaN for later analysis.
            logger.info(f"Numeric column '{col}': Coerced to float. Retaining missing records as NaN to avoid skewing distributions.")
            
    # Categorical Columns (medal, sex, season)
    medal_col = next((c for c in df.columns if c in ['medal', 'medal_won']), None)
    if medal_col:
        df[medal_col] = df[medal_col].fillna("None")
        logger.info(f"Categorical column '{medal_col}': Imputed missing values to 'None'.")
        
    # Impute other categorical columns safely to 'Unknown' if missing
    common_cats = ['sex', 'season', 'team', 'noc', 'city']
    for col in common_cats:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    # d) Remove exact duplicate rows
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        logger.info(f"Removing {duplicate_count} exact duplicate row(s).")
        df.drop_duplicates(inplace=True)
        
    final_row_count = len(df)
    
    # e) Log a before/after summary
    logger.info("--- Data Cleaning Pipeline Summary ---")
    logger.info(f"Total Rows: {initial_row_count} (Before) -> {final_row_count} (After)")
    logger.info(f"Total rows dropped: {initial_row_count - final_row_count}")
    
    # Count missing values after cleaning
    missing_after = df.isnull().sum().to_dict()
    logger.info("Column null changes (Before -> After):")
    for col in df.columns:
        # Find original name for comparison report
        orig_name = next((k for k, v in col_mapping.items() if v == col), col)
        b_val = missing_before.get(orig_name, 0)
        a_val = missing_after.get(col, 0)
        logger.info(f"  * {col}: {b_val} -> {a_val}")
        
    return df
