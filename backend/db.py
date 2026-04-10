"""
db.py
=====
PyMongo connection manager for Currency Crisis EWS.
Creates indexes on first import.
"""

import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is not set.")

client = MongoClient(MONGO_URI)
db = client["currency_ews"]

# ── Ensure indexes (idempotent) ─────────────────────────────
def ensure_indexes():
    """Create compound indexes required by the API queries."""
    db.indicators.create_index(
        [("country_code", ASCENDING), ("indicator_type", ASCENDING), ("recorded_date", DESCENDING)],
        name="idx_indicators_country_type_date",
    )
    db.exchange_rates.create_index(
        [("country_code", ASCENDING), ("recorded_date", DESCENDING)],
        name="idx_exchange_rates_country_date",
    )
    db.stress_scores.create_index(
        [("country_code", ASCENDING), ("computed_at", DESCENDING)],
        name="idx_stress_scores_country_date",
    )
    print("[OK] MongoDB indexes ensured.")


ensure_indexes()
