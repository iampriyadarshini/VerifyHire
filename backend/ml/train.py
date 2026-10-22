from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

from app.services.ml_classifier import MODEL_VERSION, normalize_text

SEED = 42
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "ml" / "data" / "synthetic_offers.csv"
DEFAULT_MODEL = ROOT / "models" / "fake_offer_classifier.joblib"


def load_dataset(path: Path) -> tuple[list[str], list[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    texts = [normalize_text(row.get("text", "")) for row in rows]
    labels = [row.get("label", "") for row in rows]
    if not texts or any(not text for text in texts) or set(labels) != {"legitimate", "suspicious"}:
        raise ValueError("Dataset must contain non-empty text and both legitimate and suspicious labels.")
    return texts, labels


def split_dataset(texts: list[str], labels: list[str]) -> tuple[list[str], list[str], list[str], list[str], list[str], list[str]]:
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=SEED, stratify=labels
    )
    train_texts, validation_texts, train_labels, validation_labels = train_test_split(
        train_texts, train_labels, test_size=0.125, random_state=SEED, stratify=train_labels
    )
    return train_texts, train_labels, validation_texts, validation_labels, test_texts, test_labels


def train(dataset_path: Path, model_path: Path) -> dict[str, object]:
    texts, labels = load_dataset(dataset_path)
    train_texts, train_labels, validation_texts, validation_labels, test_texts, test_labels = split_dataset(texts, labels)
    pipeline: Pipeline = Pipeline(
        [
            ("vectorizer", TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=1)),
            ("classifier", LogisticRegression(max_iter=1000, random_state=SEED)),
        ]
    )
    pipeline.fit(train_texts, train_labels)
    validation_predictions = pipeline.predict(validation_texts)
    test_predictions = pipeline.predict(test_texts)
    validation_report = classification_report(validation_labels, validation_predictions, output_dict=True, zero_division=0)
    test_report = classification_report(test_labels, test_predictions, output_dict=True, zero_division=0)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    import joblib
    joblib.dump(
        {"model_version": MODEL_VERSION, "vectorizer": pipeline.named_steps["vectorizer"], "classifier": pipeline.named_steps["classifier"]},
        model_path,
    )
    metrics = {
        "dataset": str(dataset_path),
        "synthetic_development_only": dataset_path.name == "synthetic_offers.csv",
        "random_seed": SEED,
        "train_size": len(train_texts),
        "validation_size": len(validation_texts),
        "test_size": len(test_texts),
        "validation_report": validation_report,
        "test_report": test_report,
    }
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    args = parser.parse_args()
    train(args.dataset, args.model)
