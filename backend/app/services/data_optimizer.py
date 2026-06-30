import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

def optimize_memory(df: pd.DataFrame) -> pd.DataFrame:
    """
    Optimizes memory usage of the DataFrame by downcasting numeric columns
    and converting low-cardinality string columns to category type.
    """
    # Calculate initial memory footprint in MB
    before_mem = df.memory_usage(deep=True).sum() / (1024 * 1024)
    logger.info(f"Optimizing DataFrame memory. Initial usage: {before_mem:.2f} MB")
    
    # a) Downcast numeric columns
    for col in df.columns:
        col_type = df[col].dtype
        
        # Don't check categories as they are already optimized
        if isinstance(col_type, pd.CategoricalDtype):
            continue
            
        # Check floats and downcast to float32 if safe
        if pd.api.types.is_float_dtype(col_type):
            df[col] = pd.to_numeric(df[col], downcast='float')
            logger.debug(f"Downcast float column '{col}': {col_type} -> {df[col].dtype}")
            
        # Check integers and downcast to smallest safe representation (int16/int32/int64)
        elif pd.api.types.is_integer_dtype(col_type):
            df[col] = pd.to_numeric(df[col], downcast='integer')
            logger.debug(f"Downcast integer column '{col}': {col_type} -> {df[col].dtype}")
            
    # b) Convert low-cardinality string columns to 'category' dtype
    # Explicitly target specified columns as requested (sex, season, medal, team, NOC, sport)
    categorical_targets = ['sex', 'season', 'medal', 'team', 'noc', 'sport', 'games', 'city']
    
    for col in categorical_targets:
        if col in df.columns:
            # Safe conversions for string/object fields
            # Check unique values count relative to total length (cardinality check)
            unique_count = df[col].nunique()
            total_count = len(df)
            
            # If unique values are small, convert to category
            if unique_count / total_count < 0.5:
                df[col] = df[col].astype('category')
                logger.info(f"Converted '{col}' to category dtype (Unique values: {unique_count}).")
                
    # Calculate final memory footprint in MB
    after_mem = df.memory_usage(deep=True).sum() / (1024 * 1024)
    reduction = before_mem - after_mem
    pct_reduction = (reduction / before_mem) * 100 if before_mem > 0 else 0
    
    logger.info("--- Memory Optimization Summary ---")
    logger.info(f"Memory Usage: {before_mem:.2f} MB (Before) -> {after_mem:.2f} MB (After)")
    logger.info(f"Total Reduced: {reduction:.2f} MB ({pct_reduction:.1f}% reduction)")
    
    return df
