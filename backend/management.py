"""Inventory catalogue and administrator-managed local accounts."""
import re
import uuid
from datetime import datetime, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, ConfigDict
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

from admin_login import UserResponse
from auth import public_user, require_role

router = APIRouter(prefix="/api")


class ItemBody(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=80)
    unit: str = Field(min_length=1, max_length=20)
    currentStock: int = Field(default=0, ge=0, le=100000000, strict=True)
    minThreshold: int = Field(default=0, ge=0, le=100000000, strict=True)
    description: str = Field(default="", max_length=300)


class ItemResponse(ItemBody):
    id: str
    categoryId: str
    planYear: dict
    lastUpdated: datetime
    status: str


class CreateUserBody(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[a-zA-Z0-9_.-]+$")
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=6, max_length=72)
    role: str


class ResetPasswordBody(BaseModel):
    password: str = Field(min_length=6, max_length=72)


async def password_hash(value):
    if len(value.encode()) > 72:
        raise HTTPException(400, "Kata sandi maksimal 72 byte.")
    return (await run_in_threadpool(bcrypt.hashpw, value.encode(), bcrypt.gensalt())).decode()


@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(body: ItemBody, request: Request, user=Depends(require_role("admin", "petugas"))):
    db = request.app.state.db
    if await db.items.find_one({"name": {"$regex": f"^{re.escape(body.name)}$", "$options": "i"}}, {"_id": 0, "id": 1}):
        raise HTTPException(409, "Nama barang sudah ada. Gunakan menu Barang Masuk untuk menambah stok.")
    now = datetime.now(timezone.utc)
    item = {**body.model_dump(), "id": f"BRG-{uuid.uuid4().hex[:8].upper()}",
            "name_key": body.name.casefold(), "categoryId": re.sub(r"[^a-z0-9]+", "-", body.category.lower()).strip("-"),
            "planYear": {}, "lastUpdated": now}
    try:
        await db.items.insert_one(dict(item))
    except DuplicateKeyError:
        raise HTTPException(409, "Nama barang sudah ada.")
    if body.currentStock:
        from server import record_transaction
        await record_transaction("IN", {**item, "currentStock": 0}, body.currentStock, user, now, source="Stok awal barang baru", notes=body.description)
    await db.catalog_audit.insert_one({"action": "CREATE", "item_id": item["id"], "user_id": user["user_id"], "at": now})
    return {**item, "status": "habis" if not item["currentStock"] else "menipis" if item["currentStock"] <= item["minThreshold"] else "aman"}


@router.delete("/items/{item_id}")
async def delete_item(item_id: str, request: Request, user=Depends(require_role("admin", "petugas"))):
    db = request.app.state.db
    item = await db.items.find_one_and_delete({"id": item_id, "currentStock": 0, "_stock_lock": {"$exists": False}}, projection={"_id": 0})
    if not item:
        existing = await db.items.find_one({"id": item_id}, {"_id": 0, "id": 1})
        raise HTTPException(409 if existing else 404, "Barang harus memiliki stok nol dan tidak sedang diproses sebelum dihapus." if existing else "Barang tidak ditemukan.")
    await db.catalog_audit.insert_one({"action": "DELETE", "item_id": item_id, "snapshot": item, "user_id": user["user_id"], "at": datetime.now(timezone.utc)})
    return {"ok": True, "item_id": item_id, "message": "Barang dihapus dari katalog; riwayat tetap tersimpan."}


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(body: CreateUserBody, request: Request, user=Depends(require_role("admin"))):
    if body.role not in ("admin", "petugas", "opname") or len(body.name.strip()) < 2:
        raise HTTPException(400, "Nama atau peran tidak valid.")
    username = body.username.lower()
    doc = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "username": username,
           "email": f"{username}@sipostlog.local", "name": body.name.strip(), "picture": "",
           "password_hash": await password_hash(body.password), "auth_method": "password", "role": body.role,
           "active": True, "created_at": datetime.now(timezone.utc), "last_login": None, "created_by": user["user_id"]}
    try:
        await request.app.state.db.users.insert_one(dict(doc))
    except DuplicateKeyError:
        raise HTTPException(409, "Username sudah digunakan.")
    return public_user(doc)


@router.post("/users/{user_id}/password")
async def reset_password(user_id: str, body: ResetPasswordBody, request: Request, user=Depends(require_role("admin"))):
    db = request.app.state.db
    target = await db.users.find_one({"user_id": user_id, "auth_method": "password"}, {"_id": 0})
    if not target:
        raise HTTPException(404, "Akun lokal tidak ditemukan.")
    if target.get("username") == "admin":
        raise HTTPException(400, "Akun admin utama dikelola melalui konfigurasi; ubah sandi akun petugas melalui menu ini.")
    await db.users.update_one({"user_id": user_id}, {"$set": {"password_hash": await password_hash(body.password)}})
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"ok": True}