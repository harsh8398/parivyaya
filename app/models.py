import enum

from pydantic import BaseModel
from pydantic.types import PastDate

from app.settings import get_settings

settings = get_settings()


class Confidence(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class CPrimary(str, enum.Enum):
    ESSENTIAL = "ESSENTIAL"
    LUXURY = "LUXURY"
    INVESTMENTS = "INVESTMENTS"
    UNCLASSIFIED = "UNCLASSIFIED"


class CDetailed(str, enum.Enum):
    FAMILY_SUPPORT = "Family Support"
    GROCERIES = "Groceries"
    RENT = "Rent"
    UTILITIES = "Utilities"
    IMMIGRATION = "Immigration"
    HEALTH = "Health"
    HOME = "Home"
    PERSONAL_DEVELOPMENT = "Personal Development"
    PERSONAL_CARE = "Personal Care"
    TRANSPORTATION = "Transportation"
    STATIONARY = "Stationary"
    DINE_OUT = "Dine out"
    TRAVEL = "Travel"
    SHOPPING = "Shopping"
    HOME_PLUS = "Home+"
    SUBSCRIPTIONS = "Subscriptions"
    GIFTS = "Gifts"
    RECREATIONAL = "Recreational"
    INVESTMENT = "Investment"
    LIABILITIES = "Liabilities"
    MISCELLANEOUS = "Miscellaneous"
    INCOME = "Income"
    TRANSFERS = "Transfers"
    UNCLASSIFIED = "Unclassified"


class Transaction(BaseModel):
    date: PastDate
    title: str
    amount: float
    currency: str = settings.CURRENCY
    category_primary: str = CPrimary.UNCLASSIFIED
    category_detailed: str = CDetailed.UNCLASSIFIED
    category_confidence_level: Confidence = Confidence.LOW

    class Config:
        json_schema_extra = {
            "description": "A financial transaction extracted from a PDF document",
            "examples": [
                {
                    "date": "2024-01-15",
                    "title": "Grocery Store Purchase",
                    "amount": 125.50,
                    "currency": "CAD",
                    "category_primary": "ESSENTIAL",
                    "category_detailed": "Groceries",
                    "category_confidence_level": "HIGH",
                }
            ],
        }


class TransactionList(BaseModel):
    """List of transactions extracted from a PDF"""

    transactions: list[Transaction]

    class Config:
        json_schema_extra = {
            "description": "List of financial transactions extracted from a PDF bank statement or receipt"
        }
