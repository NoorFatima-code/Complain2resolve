"""Generate reviewable Urdu and English application text from local templates."""

from pathlib import Path
from string import Template

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
ENGLISH = "English"
URDU = "اردو"
_TEMPLATE_FILES = {
    ENGLISH: TEMPLATE_DIR / "application_english.txt",
    URDU: TEMPLATE_DIR / "application_urdu.txt",
}


def _clean(value: str) -> str:
    return " ".join((value or "").strip().split())


def generate_application(
    *,
    applicant_name: str,
    applicant_address: str,
    complaint: str,
    department: str,
    issue: str,
    language: str,
    reference: str = "To be assigned",
) -> str:
    """Render a plain-text application; personal fields are never stored here."""
    try:
        template_path = _TEMPLATE_FILES[language]
    except KeyError as exc:
        raise ValueError(f"Unsupported application language: {language}") from exc
    try:
        template = Template(template_path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ValueError(
            f"Unable to read application template: {template_path}"
        ) from exc
    values = {
        "name": _clean(applicant_name) or "[Applicant name]",
        "address": _clean(applicant_address) or "[Address]",
        "complaint": _clean(complaint) or "[Briefly describe your complaint]",
        "department": _clean(department),
        "issue": _clean(issue),
        "reference": _clean(reference) or "To be assigned",
    }
    return template.substitute(values)
