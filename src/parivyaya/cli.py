import click
import pandas as pd

import parivyaya.utils as utils
from parivyaya.enrich import enrich_labels
from parivyaya.read import load_transactions
from parivyaya.settings import get_settings

settings = get_settings()


def main():
    transaction_file = settings.PARIVYAYA_DATA_DIR / "transactions" / "cibc-credit.csv"
    txns = enrich_labels(load_transactions(transaction_file))
    pd.DataFrame([t.model_dump() for t in txns]).to_csv(
        settings.PARIVYAYA_DATA_DIR / "transactions" / "cibc-credit-enriched.csv",
        index=False,
    )


@click.group()
def cli():
    """Parivyaya CLI"""


@cli.command()
def transactions():
    """List transactions"""
    transaction_file = settings.PARIVYAYA_DATA_DIR / "transactions" / "cibc-credit.csv"
    txns = load_transactions(transaction_file)

    utils.print_table_from_pydantic(txns)


@cli.command()
def fetch():
    """Fetch transactions"""
    main()


if __name__ == "__main__":
    cli()
