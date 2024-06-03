from transformers import pipeline

from parivyaya.models import Transaction


def enrich_labels(transactions: list[Transaction]) -> list[Transaction]:
    model = pipeline(
        "text-classification", model="mgrella/autonlp-bank-transaction-classification-5521155"
    )
    inferred_labels = model([t.title for t in transactions])

    for i, transaction in enumerate(transactions):
        transaction.inferred_category = inferred_labels[i].get("label", "unknown")

    return transactions
