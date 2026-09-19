"""Priority regression tests for admin login/origin/session and management groundwork.

Modules/features covered:
- auth local login (/api/auth/admin/login and /api/auth/login), cookies, /auth/me, logout replay
- origin/cors explicit allowlist behavior and foreign-origin rejection
- users/items management groundwork (create item, delete item with zero stock, create user, reset password)
- role opname restrictions and post-login stock/users dashboard regression checks
"""

import os
import hashlib
import sys
import uuid
from pathlib import Path

import pymongo
import pytest
import requests
from dotenv import load_dotenv
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT / "backend"))
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


@pytest.fixture(scope="session")
def http():
    return requests.Session()


@pytest.fixture(scope="session")
def mongo_db():
    client = pymongo.MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


@pytest.fixture()
def admin_session():
    s = requests.Session()
    login = s.post(f"{API}/auth/admin/login", json={"username": "admin", "password": "admin"})
    assert login.status_code == 200, login.text
    return s


@pytest.fixture()
def cleanup_test_records(mongo_db):
    yield
    test_user_ids = [
        doc["user_id"]
        for doc in mongo_db.users.find({"username": {"$regex": r"^testlogin_"}}, {"_id": 0, "user_id": 1})
    ]
    mongo_db.users.delete_many({"username": {"$regex": r"^testlogin_"}})
    if test_user_ids:
        mongo_db.user_sessions.delete_many({"user_id": {"$in": test_user_ids}})
    mongo_db.items.delete_many({"name": {"$regex": r"^TESTLOGIN_"}})


def test_admin_hash_seed_and_env_hash_is_bcrypt_2b(mongo_db):
    env_hash = os.environ.get("ADMIN_PASSWORD_HASH")
    assert isinstance(env_hash, str) and env_hash.startswith("$2b$")
    admin_doc = mongo_db.users.find_one({"username": "admin"}, {"_id": 0, "password_hash": 1})
    assert admin_doc is not None
    assert admin_doc["password_hash"].startswith("$2b$")


def test_admin_login_success_me_persist_and_alias(http):
    login = http.post(f"{API}/auth/admin/login", json={"username": "admin", "password": "admin"})
    assert login.status_code == 200, login.text
    body = login.json()
    assert body["role"] == "admin"
    assert "password_hash" not in body and "session_token" not in body and "token" not in body

    set_cookie = login.headers.get("set-cookie", "")
    assert "session_token=" in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Secure" in set_cookie
    assert "samesite=none" in set_cookie.lower()

    me = http.get(f"{API}/auth/me")
    assert me.status_code == 200
    assert me.json()["role"] == "admin"

    alias = requests.post(f"{API}/auth/login", json={"username": "admin", "password": "admin"})
    assert alias.status_code == 200, alias.text
    assert alias.json()["role"] == "admin"


def test_login_wrong_password_generic_401_and_no_secrets(http):
    wrong = http.post(f"{API}/auth/admin/login", json={"username": "admin", "password": "not-admin"})
    assert wrong.status_code == 401
    text = wrong.text.lower()
    assert "username atau kata sandi salah" in text
    assert "password_hash" not in text
    assert "$2b$" not in text


def test_missing_cookie_denied_and_logout_replay_denied(admin_session):
    before = admin_session.get(f"{API}/auth/me")
    assert before.status_code == 200
    token = admin_session.cookies.get("session_token")
    assert token

    logout = admin_session.post(f"{API}/auth/logout")
    assert logout.status_code == 200

    after = admin_session.get(f"{API}/auth/me")
    assert after.status_code == 401

    replay = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert replay.status_code == 401


def test_explicit_origins_allowed_no_wildcard_unknown_denied_and_internal_asgi_rejects_foreign_origin(http):
    allowed_origins = [o.strip().rstrip("/") for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    assert len(allowed_origins) >= 2

    for origin in allowed_origins:
        preflight = http.options(
            f"{API}/auth/admin/login",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert preflight.status_code in (200, 204)
        returned_origin = preflight.headers.get("access-control-allow-origin")
        assert returned_origin in allowed_origins
        assert preflight.headers.get("access-control-allow-credentials", "").lower() == "true"
        assert returned_origin != "*"

    unknown = http.post(
        f"{API}/auth/admin/login",
        headers={"Origin": "https://evil.example"},
        json={"username": "admin", "password": "admin"},
    )
    assert unknown.status_code == 403
    assert "asal permintaan tidak diizinkan" in unknown.text.lower()

    from server import app

    with TestClient(app) as internal_client:
        internal = internal_client.post(
            "/api/auth/admin/login",
            headers={"origin": "https://evil.example"},
            json={"username": "admin", "password": "admin"},
        )
        assert internal.status_code == 403


def test_lockout_after_five_failures_for_nonexistent_user_does_not_lock_admin(http, mongo_db):
    username = f"ghost_{uuid.uuid4().hex[:8]}"
    statuses = []
    for _ in range(5):
        r = http.post(f"{API}/auth/admin/login", json={"username": username, "password": "wrongpass"})
        statuses.append(r.status_code)
    sixth = http.post(f"{API}/auth/admin/login", json={"username": username, "password": "wrongpass"})
    assert statuses == [401, 401, 401, 401, 401]
    assert sixth.status_code == 429

    admin_ok = http.post(f"{API}/auth/admin/login", json={"username": "admin", "password": "admin"})
    assert admin_ok.status_code == 200

    identifier = hashlib.sha256(f"username:{username}".encode()).hexdigest()
    mongo_db.login_attempts.delete_one({"identifier": identifier})


def test_post_login_regression_dashboard_and_users_not_reset(admin_session):
    stock = admin_session.get(f"{API}/dashboard/stock")
    assert stock.status_code == 200
    payload = stock.json()
    assert payload["total_items"] >= 1
    assert isinstance(payload.get("items"), list)

    users = admin_session.get(f"{API}/users")
    assert users.status_code == 200
    rows = users.json()
    assert len(rows) >= 1
    assert all("password_hash" not in u for u in rows)


def test_management_groundwork_item_user_role_reset_password_flows(admin_session, cleanup_test_records):
    # create item with isolated prefix and zero stock (delete-compatible)
    item_name = f"TESTLOGIN_Item_{uuid.uuid4().hex[:6]}"
    create_item = admin_session.post(
        f"{API}/items",
        json={
            "name": item_name,
            "category": "TESTLOGIN",
            "unit": "pcs",
            "currentStock": 0,
            "minThreshold": 0,
            "description": "isolated regression item",
        },
    )
    assert create_item.status_code == 201, create_item.text
    item_id = create_item.json()["id"]

    # create dedicated opname user
    uname = f"testlogin_{uuid.uuid4().hex[:8]}"
    create_user = admin_session.post(
        f"{API}/users",
        json={"username": uname, "name": "TESTLOGIN OPNAME", "password": "secret12", "role": "opname"},
    )
    assert create_user.status_code == 201, create_user.text
    user_id = create_user.json()["user_id"]

    # staff login via password route alias
    staff = requests.Session()
    login_staff = staff.post(f"{API}/auth/login", json={"username": uname, "password": "secret12"})
    assert login_staff.status_code == 200, login_staff.text
    assert login_staff.json()["role"] == "opname"

    # opname can adjust but cannot IN/OUT or admin-manage users
    adjust = staff.post(
        f"{API}/transactions/adjust",
        json={"item_id": item_id, "new_quantity": 0, "reason": "tes opname role"},
    )
    assert adjust.status_code == 201, adjust.text

    stock_in = staff.post(
        f"{API}/transactions/in",
        json={"item_id": item_id, "quantity": 1, "source": "TEST", "notes": "no"},
    )
    assert stock_in.status_code == 403

    create_user_forbidden = staff.post(
        f"{API}/users",
        json={"username": f"{uname}_x", "name": "forbidden", "password": "secret12", "role": "petugas"},
    )
    assert create_user_forbidden.status_code == 403

    # reset password invalidates previous sessions
    reset = admin_session.post(f"{API}/users/{user_id}/password", json={"password": "newsecret12"})
    assert reset.status_code == 200

    stale_token = staff.cookies.get("session_token")
    replay = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {stale_token}"})
    assert replay.status_code == 401

    relogin = requests.post(f"{API}/auth/login", json={"username": uname, "password": "newsecret12"})
    assert relogin.status_code == 200

    # delete item only zero stock and retain history
    delete = admin_session.delete(f"{API}/items/{item_id}")
    assert delete.status_code == 200, delete.text
    assert delete.json()["ok"] is True
