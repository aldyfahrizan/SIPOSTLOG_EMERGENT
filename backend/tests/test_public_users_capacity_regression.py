"""Regression tests for public catalog privacy + admin user capacity (max 10 total accounts).

Modules/features covered in this file:
- /api/public/items and /api/public/summary strict field allowlist (no stock/status leakage)
- /api/items remains protected and still returns stock/status for authenticated staff
- /api/users and /api/users/capacity RBAC + capacity behavior including duplicates/inactive users
- Concurrent user creation with one remaining slot must produce exactly one success
"""

import os
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pytest
import pymongo
import requests
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "frontend" / ".env")
load_dotenv(ROOT / "backend" / ".env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

if not BASE_URL:
    pytest.skip("REACT_APP_BACKEND_URL not set", allow_module_level=True)
if not MONGO_URL or not DB_NAME:
    pytest.skip("MONGO_URL or DB_NAME not set", allow_module_level=True)

API = f"{BASE_URL.rstrip('/')}/api"


@pytest.fixture(scope="module")
def mongo_db():
    client = pymongo.MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


@pytest.fixture(scope="module")
def tracker():
    return {
        "user_ids": set(),
        "usernames": set(),
        "emails": set(),
        "login_attempt_identifiers": set(),
    }


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/admin/login", json={"username": "admin", "password": "admin"})
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="module", autouse=True)
def cleanup_created_users(mongo_db, tracker):
    yield
    if tracker["user_ids"]:
        mongo_db.user_sessions.delete_many({"user_id": {"$in": list(tracker["user_ids"])}})
        mongo_db.users.delete_many({"user_id": {"$in": list(tracker["user_ids"])}})
    if tracker["login_attempt_identifiers"]:
        mongo_db.login_attempts.delete_many({"identifier": {"$in": list(tracker["login_attempt_identifiers"])}})


def _create_user(admin_s: requests.Session, tracker, role="petugas", prefix="t1reg"):
    suffix = uuid.uuid4().hex[:8]
    username = f"{prefix}_{suffix}".lower()
    payload = {
        "name": f"TEST {role} {suffix}",
        "username": username,
        "password": "Pass1234",
        "role": role,
    }
    r = admin_s.post(f"{API}/users", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    tracker["user_ids"].add(data["user_id"])
    tracker["usernames"].add(username)
    tracker["emails"].add(f"{username}@sipostlog.local")
    return data


def _capacity(admin_s: requests.Session):
    r = admin_s.get(f"{API}/users/capacity")
    assert r.status_code == 200, r.text
    return r.json()


def _login_local(username, password):
    s = requests.Session()
    r = s.post(f"{API}/auth/admin/login", json={"username": username, "password": password})
    return s, r


def test_public_items_allowlist_exact_fields():
    r = requests.get(f"{API}/public/items")
    assert r.status_code == 200, r.text
    assert "no-store" in (r.headers.get("Cache-Control") or "")
    rows = r.json()
    assert isinstance(rows, list)
    assert len(rows) > 0

    allowed = {"id", "name", "category", "unit"}
    banned = {
        "status", "statusLabel", "currentStock", "minThreshold", "stock", "qty", "quantity",
        "lastUpdated", "updatedAt", "readiness", "readinessGauge", "status_counts",
    }
    for row in rows[:10]:
        assert set(row.keys()) == allowed
        assert not (set(row.keys()) & banned)
        assert isinstance(row["name"], str) and row["name"]
        assert isinstance(row["category"], str) and row["category"]
        assert isinstance(row["unit"], str) and row["unit"]


def test_public_summary_allowlist_and_no_stock_signals():
    r = requests.get(f"{API}/public/summary")
    assert r.status_code == 200, r.text
    assert "no-store" in (r.headers.get("Cache-Control") or "")
    data = r.json()

    assert set(data.keys()) == {"total_items", "categories"}
    assert isinstance(data["total_items"], int)
    assert isinstance(data["categories"], list)
    if data["categories"]:
        assert set(data["categories"][0].keys()) == {"category", "count"}

    payload = r.text
    for banned in ["status_counts", "currentStock", "minThreshold", "lastUpdated", "status", "stock"]:
        assert banned not in payload


def test_private_items_protected_and_still_contains_status_stock(admin_session):
    anon = requests.get(f"{API}/items")
    assert anon.status_code == 401

    authed = admin_session.get(f"{API}/items")
    assert authed.status_code == 200, authed.text
    items = authed.json()
    assert isinstance(items, list) and len(items) > 0
    first = items[0]
    assert "currentStock" in first
    assert "minThreshold" in first
    assert "status" in first


def test_capacity_and_rbac_for_users_endpoints(admin_session, tracker):
    c = _capacity(admin_session)
    assert c["limit"] == 10
    assert c["total"] >= 1
    assert c["remaining"] == max(0, 10 - c["total"])

    anon_post = requests.post(
        f"{API}/users",
        json={"name": "x", "username": f"x_{uuid.uuid4().hex[:6]}", "password": "Pass1234", "role": "petugas"},
    )
    assert anon_post.status_code == 401
    anon_cap = requests.get(f"{API}/users/capacity")
    assert anon_cap.status_code == 401

    petugas = _create_user(admin_session, tracker, role="petugas", prefix="t1rbac")
    petugas_s, login = _login_local(petugas["username"], "Pass1234")
    assert login.status_code == 200, login.text
    c_forbidden = petugas_s.get(f"{API}/users/capacity")
    u_forbidden = petugas_s.post(
        f"{API}/users",
        json={"name": "Should Fail", "username": f"forbidden_{uuid.uuid4().hex[:6]}", "password": "Pass1234", "role": "petugas"},
    )
    assert c_forbidden.status_code == 403
    assert u_forbidden.status_code == 403


def test_create_roles_and_login_and_duplicate_case_insensitive(admin_session, tracker):
    gudang = _create_user(admin_session, tracker, role="petugas", prefix="t1gudang")
    opname = _create_user(admin_session, tracker, role="opname", prefix="t1opname")

    _, gudang_login = _login_local(gudang["username"], "Pass1234")
    _, opname_login = _login_local(opname["username"], "Pass1234")
    assert gudang_login.status_code == 200
    assert opname_login.status_code == 200

    before = _capacity(admin_session)["total"]
    dup_payload = {
        "name": "Duplicate User",
        "username": gudang["username"].upper(),
        "password": "Pass1234",
        "role": "petugas",
    }
    dup = admin_session.post(f"{API}/users", json=dup_payload)
    assert dup.status_code == 409
    assert "sudah" in dup.text.lower()
    after = _capacity(admin_session)["total"]
    assert after == before


def test_capacity_full_limit_and_inactive_still_counted(admin_session, tracker):
    cap = _capacity(admin_session)
    to_create = max(0, 10 - cap["total"])
    created_now = []
    for _ in range(to_create):
        created_now.append(_create_user(admin_session, tracker, role="petugas", prefix="t1fill"))

    full = _capacity(admin_session)
    assert full["total"] == 10
    assert full["remaining"] == 0

    blocked = admin_session.post(
        f"{API}/users",
        json={
            "name": "Overflow User",
            "username": f"overflow_{uuid.uuid4().hex[:6]}",
            "password": "Pass1234",
            "role": "petugas",
        },
    )
    assert blocked.status_code == 409

    if created_now:
        victim = created_now[0]
        deact = admin_session.patch(f"{API}/users/{victim['user_id']}", json={"active": False})
        assert deact.status_code == 200
        still_full = _capacity(admin_session)
        assert still_full["total"] == 10
        assert still_full["remaining"] == 0

        blocked_again = admin_session.post(
            f"{API}/users",
            json={
                "name": "Overflow User 2",
                "username": f"overflow2_{uuid.uuid4().hex[:6]}",
                "password": "Pass1234",
                "role": "opname",
            },
        )
        assert blocked_again.status_code == 409


def test_concurrent_create_with_one_remaining_slot_exactly_one_success(admin_session, tracker, mongo_db):
    # Ensure exactly one free slot (total=9). If already full due earlier tests, remove one tracked test user.
    cap = _capacity(admin_session)
    while cap["total"] > 9:
        removable = None
        for uid in list(tracker["user_ids"]):
            row = mongo_db.users.find_one({"user_id": uid}, {"_id": 0, "user_id": 1, "username": 1})
            if row and row.get("username") != "admin":
                removable = row
                break
        if not removable:
            pytest.skip("No removable tracked test user available to prepare one-remaining-slot scenario")
        mongo_db.user_sessions.delete_many({"user_id": removable["user_id"]})
        mongo_db.users.delete_one({"user_id": removable["user_id"]})
        tracker["user_ids"].discard(removable["user_id"])
        if removable.get("username"):
            tracker["usernames"].discard(removable["username"])
            tracker["emails"].discard(f"{removable['username']}@sipostlog.local")
        cap = _capacity(admin_session)

    while cap["total"] < 9:
        _create_user(admin_session, tracker, role="petugas", prefix="t1prep")
        cap = _capacity(admin_session)
    assert cap["remaining"] == 1

    token = admin_session.cookies.get("session_token")
    assert token

    def attempt_create(ix: int):
        payload = {
            "name": f"Concurrent User {ix}",
            "username": f"conc_{ix}_{uuid.uuid4().hex[:6]}",
            "password": "Pass1234",
            "role": "petugas",
        }
        s = requests.Session()
        r = s.post(
            f"{API}/users",
            headers={"Cookie": f"session_token={token}"},
            json=payload,
            timeout=20,
        )
        return payload["username"], r.status_code, r.text, (r.json() if r.status_code == 201 else None)

    results = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(attempt_create, i) for i in range(1, 6)]
        for f in as_completed(futures):
            results.append(f.result())

    successes = [r for r in results if r[1] == 201]
    conflicts = [r for r in results if r[1] == 409]
    assert len(successes) == 1, f"Expected exactly one success, got {results}"
    assert len(successes) + len(conflicts) == len(results), f"Unexpected status in {results}"

    created = successes[0][3]
    tracker["user_ids"].add(created["user_id"])
    tracker["usernames"].add(created.get("username", ""))
    tracker["emails"].add(created.get("email", ""))

    cap_after = _capacity(admin_session)
    assert cap_after["total"] == 10
    assert cap_after["remaining"] == 0
