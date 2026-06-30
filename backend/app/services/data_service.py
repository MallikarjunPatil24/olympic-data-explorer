import logging
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
        Runs the full ingestion, cleaning, and optimization pipeline.
        This is called during the lifespan startup phase of FastAPI.
        """
        logger.info("Starting DataService ingestion pipeline...")
        try:
            # 1. Load CSV data
            raw_data = load_raw_data()
            
            # 2. Clean and standardize features
            cleaned_df = clean_data(raw_data)
            
            # 3. Downcast numeric and optimize memory footprint
            optimized_df = optimize_memory(cleaned_df)
            
            self.df = optimized_df
            logger.info("DataService pipeline successfully completed. Dataset loaded in-memory.")
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
