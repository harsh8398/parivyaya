"""Spending analysis API routes"""

from statistics import mean, stdev

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api_models import (
    CategorySpending,
    CategoryTrend,
    MonthlySpending,
    TopTransaction,
    UnusualTransaction,
)
from app.database import get_db
from app.db_models import TransactionDB
from app.logger import logger

router = APIRouter(prefix="/spending", tags=["spending"])


@router.get("/analysis", response_model=list[MonthlySpending])
async def get_spending_analysis(
    category_type: str = Query(
        "detailed", description="Category type: 'primary' or 'detailed'"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get spending analysis by category per month

    Args:
        category_type: Type of category to group by (primary or detailed)
        db: Database session

    Returns:
        List of monthly spending data grouped by category
    """
    try:
        # Determine which category field to use
        category_field = (
            TransactionDB.category_primary
            if category_type == "primary"
            else TransactionDB.category_detailed
        )

        # Query to get spending by category and month
        query = (
            select(
                extract("year", TransactionDB.date).label("year"),
                extract("month", TransactionDB.date).label("month"),
                category_field.label("category"),
                func.sum(TransactionDB.amount).label("total_amount"),
                func.count(TransactionDB.id).label("transaction_count"),
            )
            .group_by("year", "month", "category")
            .order_by("year", "month", "category")
        )

        result = await db.execute(query)
        rows = result.all()

        # Group results by month
        monthly_data = {}
        for row in rows:
            year_month = (row.year, row.month)
            if year_month not in monthly_data:
                monthly_data[year_month] = {
                    "year": int(row.year),
                    "month": int(row.month),
                    "categories": [],
                    "total_spending": 0.0,
                }

            category_spending = CategorySpending(
                category=row.category,
                total_amount=float(row.total_amount),
                transaction_count=row.transaction_count,
            )
            monthly_data[year_month]["categories"].append(category_spending)
            monthly_data[year_month]["total_spending"] += float(row.total_amount)

        # Convert to list and sort by year/month
        result_list = [
            MonthlySpending(**data)
            for data in sorted(
                monthly_data.values(), key=lambda x: (x["year"], x["month"])
            )
        ]

        return result_list
    except Exception as e:
        logger.error(f"Error fetching spending analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-transactions", response_model=list[TopTransaction])
async def get_top_transactions(
    limit: int = Query(10, ge=1, le=50, description="Number of top transactions"),
    category_type: str = Query(
        "detailed", description="Category type: 'primary' or 'detailed'"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get top spending transactions

    Args:
        limit: Number of top transactions to return
        category_type: Type of category to include
        db: Database session

    Returns:
        List of top transactions by amount
    """
    try:
        category_field = (
            TransactionDB.category_primary
            if category_type == "primary"
            else TransactionDB.category_detailed
        )

        query = (
            select(
                TransactionDB.id,
                TransactionDB.date,
                TransactionDB.title,
                TransactionDB.amount,
                category_field.label("category"),
            )
            .order_by(TransactionDB.amount.desc())
            .limit(limit)
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            TopTransaction(
                id=row.id,
                date=row.date.isoformat()
                if hasattr(row.date, "isoformat")
                else str(row.date),
                title=row.title,
                amount=float(row.amount),
                category=row.category,
            )
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error fetching top transactions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unusual-transactions", response_model=list[UnusualTransaction])
async def get_unusual_transactions(
    threshold: float = Query(
        2.0, description="Standard deviation threshold for unusual transactions"
    ),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    category_type: str = Query(
        "detailed", description="Category type: 'primary' or 'detailed'"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get unusual transactions (outliers based on amount)

    Args:
        threshold: Standard deviation threshold
        limit: Maximum number of results
        category_type: Type of category to use
        db: Database session

    Returns:
        List of unusual transactions
    """
    try:
        category_field = (
            TransactionDB.category_primary
            if category_type == "primary"
            else TransactionDB.category_detailed
        )

        # Get all transactions with category
        query = select(
            TransactionDB.id,
            TransactionDB.date,
            TransactionDB.title,
            TransactionDB.amount,
            category_field.label("category"),
        )

        result = await db.execute(query)
        transactions = result.all()

        # Calculate statistics by category
        category_stats = {}
        for t in transactions:
            if t.category not in category_stats:
                category_stats[t.category] = []
            category_stats[t.category].append(float(t.amount))

        # Find outliers
        unusual = []
        for t in transactions:
            amounts = category_stats[t.category]
            if len(amounts) < 3:  # Need at least 3 transactions for meaningful stats
                continue

            avg = mean(amounts)
            std = stdev(amounts)

            if std > 0:  # Avoid division by zero
                z_score = abs((float(t.amount) - avg) / std)
                if z_score >= threshold:
                    deviation_pct = ((float(t.amount) - avg) / avg) * 100
                    unusual.append(
                        UnusualTransaction(
                            id=t.id,
                            date=t.date.isoformat()
                            if hasattr(t.date, "isoformat")
                            else str(t.date),
                            title=t.title,
                            amount=float(t.amount),
                            category=t.category,
                            average_amount=avg,
                            deviation_percentage=deviation_pct,
                        )
                    )

        # Sort by deviation and limit
        unusual.sort(key=lambda x: abs(x.deviation_percentage), reverse=True)
        return unusual[:limit]

    except Exception as e:
        logger.error(f"Error fetching unusual transactions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category-trends", response_model=list[CategoryTrend])
async def get_category_trends(
    category_type: str = Query(
        "detailed", description="Category type: 'primary' or 'detailed'"
    ),
    top_n: int = Query(5, ge=1, le=20, description="Number of top categories to show"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get spending trends by category over time

    Args:
        category_type: Type of category to group by
        top_n: Number of top categories to include
        db: Database session

    Returns:
        List of category trends with monthly data
    """
    try:
        category_field = (
            TransactionDB.category_primary
            if category_type == "primary"
            else TransactionDB.category_detailed
        )

        # First, get top N categories by total spending
        top_categories_query = (
            select(
                category_field.label("category"),
                func.sum(TransactionDB.amount).label("total"),
            )
            .group_by("category")
            .order_by(func.sum(TransactionDB.amount).desc())
            .limit(top_n)
        )

        result = await db.execute(top_categories_query)
        top_categories = [row.category for row in result.all()]

        # Get monthly data for these categories
        trends = []
        for category in top_categories:
            query = (
                select(
                    extract("year", TransactionDB.date).label("year"),
                    extract("month", TransactionDB.date).label("month"),
                    func.sum(TransactionDB.amount).label("amount"),
                )
                .where(category_field == category)
                .group_by("year", "month")
                .order_by("year", "month")
            )

            result = await db.execute(query)
            rows = result.all()

            monthly_data = [
                {
                    "month": f"{int(row.year)}-{int(row.month):02d}",
                    "amount": float(row.amount),
                }
                for row in rows
            ]

            trends.append(CategoryTrend(category=category, data=monthly_data))

        return trends

    except Exception as e:
        logger.error(f"Error fetching category trends: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
