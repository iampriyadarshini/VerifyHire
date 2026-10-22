from __future__ import annotations

import argparse
import json
from pathlib import Path

from sklearn.metrics import classification_report, confusion_matrix

from app.services.analysis import analyze_offer
from app.services.ml_classifier import load_model, predict
from ml.train import load_dataset, split_dataset


def evaluate(dataset_path: Path) -> dict[str, object]:
    texts, labels = load_dataset(dataset_path)
    if load_model() is None:
        raise RuntimeError("Model artifact is missing. Train it first with python -m ml.train.")
    _, _, _, _, test_texts, test_labels = split_dataset(texts, labels)
    predictions = [predict(text).label or "unavailable" for text in test_texts]
    report = classification_report(test_labels, predictions, output_dict=True, zero_division=0)
    matrix = confusion_matrix(test_labels, predictions, labels=["legitimate", "suspicious"]).tolist()
    rule_predictions = [
        "suspicious"
        if analyze_offer(
            company_name="Unknown company",
            job_title="Unknown role",
            message=text,
            sender_email="recruiter@example.com",
            submitted_url=None,
            company_website=None,
            use_ml=False,
        ).category == "High Risk"
        else "legitimate"
        for text in test_texts
    ]
    rule_report = classification_report(test_labels, rule_predictions, output_dict=True, zero_division=0)
    rule_matrix = confusion_matrix(test_labels, rule_predictions, labels=["legitimate", "suspicious"]).tolist()
    result = {
        "dataset": str(dataset_path),
        "test_size": len(test_texts),
        "classification_report": report,
        "confusion_matrix_labels": ["legitimate", "suspicious"],
        "confusion_matrix": matrix,
        "false_positive_rate": matrix[0][1] / max(sum(matrix[0]), 1),
        "rule_based_baseline": {
            "classification_report": rule_report,
            "confusion_matrix": rule_matrix,
            "false_positive_rate": rule_matrix[0][1] / max(sum(rule_matrix[0]), 1),
        },
        "note": "Metrics on the synthetic development dataset are not real-world performance estimates.",
    }
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=Path(__file__).parent / "data" / "synthetic_offers.csv")
    args = parser.parse_args()
    evaluate(args.dataset)
