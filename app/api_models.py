"""API response models for Parivyaya"""

from datetime import datetime

from pydantic import BaseModel


class JobResponse(BaseModel):
    """Job response model"""

    id: str
    filename: str
    status: str
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    error_message: str | None
    transaction_count: int | None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """Transaction response model"""

    id: int
    job_id: str
    date: datetime
    title: str
    amount: float
    currency: str
    category_primary: str
    category_detailed: str
    category_confidence_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """Upload response model"""

    job_id: str
    status: str
    message: str


class CategorySpending(BaseModel):
    """Spending data by category for a specific month"""

    category: str
    total_amount: float
    transaction_count: int


class MonthlySpending(BaseModel):
    """Spending data for a specific month"""

    year: int
    month: int
    categories: list[CategorySpending]
    total_spending: float


class TopTransaction(BaseModel):
    """Top transaction data"""

    id: int
    date: str
    title: str
    amount: float
    category: str


class UnusualTransaction(BaseModel):
    """Unusual transaction data"""

    id: int
    date: str
    title: str
    amount: float
    category: str
    average_amount: float
    deviation_percentage: float


class CategoryTrend(BaseModel):
    """Category spending trend over time"""

    category: str
    data: list[dict]  # List of {month: str, amount: float}
