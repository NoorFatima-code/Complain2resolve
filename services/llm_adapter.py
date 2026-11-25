"""Optional OpenAI-compatible classification adapter; disabled unless opted in."""

import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen

ALLOWED_CATEGORIES = {"electricity", "gas", "nadra"}


def classify_with_llm(complaint: str) -> dict[str, str] | None:
    """Ask configured LLM for a category; return None for safe local fallback."""
    api_key = os.getenv("LLM_API_KEY")
    if not api_key or not complaint.strip():
        return None
    endpoint = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    payload = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "Classify the complaint as electricity, gas, nadra, or unknown. "
                    "Return JSON with category and reason only. Do not provide contacts, "
                    "deadlines, legal advice, or facts about authorities."
                ),
            },
            {"role": "user", "content": complaint[:4000]},
        ],
    }
    request = Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=12) as response:
            body = json.loads(response.read().decode("utf-8"))
        result = json.loads(body["choices"][0]["message"]["content"])
        category = result.get("category")
        if category not in ALLOWED_CATEGORIES:
            return None
        return {
            "category": category,
            "reason": str(
                result.get("reason", "Suggested by the optional AI classifier.")
            )[:300],
        }
    except (URLError, TimeoutError, ValueError, KeyError, IndexError, TypeError):
        return None
