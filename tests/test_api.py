import unittest

from fastapi.testclient import TestClient

from app import app


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_analysis_returns_verified_department_and_checklist(self):
        response = self.client.post(
            "/api/analyze",
            json={
                "complaint": (
                    "Mera bijli ka bill 5,000 se 28,000 aa gaya hai "
                    "aur meter reading ghalat lag rahi hai."
                )
            },
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["analysis"]["category"], "electricity")
        self.assertEqual(body["analysis"]["issue_type"], "wrong_bill")
        self.assertEqual(len(body["department"]["required_documents"]), 4)
        self.assertTrue(body["department"]["official_portals"])

    def test_application_generation_uses_selected_language_and_department(self):
        response = self.client.post(
            "/api/application",
            json={
                "complaint": "My electricity bill seems incorrect.",
                "category": "electricity",
                "applicant_name": "Ayesha",
                "language": "English",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Ayesha", response.json()["application"])
        self.assertIn("Subject:", response.json()["application"])

    def test_pdf_endpoint_returns_downloadable_pdf(self):
        response = self.client.post(
            "/api/pdf",
            json={
                "application": "To,\nThe department\n\nSubject: Test application",
                "language": "English",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF-"))

    def test_demo_endpoint_returns_explicit_demo_timeline(self):
        response = self.client.post("/api/demo", json={"category": "electricity"})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["reference"].startswith("DEMO-"))
        self.assertIn("not submitted", body["status"].lower())
        self.assertEqual(body["timeline"][-1]["event"], "Government submission")


if __name__ == "__main__":
    unittest.main()
