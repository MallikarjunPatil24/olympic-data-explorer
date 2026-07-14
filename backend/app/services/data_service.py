import logging
from pathlib import Path
import pandas as pd
from app.services.data_loader import load_raw_data
from app.services.data_cleaner import clean_data
from app.services.data_optimizer import optimize_memory

logger = logging.getLogger(__name__)

class DataService:
    """
    A singleton-style service that coordinates dataset loading, cleaning, 
    and memory optimization. The final optimized DataFrame is loaded into memory 
    at startup and shared across routes.
    """
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(DataService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization if class __init__ runs multiple times
        if hasattr(self, '_initialized') and self._initialized:
            return
        self.df = None
        self._initialized = True

    def initialize(self):
        """
        Runs the ingestion pipeline. If a pre-processed dataset is available,
        loads it directly in under 2 seconds. Otherwise, falls back to the
        slow raw CSV parsing/cleaning sequence.
        """
        logger.info("Starting DataService ingestion pipeline...")
        try:
            # Check for pre-processed compressed CSV
            preprocessed_path = Path(__file__).resolve().parent.parent / "data" / "olympics_clean.csv.gz"
            if preprocessed_path.exists():
                logger.info(f"Pre-processed dataset found at {preprocessed_path}. Loading directly...")
                df = pd.read_csv(preprocessed_path, compression="gzip")
                # Since CSV does not preserve Pandas category types, re-run memory optimization
                self.df = optimize_memory(df)
                logger.info("DataService pipeline successfully completed (Loaded from pre-processed file).")
                return

            logger.info("Pre-processed file not found. Executing raw CSV pipeline fallback...")
            # 1. Load CSV data
            raw_data = load_raw_data()
            
            # 2. Clean and standardize features
            cleaned_df = clean_data(raw_data)
            
            # 3. Downcast numeric and optimize memory footprint
            optimized_df = optimize_memory(cleaned_df)
            
            self.df = optimized_df
            logger.info("DataService pipeline successfully completed (Loaded from raw CSV files).")
        except Exception as e:
            logger.critical(f"DataService pipeline initialization failed: {str(e)}", exc_info=True)
            raise e

    def get_data(self) -> pd.DataFrame:
        """
        Retrieves the optimized, clean DataFrame.
        """
        if self.df is None:
            logger.warning("get_data() called on empty state. Attempting dynamic initialization.")
            self.initialize()
        return self.df

# Module-level instance
data_service = DataService()
