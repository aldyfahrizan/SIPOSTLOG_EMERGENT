"""Clean confirmed orphan test-only transactions from earlier TESTLOGIN runs.

Criteria (strict):
- item_name starts with TESTLOGIN_Item_
- user_name equals TESTLOGINOPNAME
- original item document no longer exists
"""

import os
from pathlib import Path

import pymongo
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")

mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")
if not mongo_url or not db_name:
    raise SystemExit("MONGO_URL/DB_NAME are required")

client = pymongo.MongoClient(mongo_url)
db = client[db_name]

query = {
    "item_name": {"$regex": r"^TESTLOGIN_Item_"},
    "user_name": "TESTLOGINOPNAME",
}

matches = []
for tx in db.transactions.find(query, {"_id": 0, "transaction_id": 1, "item_id": 1, "item_name": 1, "user_name": 1, "occurred_at": 1}):
    item_exists = db.items.find_one({"id": tx["item_id"]}, {"_id": 0, "id": 1})
    if item_exists is None:
        matches.append(tx)

print(f"Found {len(matches)} orphan TESTLOGIN transactions")
for row in matches:
    print(f"- {row['transaction_id']} | {row['item_id']} | {row['item_name']}")

if matches:
    ids = [m["transaction_id"] for m in matches]
    result = db.transactions.delete_many({"transaction_id": {"$in": ids}})
    print(f"Deleted {result.deleted_count} transactions")
else:
    print("Nothing deleted")

client.close()
