import json
import tempfile
import unittest
from pathlib import Path

from services.application_generator import (
    ENGLISH,
    URDU,
    generate_application,
)
from services.complaint_pipeline import classify_complaint
from services.demo_tracker import create_demo_reference, get_demo_reference
from services.knowledge_base import load_departments
from services.pdf_generator import generate_pdf


class ClassificationTests(unittest.TestCase):
    def test_roman_urdu_electricity_billing_example(self):
        result = classify_complaint(
            "Mera bijli ka bill 5,000 se 28,000 aa gaya hai aur meter reading ghalat lag rahi hai."
        )
        self.assertEqual(result["category"], "electricity")
        self.assertEqual(result["issue"], "billing dispute")
        self.assertEqual(result["issue_type"], "wrong_bill")
        self.assertGreater(result["confidence"], 0.5)
        self.assertLessEqual(result["confidence"], 1.0)

    def test_urdu_gas_and_nadra_classification(self):
        self.assertEqual(
            classify_complaint("گیس کا بل بہت زیادہ آیا")["category"], "gas"
        )
        self.assertEqual(
            classify_complaint("نادرا شناختی کارڈ کی درستگی")["category"], "nadra"
        )

    def test_unknown_and_mixed_services_are_not_guessed(self):
        self.assertIsNone(classify_complaint("My internet is slow")["category"])
        self.assertIsNone(
            classify_complaint("My bill and meter reading are wrong")["category"]
        )
        self.assertIsNone(classify_complaint("bijli gas issue")["category"])


class KnowledgeBaseTests(unittest.TestCase):
    def test_data_contains_three_valid_categories(self):
        departments = load_departments()
        self.assertEqual(set(departments), {"electricity", "gas", "nadra"})
        for department in departments.values():
            self.assertTrue(department["source_urls"])
            self.assertTrue(department["required_documents"])
            self.assertTrue(department["escalation_steps"])

    def test_invalid_source_url_is_rejected(self):
        invalid = {
            "electricity": {
                "label": "x",
                "authority": "x",
                "scope_note": "x",
                "source_urls": ["http://example.test"],
                "official_portals": ["https://example.test"],
                "helpline": None,
                "submission_channel": "x",
                "required_documents": ["x"],
                "response_window": None,
                "escalation_steps": [{"after_working_days": 0, "action": "x"}],
            },
            "gas": {},
            "nadra": {},
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "data.json"
            path.write_text(json.dumps(invalid), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "HTTPS"):
                load_departments(path)


class ApplicationTests(unittest.TestCase):
    def test_application_templates_contain_reviewable_details(self):
        english = generate_application(
            applicant_name="Ayesha",
            applicant_address="Lahore",
            complaint="Wrong reading",
            department="Local DISCO",
            issue="billing dispute",
            language=ENGLISH,
        )
        urdu = generate_application(
            applicant_name="عائشہ",
            applicant_address="لاہور",
            complaint="غلط ریڈنگ",
            department="DISCO",
            issue="بل کا تنازع",
            language=URDU,
        )
        self.assertIn("Ayesha", english)
        self.assertIn("غلط ریڈنگ", urdu)

    def test_pdf_is_created_with_valid_pdf_header(self):
        for language, complaint in (
            (ENGLISH, "Wrong bill"),
            (URDU, "غلط بل"),
        ):
            with self.subTest(language=language):
                application = generate_application(
                    applicant_name="Test",
                    applicant_address="Lahore",
                    complaint=complaint,
                    department="Local DISCO",
                    issue="billing dispute",
                    language=language,
                )
                path = Path(generate_pdf(application, language))
                try:
                    self.assertTrue(path.is_file())
                    self.assertEqual(path.read_bytes()[:5], b"%PDF-")
                finally:
                    path.unlink(missing_ok=True)

    def test_demo_reference_is_explicitly_demo(self):
        record = create_demo_reference("electricity")
        self.assertTrue(record["reference"].startswith("DEMO-"))
        self.assertIn("not submitted", record["status"].lower())
        history = get_demo_reference(record["reference"])
        self.assertEqual(len(history["timeline"]), 4)
        self.assertIn("no department response", history["timeline"][-1]["status"])


if __name__ == "__main__":
    unittest.main()
