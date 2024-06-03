import pandas as pd

from parivyaya.enrich import enrich_labels
from parivyaya.read import load_transactions
from parivyaya.settings import get_settings

settings = get_settings()


def main():
    transaction_file = settings.PARIVYAYA_DATA_DIR / "transactions" / "cibc-credit.csv"
    txns = enrich_labels(load_transactions(transaction_file))
    pd.DataFrame([t.model_dump() for t in txns]).to_csv(
        settings.PARIVYAYA_DATA_DIR / "transactions" / "cibc-credit-enriched.csv", index=False
    )
