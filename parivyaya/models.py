from pydantic import BaseModel
from pydantic.types import PastDate

from parivyaya.settings import get_settings

settings = get_settings()


class Transaction(BaseModel):
    date: PastDate
    title: str
    amount: float
    currency: str = settings.DEFAULT_CURRENCY
    inferred_category: str = None
