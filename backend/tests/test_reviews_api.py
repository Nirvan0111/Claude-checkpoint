"""Backend API tests for Claude Checkpoint reviews endpoints."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://eval-signals.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def conversation_id():
    return f"TEST_conv_{uuid.uuid4().hex[:8]}"


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, session):
        r = session.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"


# ---------- Reviews CRUD ----------
class TestReviews:
    created_ids = []

    def _payload(self, conv_id, decision="approved", note=None):
        return {
            "message_id": f"TEST_msg_{uuid.uuid4().hex[:6]}",
            "conversation_id": conv_id,
            "decision": decision,
            "prompt": "TEST prompt about migration plan",
            "output": "TEST mock assistant output content",
            "signals": ["Assumption", "Source Available"],
            "note": note,
        }

    def test_create_review_approved(self, session, conversation_id):
        payload = self._payload(conversation_id, "approved")
        r = session.post(f"{API}/reviews", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["decision"] == "approved"
        assert data["conversation_id"] == conversation_id
        assert data["prompt"] == payload["prompt"]
        assert data["output"] == payload["output"]
        assert data["signals"] == payload["signals"]
        # NOTE: Backend currently returns "_id" instead of "id" (bug). Tolerate both.
        rid = data.get("id") or data.get("_id")
        assert rid and isinstance(rid, str)
        assert "created_at" in data
        TestReviews.created_ids.append(rid)

    def test_create_review_rejected(self, session, conversation_id):
        payload = self._payload(conversation_id, "rejected")
        r = session.post(f"{API}/reviews", json=payload, timeout=10)
        assert r.status_code == 200
        assert r.json()["decision"] == "rejected"
        rid = r.json().get("id") or r.json().get("_id")
        TestReviews.created_ids.append(rid)

    def test_create_review_challenged_with_note(self, session, conversation_id):
        payload = self._payload(conversation_id, "challenged", note="Reconsider the third paragraph")
        r = session.post(f"{API}/reviews", json=payload, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["decision"] == "challenged"
        assert data["note"] == "Reconsider the third paragraph"
        rid = data.get("id") or data.get("_id")
        TestReviews.created_ids.append(rid)

    def test_create_review_rolled_back(self, session, conversation_id):
        payload = self._payload(conversation_id, "rolled_back")
        r = session.post(f"{API}/reviews", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["decision"] == "rolled_back"
        assert data["conversation_id"] == conversation_id
        rid = data.get("id") or data.get("_id")
        assert rid and isinstance(rid, str)
        TestReviews.created_ids.append(rid)

    def test_create_review_invalid_decision(self, session, conversation_id):
        payload = self._payload(conversation_id, "approved")
        payload["decision"] = "bogus"
        r = session.post(f"{API}/reviews", json=payload, timeout=10)
        assert r.status_code == 422

    def test_list_reviews_filtered_by_conversation(self, session, conversation_id):
        r = session.get(f"{API}/reviews", params={"conversation_id": conversation_id}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        # All returned items belong to this conversation
        for item in data:
            assert item["conversation_id"] == conversation_id
        decisions = {d["decision"] for d in data}
        assert {"approved", "rejected", "challenged", "rolled_back"}.issubset(decisions)

    def test_list_reviews_unfiltered(self, session):
        r = session.get(f"{API}/reviews", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_review_by_id(self, session):
        assert TestReviews.created_ids, "Need a created review id"
        rid = TestReviews.created_ids[0]
        r = session.get(f"{API}/reviews/{rid}", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert (data.get("id") or data.get("_id")) == rid
        assert data["decision"] == "approved"

    def test_get_review_not_found(self, session):
        # Valid ObjectId format but not present
        r = session.get(f"{API}/reviews/507f1f77bcf86cd799439011", timeout=10)
        assert r.status_code == 404

    def test_get_review_malformed_id(self, session):
        r = session.get(f"{API}/reviews/not-an-objectid", timeout=10)
        assert r.status_code == 400
