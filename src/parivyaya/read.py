from pathlib import Path
from typing import List

import pandas as pd

from parivyaya.models import Transaction


def load_transactions(transaction_file: Path) -> List[Transaction]:
    df = pd.read_csv(
        transaction_file, usecols=[0, 1, 2], names=["date", "title", "amount"]
    )
    return [Transaction(**row) for row in df.to_dict(orient="records")]
