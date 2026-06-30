from fastapi import APIRouter

router = APIRouter()

@router.get("/summary")
async def get_summary():
    """
    Placeholder endpoint for Olympic analytics summary statistics.
    """
    return {
        "message": "Olympic Analytics Summary Route Placeholder",
        "description": "This route will serve computed insights from the dataset."
    }
