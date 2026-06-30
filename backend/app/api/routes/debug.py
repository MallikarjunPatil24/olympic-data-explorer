import json
import logging
from fastapi import APIRouter, Request, HTTPException

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/data-summary")
async def get_data_summary(request: Request):
    """
    Debug endpoint that extracts the loaded, optimized DataFrame from the app's state
    and returns its shape, dtypes, memory usage, and a sample of 5 records.
    """
    # Extract the data service instance cached in FastAPI app.state
    data_service = getattr(request.app.state, "data_service", None)
    
    if not data_service:
        logger.error("DataService not found in application state.")
        raise HTTPException(status_code=500, detail="DataService is not initialized in the application state.")
        
    df = data_service.get_data()
    
    if df is None:
        logger.warning("DataFrame is empty or not initialized in DataService.")
        return {
            "row_count": 0,
            "columns_dtypes": {},
            "memory_usage_mb": 0.0,
            "sample_rows": [],
            "message": "No data is currently loaded."
        }
        
    try:
        row_count = len(df)
        col_dtypes = df.dtypes.astype(str).to_dict()
        
        # Calculate deep memory footprint in MB
        memory_usage_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
        
        # Pull 5 sample rows. Convert using to_json -> json.loads to safely serialize NaNs as nulls
        sample_count = min(5, row_count)
        sample_rows = []
        if sample_count > 0:
            sample_df = df.sample(sample_count)
            sample_json_str = sample_df.to_json(orient="records")
            sample_rows = json.loads(sample_json_str)
            
        return {
            "row_count": row_count,
            "columns_dtypes": col_dtypes,
            "memory_usage_mb": round(memory_usage_mb, 4),
            "sample_rows": sample_rows
        }
    except Exception as e:
        logger.error(f"Error compiling debug data summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
