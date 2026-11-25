"""Ephemeral demo-only complaint references; no applicant details are stored."""

from datetime import datetime, timezone
from secrets import token_hex
from typing import TypedDict


class TimelineEvent(TypedDict):
    event: str
    status: str


class DemoReference(TypedDict):
    reference: str
    category: str
    status: str
    created_at: str
    timeline: list[TimelineEvent]


_DEMO_RECORDS: dict[str, DemoReference] = {}


def create_demo_reference(category: str) -> DemoReference:
    if category not in {"electricity", "gas", "nadra"}:
        raise ValueError("A supported category is required for a demo reference")
    reference = f"DEMO-{datetime.now(timezone.utc):%Y%m%d}-{token_hex(3).upper()}"  # noqa: UP017
    record = {
        "reference": reference,
        "category": category,
        "status": "Demo reference created; not submitted to a government department",
        "created_at": datetime.now(timezone.utc).isoformat(),  # noqa: UP017
        "timeline": [
            {"event": "Complaint classified", "status": "complete"},
            {"event": "Application PDF prepared", "status": "complete"},
            {"event": "Demo reference created", "status": "complete"},
            {
                "event": "Government submission",
                "status": "not submitted — no department response is expected",
            },
        ],
    }
    _DEMO_RECORDS[reference] = record
    return get_demo_reference(reference)


def get_demo_reference(reference: str) -> DemoReference:
    """Return one in-memory demo record without exposing mutable internal state."""
    try:
        record = _DEMO_RECORDS[reference]
    except KeyError as exc:
        raise ValueError(f"Unknown demo reference: {reference}") from exc
    return {
        **record,
        "timeline": [item.copy() for item in record["timeline"]],
    }
