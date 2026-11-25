"""FastAPI backend and production static-file host for scomplain2resolve."""

import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask
from starlette.staticfiles import StaticFiles

from services.application_generator import URDU, generate_application
from services.complaint_pipeline import classify_complaint
from services.demo_tracker import create_demo_reference
from services.knowledge_base import get_department
from services.llm_adapter import classify_with_llm
from services.pdf_generator import clear_previous_pdfs, generate_pdf

load_dotenv()
clear_previous_pdfs()

ROOT = Path(__file__).resolve().parent
WEB_DIST = ROOT / "web" / "dist"
SUPPORTED_CATEGORIES = {"electricity", "gas", "nadra"}

app = FastAPI(title="scomplain2resolve API", version="1.0.0")


class AnalysisRequest(BaseModel):
    complaint: str = Field(min_length=1, max_length=4000)
    use_ai: bool = False


class ApplicationRequest(BaseModel):
    complaint: str = Field(min_length=1, max_length=4000)
    category: Literal["electricity", "gas", "nadra"]
    applicant_name: str = Field(default="", max_length=120)
    applicant_address: str = Field(default="", max_length=500)
    language: Literal["اردو", "English"] = URDU


class PdfRequest(BaseModel):
    application: str = Field(min_length=1, max_length=20000)
    language: Literal["اردو", "English"] = URDU


class DemoRequest(BaseModel):
    category: Literal["electricity", "gas", "nadra"]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "ai_available": "true" if bool(os.getenv("LLM_API_KEY")) else "false",
    }


@app.post("/api/analyze")
def analyze(payload: AnalysisRequest) -> dict:
    result = classify_complaint(payload.complaint)
    if (
        payload.use_ai
        and os.getenv("LLM_API_KEY")
        and not result["category"]
        and payload.complaint.strip()
    ):
        suggestion = classify_with_llm(payload.complaint)
        if suggestion:
            result.update(
                category=suggestion["category"],
                issue_type="general_complaint",
                issue="general complaint",
                reason="Optional AI suggested a supported service. Verify the recommended route.",
                confidence=0.7,
                confidence_source="AI-assisted suggestion; verify before submission",
            )
    if not result["category"]:
        return {"analysis": result, "department": None}

    department = get_department(result["category"])
    return {
        "analysis": result,
        "department": department,
        "confidence_note": result.get("confidence_source", "Local keyword matching")
        + "; this score is heuristic, not a probability.",
    }


@app.post("/api/application")
def application_preview(payload: ApplicationRequest) -> dict[str, str]:
    department = get_department(payload.category)
    return {
        "application": generate_application(
            applicant_name=payload.applicant_name,
            applicant_address=payload.applicant_address,
            complaint=payload.complaint,
            department=department["authority"],
            issue=classify_complaint(payload.complaint).get("issue")
            or "general complaint",
            language=payload.language,
        )
    }


@app.post("/api/pdf")
def application_pdf(payload: PdfRequest) -> FileResponse:
    try:
        pdf_path = generate_pdf(payload.application, payload.language)
    except (RuntimeError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="scomplain2resolve-application.pdf",
        background=BackgroundTask(Path(pdf_path).unlink, missing_ok=True),
    )


@app.post("/api/demo")
def create_demo(payload: DemoRequest) -> dict:
    if payload.category not in SUPPORTED_CATEGORIES:
        raise HTTPException(status_code=422, detail="Unsupported complaint category")
    record = create_demo_reference(payload.category)
    return {
        **record,
        "escalation_steps": get_department(payload.category)["escalation_steps"],
    }


if WEB_DIST.is_dir():
    assets = WEB_DIST / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        requested = (WEB_DIST / full_path).resolve()
        if requested.is_relative_to(WEB_DIST.resolve()) and requested.is_file():
            return FileResponse(requested)
        index = WEB_DIST / "index.html"
        if index.is_file():
            return FileResponse(index)
        raise HTTPException(status_code=404, detail="Frontend entry point not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
