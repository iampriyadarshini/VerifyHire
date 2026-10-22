from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

MODEL_VERSION = "phase6-baseline-1"
DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "fake_offer_classifier.joblib"
ML_LIMITATION = (
    "This is an experimental, uncalibrated text-classification signal trained for development only; "
    "it is not proof that an offer is fraudulent or genuine."
)


@dataclass(frozen=True)
class Prediction:
    status: str
    model_version: str | None
    label: str | None
    suspicious_score: float | None
    influential_terms: list[str]
    explanation: str
    limitation: str = ML_LIMITATION

    def as_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "model_version": self.model_version,
            "label": self.label,
            "suspicious_score": self.suspicious_score,
            "influential_terms": self.influential_terms,
            "explanation": self.explanation,
            "limitation": self.limitation,
        }


def normalize_text(text: str) -> str:
    return " ".join(str(text or "").split())[:20_000]


def model_path() -> Path:
    configured = os.getenv("ML_MODEL_PATH")
    return Path(configured) if configured else DEFAULT_MODEL_PATH


def _unavailable(reason: str) -> Prediction:
    return Prediction(
        status="unavailable",
        model_version=None,
        label=None,
        suspicious_score=None,
        influential_terms=[],
        explanation=reason,
    )


def load_model() -> Any | None:
    path = model_path()
    if not path.is_file():
        return None
    try:
        import joblib
        return joblib.load(path)
    except (OSError, ValueError, EOFError, ImportError):
        return None


def _influential_terms(model: Any, text: str) -> list[str]:
    vectorizer = model["vectorizer"]
    classifier = model["classifier"]
    vector = vectorizer.transform([text])
    coefficients = classifier.coef_[0]
    classes = list(classifier.classes_)
    suspicious_index = classes.index("suspicious")
    weights = coefficients if suspicious_index == 1 else -coefficients
    contributions = vector.multiply(weights).toarray()[0]
    names = vectorizer.get_feature_names_out()
    ranked = sorted(
        ((float(value), names[index]) for index, value in enumerate(contributions) if value > 0),
        reverse=True,
    )
    return [term for _, term in ranked[:5]]


def predict(text: str) -> Prediction:
    normalized = normalize_text(text)
    if not normalized:
        return _unavailable("No text was available for ML classification.")
    model = load_model()
    if model is None:
        return _unavailable("The ML model is not trained or is unavailable.")
    try:
        vector = model["vectorizer"].transform([normalized])
        classifier = model["classifier"]
        label = str(classifier.predict(vector)[0])
        probabilities = classifier.predict_proba(vector)[0]
        suspicious_index = list(classifier.classes_).index("suspicious")
        score = float(probabilities[suspicious_index])
        terms = _influential_terms(model, normalized)
    except (KeyError, IndexError, AttributeError, TypeError, ValueError):
        return _unavailable("The ML model could not classify this text.")
    explanation = (
        "The model found text patterns associated with suspicious offers."
        if label == "suspicious"
        else "The model found no strong suspicious pattern in the supplied text."
    )
    return Prediction(
        status="available",
        model_version=str(model.get("model_version", MODEL_VERSION)),
        label=label,
        suspicious_score=score,
        influential_terms=terms,
        explanation=explanation,
    )
