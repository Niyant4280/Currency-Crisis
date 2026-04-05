"""
backfill_history.py
===================
Iterates through the last 10 years and computes historical stress scores
to populate the frontend Heatmap.
"""

import os
import sys
import logging
from datetime import datetime, timezone

from pymongo import MongoClient
from dotenv import load_dotenv

# Import the refactored compute function
from compute_stress_score import compute_for_country

# ── Setup ───────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    log.error("MONGO_URI not set — aborting.")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client["currency_ews"]

def backfill():
    countries = list(db.countries.find())
    current_year = datetime.now(timezone.utc).year
    start_year = current_year - 9
    
    log.info("🚀 Starting Historical Backfill (%d - %d) for %d countries...", start_year, current_year, len(countries))
    
    total_inserted = 0
    
    for year in range(start_year, current_year + 1):
        # We compute the score as of Jan 1st of that year
        target_date = datetime(year, 1, 1, tzinfo=timezone.utc)
        log.info("📅 Processing Year: %d", year)
        
        for c in countries:
            code = c["code"]
            result = compute_for_country(code, target_date)
            
            if result:
                # Upsert based on country and the specific year's timestamp
                db.stress_scores.update_one(
                    {"country_code": code, "computed_at": target_date},
                    {"$set": result},
                    upsert=True
                )
                total_inserted += 1
            else:
                log.debug("  SKIPPED: %s (Insufficient data for %d)", code, year)

    log.info("🎉 Backfill Complete! Inserted/Updated %d historical records.", total_inserted)

if __name__ == "__main__":
    backfill()
