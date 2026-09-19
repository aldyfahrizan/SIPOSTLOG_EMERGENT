"""Local administrator access using the application's existing session store."""
import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException, Request, Response
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from auth import SESSION_DAYS, public_user


class AdminLoginBody(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=72)


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str
    role: str
    active: bool
    created_at: datetime | None = None
    last_login: datetime | None = None


async def seed_local_admin(db):
    username = os.environ["ADMIN_USERNAME"].strip().lower()
    password_hash = os.environ["ADMIN_PASSWORD_HASH"]
    if not username or not password_hash.startswith("$2b$"):
        raise RuntimeError("Konfigurasi akun admin tidak valid")
    await db.users.create_index("username", unique=True, sparse=True)
    await db.login_attempts.create_index("identifier", unique=True)
    await db.login_attempts.create_index("expires_at", expireAfterSeconds=0)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    existing = await db.users.find_one({"username": username}, {"_id": 0})
    await db.users.update_one({"username": username}, {"$setOnInsert": {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": os.environ["LOCAL_ADMIN_EMAIL"],
        "username": username, "name": "Administrator SIPOSTLOG", "picture": "",
        "auth_method": "password", "role": "admin", "active": True,
        "password_hash": password_hash, "created_at": datetime.now(timezone.utc),
        "last_login": None,
    }}, upsert=True)
    if existing and existing.get("password_hash") != password_hash:
        await db.users.update_one({"user_id": existing["user_id"]}, {"$set": {"password_hash": password_hash}})
        await db.user_sessions.delete_many({"user_id": existing["user_id"]})


async def login_admin(body: AdminLoginBody, request: Request, response: Response):
    db = request.app.state.db
    username = body.username.strip().lower()
    now = datetime.now(timezone.utc)
    identifier = hashlib.sha256(f"{request.client.host}:{username}".encode()).hexdigest()
    await db.login_attempts.delete_many({"identifier": identifier, "expires_at": {"$lte": now}})
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt["count"] >= 5:
        raise HTTPException(429, "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.", headers={"Retry-After": "900"})
    user = await db.users.find_one({"username": username, "auth_method": "password"}, {"_id": 0})
    password_hash = user["password_hash"] if user else os.environ["ADMIN_PASSWORD_HASH"]
    password_bytes = body.password.encode("utf-8")
    valid = len(password_bytes) <= 72 and await run_in_threadpool(bcrypt.checkpw, password_bytes, password_hash.encode())
    if not valid or not user:
        await db.login_attempts.update_one({"identifier": identifier}, {
            "$inc": {"count": 1}, "$setOnInsert": {"expires_at": now + timedelta(minutes=15)},
        }, upsert=True)
        raise HTTPException(401, "Username atau kata sandi salah.")
    if not user.get("active") or user.get("role") != "admin":
        raise HTTPException(403, "Akses admin tidak tersedia untuk akun ini.")
    await db.login_attempts.delete_one({"identifier": identifier})
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"last_login": now}})
    user["last_login"] = now
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user["user_id"], "session_token": hashlib.sha256(token.encode()).hexdigest(),
        "auth_method": "password", "created_at": now, "expires_at": now + timedelta(days=SESSION_DAYS),
    })
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=SESSION_DAYS * 86400)
    return public_user(user)