from typing import List

from pydantic import BaseModel
from rich.console import Console
from rich.table import Table


def pretty_label(label: str) -> str:
    return label.replace("_", " ").title()


def print_table_from_pydantic(records: List[BaseModel]):
    console = Console()
    table = Table()
    for key in records[0].model_dump().keys():
        # justify right for numbers
        if isinstance(records[0].model_dump()[key], (int, float)):
            table.add_column(pretty_label(key), justify="right")
        else:
            table.add_column(pretty_label(key))
    for record in records:
        # convert to string to avoid rich rendering issues
        table.add_row(*[str(value) for value in record.model_dump().values()])
    console.print(table)
