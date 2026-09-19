import os
from pathlib import Path

import pymongo
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

TARGET_USERNAMES = ["iter5_gudang", "iter5_opname"]
TARGET_PREFIXES = ["iter5full_"]


def main():
    if not MONGO_URL or not DB_NAME:
        raise RuntimeError("MONGO_URL/DB_NAME is missing")

    client = pymongo.MongoClient(MONGO_URL)
    db = client[DB_NAME]
    try:
        query = {
            "$or": [
                {"username": {"$in": TARGET_USERNAMES}},
                *[{"username": {"$regex": f"^{prefix}"}} for prefix in TARGET_PREFIXES],
            ]
        }
        users = list(db.users.find(query, {"_id": 0, "user_id": 1, "username": 1, "email": 1}))
        user_ids = [u["user_id"] for u in users]

        if user_ids:
            deleted_sessions = db.user_sessions.delete_many({"user_id": {"$in": user_ids}}).deleted_count
            deleted_attempts = db.login_attempts.delete_many({"identifier": {"$in": [
                __import__("hashlib").sha256(f"username:{u['username']}".encode()).hexdigest() for u in users
            ]}}).deleted_count
            deleted_users = db.users.delete_many({"user_id": {"$in": user_ids}}).deleted_count
        else:
            deleted_sessions = 0
            deleted_attempts = 0
            deleted_users = 0

        print({
            "target_usernames": TARGET_USERNAMES,
            "target_prefixes": TARGET_PREFIXES,
            "matched_users": users,
            "deleted_users": deleted_users,
            "deleted_sessions": deleted_sessions,
            "deleted_login_attempts": deleted_attempts,
        })
    finally:
        client.close()


if __name__ == "__main__":
    main()
