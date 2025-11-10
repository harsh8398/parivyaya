"""Transaction-related API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api_models import TransactionResponse
from app.database import get_db
from app.db_models import TransactionDB
from app.logger import logger

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
async def get_transactions(
    job_id: str | None = Query(None, description="Filter by job ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
):
    """
    Query transactions with optional filters

    Args:
        job_id: Optional job ID filter
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session

    Returns:
        List of transactions
    """
    try:
        query = select(TransactionDB).order_by(TransactionDB.created_at.desc())

        if job_id:
            query = query.where(TransactionDB.job_id == job_id)

        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        transactions = result.scalars().all()

        return [TransactionResponse.model_validate(t) for t in transactions]
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
