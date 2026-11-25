"""Load and validate the manually maintained department knowledge base."""

import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "departments.json"
EXPECTED_CATEGORIES = {"electricity", "gas", "nadra"}
REQUIRED_FIELDS = {
    "label",
    "authority",
    "scope_note",
    "source_urls",
    "official_portals",
    "helpline",
    "submission_channel",
    "required_documents",
    "response_window",
    "escalation_steps",
}


def _validate_record(category: str, record: Any) -> None:
    if not isinstance(record, dict):
        raise TypeError(f"{category}: department record must be an object")
    missing = REQUIRED_FIELDS - record.keys()
    if missing:
        raise ValueError(f"{category}: missing fields: {', '.join(sorted(missing))}")
    for field in ("label", "authority", "scope_note", "submission_channel"):
        if not isinstance(record[field], str) or not record[field].strip():
            raise ValueError(f"{category}: {field} must be a non-empty string")
    if record["helpline"] is not None and not isinstance(record["helpline"], str):
        raise ValueError(f"{category}: helpline must be a string or null")
    if record["response_window"] is not None and not isinstance(
        record["response_window"], str
    ):
        raise ValueError(f"{category}: response_window must be a string or null")
    for field in ("source_urls", "official_portals"):
        urls = record[field]
        if not isinstance(urls, list) or not urls:
            raise ValueError(f"{category}: at least one {field} URL is required")
        for url in urls:
            parsed = urlparse(url)
            if parsed.scheme != "https" or not parsed.netloc:
                raise ValueError(f"{category}: {field} URLs must use HTTPS")
    if not isinstance(record["required_documents"], list) or not all(
        isinstance(item, str) and item.strip() for item in record["required_documents"]
    ):
        raise ValueError(f"{category}: required_documents must be non-empty strings")
    steps = record["escalation_steps"]
    if not isinstance(steps, list) or not steps:
        raise ValueError(f"{category}: at least one escalation step is required")
    previous_day = -1
    for step in steps:
        if (
            not isinstance(step, dict)
            or not isinstance(step.get("after_working_days"), int)
            or step["after_working_days"] < previous_day
            or not isinstance(step.get("action"), str)
            or not step["action"].strip()
        ):
            raise ValueError(f"{category}: invalid escalation step")
        previous_day = step["after_working_days"]


def load_departments(path: Path = DATA_PATH) -> dict[str, dict[str, Any]]:
    """Return all validated department records or raise a clear error."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(
            f"Unable to load department knowledge base at {path}: {exc}"
        ) from exc
    if not isinstance(data, dict) or set(data) != EXPECTED_CATEGORIES:
        raise ValueError(
            "Knowledge base must contain exactly electricity, gas, and nadra"
        )
    for category, record in data.items():
        _validate_record(category, record)
    return data


def get_department(category: str) -> dict[str, Any]:
    """Get one validated record by category."""
    departments = load_departments()
    try:
        return departments[category]
    except KeyError as exc:
        raise ValueError(f"Unknown complaint category: {category}") from exc
