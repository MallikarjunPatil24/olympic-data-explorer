import sys
import os
from pathlib import Path

# Add the backend directory to sys.path so we can import from app
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

import pandas as pd
from app.services.data_loader import load_raw_data
from app.services.data_cleaner import clean_data
from app.services.data_optimizer import optimize_memory

def main():
    print("Starting pre-processing script...")
    
    # 1. Load raw data
    print("Step 1/3: Loading raw CSV datasets...")
    raw_data = load_raw_data()
    print(f"Loaded raw data. Data type: {type(raw_data)}")
    
    # 2. Clean data
    print("Step 2/3: Cleaning and standardizing fields...")
    cleaned_df = clean_data(raw_data)
    print(f"Cleaned DataFrame. Row count: {len(cleaned_df)}")
    
    # 3. Optimize memory
    print("Step 3/3: Optimizing memory footprint...")
    optimized_df = optimize_memory(cleaned_df)
    
    # Define output path
    output_dir = backend_dir / "app" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "olympics_clean.csv.gz"
    
    # 4. Save to compressed CSV
    print(f"Saving optimized dataset to: {output_file}...")
    optimized_df.to_csv(output_file, index=False, compression="gzip")
    
    # Calculate file size
    size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"Pre-processing complete! Saved compressed CSV ({size_mb:.2f} MB).")

if __name__ == "__main__":
    main()
