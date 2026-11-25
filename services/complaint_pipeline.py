"""Deterministic complaint classification with an explicit optional LLM fallback."""

import re
import unicodedata
from typing import Any

_CATEGORY_TERMS = {
    "electricity": (
        "bijli",
        "electricity",
        "electric",
        "load shedding",
        "loadshedding",
        "voltage",
        "disco",
        "nepra",
        "بجلی",
        "لوڈشیڈنگ",
        "وولٹیج",
    ),
    "gas": (
        "gas",
        "sui gas",
        "sngpl",
        "ssgc",
        "ogra",
        "gas bill",
        "gas meter",
        "گیس",
        "سوئی",
        "گیس بل",
    ),
    "nadra": (
        "nadra",
        "cnic",
        "nicop",
        "b-form",
        "smart card",
        "identity card",
        "شناختی کارڈ",
        "نادرا",
        "ب فارم",
    ),
}

_ISSUE_TERMS = {
    "wrong_bill": (
        "bill",
        "billing",
        "charged",
        "amount",
        "reading",
        "overbill",
        "بِل",
        "بل",
        "ریڈنگ",
        "زیادہ",
    ),
    "service_interruption": (
        "no supply",
        "supply band",
        "supply nahi",
        "outage",
        "load shedding",
        "loadshedding",
        "band hai",
        "انقطاع",
        "بند",
        "لوڈشیڈنگ",
    ),
    "record_correction": (
        "correction",
        "wrong name",
        "record",
        "application",
        "tracking",
        "card",
        "delivery",
        "data",
        "درستگی",
        "ریکارڈ",
        "کارڈ",
        "نادرا",
    ),
}


def normalize_complaint(text: str) -> str:
    """Normalize whitespace and common Arabic-script variants for matching."""
    normalized = unicodedata.normalize("NFKC", (text or "").casefold())
    normalized = normalized.translate(str.maketrans({"ك": "ک", "ي": "ی", "ى": "ی"}))
    return " ".join(normalized.split())


def _matching_terms(text: str, terms: tuple[str, ...]) -> list[str]:
    matches = []
    for term in terms:
        if any("\u0600" <= char <= "\u06ff" for char in term):
            matched = term in text
        else:
            matched = (
                re.search(r"(?<!\w)" + re.escape(term) + r"(?!\w)", text) is not None
            )
        if matched:
            matches.append(term)
    return matches


def _count_terms(text: str, terms: tuple[str, ...]) -> int:
    return len(_matching_terms(text, terms))


def classify_complaint(text: str) -> dict[str, Any]:
    """Classify against fixed local categories; unknown text is not guessed."""
    normalized = normalize_complaint(text)
    if not normalized:
        return {
            "category": None,
            "issue": None,
            "issue_type": "unknown",
            "confidence": 0.0,
            "reason": "Please describe the issue in a few words.",
        }
    scores = {
        category: _count_terms(normalized, terms)
        for category, terms in _CATEGORY_TERMS.items()
    }
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return {
            "category": None,
            "issue": None,
            "issue_type": "unknown",
            "confidence": 0.0,
            "reason": "I could not match this to electricity, gas, or NADRA. Please mention the service concerned.",
        }
    tied = [category for category, score in scores.items() if score == scores[best]]
    if len(tied) > 1:
        return {
            "category": None,
            "issue": None,
            "issue_type": "unknown",
            "confidence": 0.25,
            "reason": "This mentions more than one service. Please clarify whether it concerns electricity, gas, or NADRA.",
        }
    matched_category_terms = _matching_terms(normalized, _CATEGORY_TERMS[best])
    other_scores = sorted(
        (score for category, score in scores.items() if category != best),
        reverse=True,
    )
    margin = scores[best] - other_scores[0]
    confidence = min(
        0.55 + 0.1 * min(scores[best] - 1, 2) + 0.1 * min(margin, 2),
        0.9,
    )
    issue = max(
        _ISSUE_TERMS,
        key=lambda label: _count_terms(normalized, _ISSUE_TERMS[label]),
    )
    issue_score = _count_terms(normalized, _ISSUE_TERMS[issue])
    issue_type = issue if issue_score else "general_complaint"
    issue_labels = {
        "wrong_bill": "billing dispute",
        "service_interruption": "service interruption",
        "record_correction": "record or service issue",
        "general_complaint": "general complaint",
    }
    return {
        "category": best,
        "issue_type": issue_type,
        "issue": issue_labels[issue_type],
        "confidence": round(confidence, 2),
        "reason": f"Matched local keyword(s): {', '.join(matched_category_terms)}.",
    }
