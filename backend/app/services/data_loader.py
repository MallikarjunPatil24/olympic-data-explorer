import logging
import os
from pathlib import Path
from typing import Dict, Union
import pandas as pd
from app.core.config import settings

# Setup module-level logger
logger = logging.getLogger(__name__)

def load_raw_data() -> Union[pd.DataFrame, Dict[str, pd.DataFrame]]:
    """
    Dynamically scans the configured DATA_DIR for CSV files, loads them,
    and returns either a single merged DataFrame (if schemas match) or
    a dictionary mapping filenames to DataFrames.
    """
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    repo_dataset_dir = repo_root / "dataset"
    
    data_dir_path = Path(os.getenv("DATA_DIR", settings.DATA_DIR))
    
    # Robust path resolution to handle production environments where CWD varies.
    if not data_dir_path.is_absolute():
        cwd_resolved = data_dir_path.resolve()
        # Find path relative to the backend workspace root (app root)
        app_root = Path(__file__).parent.parent.parent
        app_resolved = (app_root / data_dir_path).resolve()
        
        if repo_dataset_dir.exists() and repo_dataset_dir.is_dir() and list(repo_dataset_dir.glob("*.csv")):
            resolved_path = repo_dataset_dir
        elif cwd_resolved.exists() and cwd_resolved.is_dir():
            resolved_path = cwd_resolved
        else:
            resolved_path = app_resolved
    else:
        resolved_path = data_dir_path.resolve()
    
    logger.info(f"Scanning directory: {resolved_path} for CSV files...")
    
    # Defensive checks on directory existence
    if not resolved_path.exists():
        msg = f"Data directory does not exist: {resolved_path}"
        logger.critical(msg)
        raise ValueError(msg)
        
    if not resolved_path.is_dir():
        msg = f"Data path is not a directory: {resolved_path}"
        logger.critical(msg)
        raise ValueError(msg)
        
    csv_files = list(resolved_path.glob("*.csv"))
    
    if not csv_files:
        msg = f"No CSV files found in data directory: {resolved_path}"
        logger.error(msg)
        raise ValueError(msg)
        
    logger.info(f"Found {len(csv_files)} CSV file(s): {[f.name for f in csv_files]}")
    
    # Check if we have the multi-table relational schema
    has_bio = any("athlete_biography" in f.name.lower() for f in csv_files)
    has_events = any("athlete_event_details" in f.name.lower() for f in csv_files)
    
    if has_bio and has_events:
        logger.info("Relational database dump detected. Executing custom relational schema merge...")
        try:
            # Find files
            bio_file = next(f for f in csv_files if "athlete_biography" in f.name.lower())
            events_file = next(f for f in csv_files if "athlete_event_details" in f.name.lower())
            games_file = next((f for f in csv_files if "games_summary" in f.name.lower()), None)
            countries_file = next((f for f in csv_files if "country_profiles" in f.name.lower()), None)
            
            logger.info(f"Loading tables: Bio={bio_file.name}, Events={events_file.name}")
            bio_df = pd.read_csv(bio_file, low_memory=False)
            events_df = pd.read_csv(events_file, low_memory=False)
            
            # Standardize casing for join key mapping
            bio_df.columns = [col.strip().lower() for col in bio_df.columns]
            events_df.columns = [col.strip().lower() for col in events_df.columns]
            
            # Merge events and bio on athlete_id
            merged_df = pd.merge(events_df, bio_df, on='athlete_id', how='left', suffixes=('', '_bio'))
            
            # Merge host cities, years, and dates if summary file is available
            if games_file:
                logger.info(f"Merging games summary: {games_file.name}")
                games_df = pd.read_csv(games_file, low_memory=False)
                games_df.columns = [col.strip().lower() for col in games_df.columns]
                # Filter useful columns
                merged_df = pd.merge(merged_df, games_df[['edition', 'year', 'city']], on='edition', how='left')
                
            # Map column names to fit baseline flat database expectations
            merged_df['id'] = merged_df['athlete_id']
            
            if 'athlete' in merged_df.columns:
                merged_df['name'] = merged_df['athlete']
            elif 'name_bio' in merged_df.columns:
                merged_df['name'] = merged_df['name_bio']
                
            if 'sex' in merged_df.columns:
                # Convert 'Male' -> 'M' and 'Female' -> 'F'
                merged_df['sex'] = merged_df['sex'].map({'Male': 'M', 'Female': 'F', 'M': 'M', 'F': 'F'}).fillna('U')
                
            if 'country_noc' in merged_df.columns:
                merged_df['noc'] = merged_df['country_noc']
                
            # Map country NOC codes to full names if profiles are present
            if countries_file:
                logger.info(f"Mapping country NOC names: {countries_file.name}")
                c_df = pd.read_csv(countries_file, low_memory=False)
                c_df.columns = [col.strip().lower() for col in c_df.columns]
                noc_to_name = dict(zip(c_df['noc'], c_df['country']))
                merged_df['team'] = merged_df['noc'].map(noc_to_name)
                
            if 'team' not in merged_df.columns or merged_df['team'].isnull().all():
                if 'country' in merged_df.columns:
                    merged_df['team'] = merged_df['country']
                else:
                    merged_df['team'] = merged_df['noc']
                    
            if 'edition' in merged_df.columns:
                merged_df['games'] = merged_df['edition']
                # Determine Season
                merged_df['season'] = merged_df['edition'].apply(
                    lambda x: 'Summer' if 'summer' in str(x).lower() else ('Winter' if 'winter' in str(x).lower() else 'Unknown')
                )
                
            # Calculate age from birth year string
            if 'born' in merged_df.columns and 'year' in merged_df.columns:
                logger.info("Calculating competitor ages dynamically from birth records...")
                import re
                def extract_birth_year(born_val):
                    if not isinstance(born_val, str):
                        return None
                    m = re.search(r'\b(18\d{2}|19\d{2}|20\d{2})\b', born_val)
                    return int(m.group(1)) if m else None
                    
                birth_years = merged_df['born'].apply(extract_birth_year)
                merged_df['age'] = merged_df['year'] - birth_years
                
            # Filter and output fields matching baseline schema expectancies
            cols_to_keep = ['id', 'name', 'sex', 'age', 'height', 'weight', 'noc', 'team', 'games', 'year', 'season', 'city', 'sport', 'event', 'medal']
            existing_cols = [c for c in cols_to_keep if c in merged_df.columns]
            
            final_df = merged_df[existing_cols].copy()
            logger.info(f"Ingestion successful. Merged {len(final_df)} data rows from database dump.")
            return final_df
        except Exception as e:
            logger.error(f"Relational merge pipeline failed: {str(e)}. Falling back to default loader.", exc_info=True)
            
    loaded_dfs = {}
    for csv_file in csv_files:
        try:
            logger.info(f"Reading file: {csv_file.name}...")
            df = pd.read_csv(csv_file, low_memory=False)
            logger.info(f"Successfully loaded {csv_file.name} ({len(df)} rows, {len(df.columns)} columns).")
            loaded_dfs[csv_file.name] = df
        except Exception as e:
            logger.error(f"Failed to read CSV file {csv_file.name}: {str(e)}. Skipping file.", exc_info=True)
            
    if not loaded_dfs:
        msg = "No valid CSV files could be loaded from the data directory."
        logger.error(msg)
        raise ValueError(msg)
        
    schemas = {}
    for filename, df in loaded_dfs.items():
        cols = frozenset(col.strip().lower() for col in df.columns)
        schemas[filename] = cols

    first_schema = next(iter(schemas.values()))
    all_schemas_match = all(schema == first_schema for schema in schemas.values())
    
    if len(loaded_dfs) == 1:
        filename, single_df = next(iter(loaded_dfs.items()))
        logger.info(f"Single file detected ({filename}). Returning DataFrame.")
        return single_df
        
    if all_schemas_match:
        logger.info("Schemas match across all loaded files. Concatenating into a single DataFrame.")
        try:
            merged_df = pd.concat(loaded_dfs.values(), ignore_index=True, sort=False)
            logger.info(f"Merge successful. Combined DataFrame contains {len(merged_df)} total rows.")
            return merged_df
        except Exception as e:
            logger.error(f"Failed to concatenate matching schema DataFrames: {str(e)}. Falling back to dict representation.")
            return loaded_dfs
    else:
        logger.warning("Files do not share a common column schema. Returning dictionary mapping files to DataFrames.")
        return loaded_dfs
