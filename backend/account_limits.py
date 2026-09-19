"""A shared, database-enforced account capacity for every registration path."""
from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

MAX_USERS = 10
CAPACITY_MESSAGE = "Batas maksimal 10 pengguna telah tercapai, termasuk admin utama dan akun nonaktif."


async def ensure_account_slots(db):
    # A slot belongs to the user document itself: no orphan reservations on a crash.
    await db.users.create_index("account_slot", unique=True, sparse=True)
    async for user in db.users.find({"account_slot": {"$exists": False}}, {"_id": 0, "user_id": 1}):
        for slot in range(1, MAX_USERS + 1):
            if await db.users.find_one({"account_slot": slot}, {"_id": 0, "user_id": 1}):
                continue
            try:
                await db.users.update_one(
                    {"user_id": user["user_id"], "account_slot": {"$exists": False}},
                    {"$set": {"account_slot": slot}},
                )
                break
            except DuplicateKeyError:
                continue


async def insert_user_with_limit(db, user):
    identity = [{"email": user["email"]}]
    if user.get("username"):
        identity.append({"username": user["username"]})
    if await db.users.find_one({"$or": identity}, {"_id": 0, "user_id": 1}):
        raise HTTPException(409, "Username atau email sudah digunakan.")
    if await db.users.count_documents({}) >= MAX_USERS:
        raise HTTPException(409, CAPACITY_MESSAGE)
    for slot in range(1, MAX_USERS + 1):
        try:
            await db.users.insert_one({**user, "account_slot": slot})
            return
        except DuplicateKeyError:
            if await db.users.find_one({"$or": identity}, {"_id": 0, "user_id": 1}):
                raise HTTPException(409, "Username atau email sudah digunakan.")
            # Another request owns this slot; the unique index prevents an 11th account.
    raise HTTPException(409, CAPACITY_MESSAGE)