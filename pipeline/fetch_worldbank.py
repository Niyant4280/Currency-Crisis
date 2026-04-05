"""
fetch_worldbank.py
==================
Fetches 10 years of economic indicator data from the World Bank API
for all 35 countries and upserts into the `indicators` collection.
"""

import os
import sys
import time
import logging
from datetime import datetime, timezone

import requests
from pymongo import MongoClient
from dotenv import load_dotenv

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

# ── Constants ───────────────────────────────────────────────
BASE_URL = "https://api.worldbank.org/v2/country/{code}/indicator/{indicator}"

INDICATOR_MAP = {
    "inflation":       "FP.CPI.TOTL.ZG",
    "reserves":        "FI.RES.TOTL.CD",
    "debt_gdp":        "GC.DOD.TOTL.GD.ZS",
    "current_account": "BN.CAB.XOKA.GD.ZS",
}

# World Bank uses 2-letter ISO or 3-letter codes;
# our DB stores 3-letter codes which the WB API also accepts.
COUNTRIES = [
    # Original 15
    "IND", "TUR", "ARG", "PAK", "LKA",
    "EGY", "NGA", "BRA", "ZAF", "IDN",
    "MEX", "BGD", "GHA", "KEN", "PHL",
    # 20 New Countries
    "VEN", "COL", "PER", "CHL", "BOL",  # Latin America
    "UKR", "ROU", "HUN", "SRB", "KAZ",  # Eastern Europe / Central Asia
    "LBN", "JOR", "TUN", "MAR", "DZA",  # MENA
    "VNM", "THA", "MYS", "MMR", "ETH",  # SE Asia / Africa
]

CURRENT_YEAR = datetime.now(timezone.utc).year
START_YEAR = CURRENT_YEAR - 10


# ── Fetch & Upsert ─────────────────────────────────────────
def fetch_indicator(country_code: str, indicator_type: str, wb_code: str):
    """Fetch one indicator for one country from the World Bank API."""
    url = BASE_URL.format(code=country_code, indicator=wb_code)
    params = {
        "format": "json",
        "date": f"{START_YEAR}:{CURRENT_YEAR}",
        "per_page": 100,
    }

    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        log.warning("  ⚠  API error for %s / %s: %s", country_code, indicator_type, exc)
        return 0

    # World Bank returns [metadata, data_array]
    if not isinstance(payload, list) or len(payload) < 2 or payload[1] is None:
        log.warning("  ⚠  No data for %s / %s", country_code, indicator_type)
        return 0

    records = payload[1]
    upserted = 0
    for rec in records:
        value = rec.get("value")
        year = rec.get("date")
        if value is None or year is None:
            continue

        try:
            value = float(value)
            recorded_date = datetime(int(year), 1, 1, tzinfo=timezone.utc)
        except (ValueError, TypeError):
            continue

        db.indicators.update_one(
            {
                "country_code": country_code,
                "indicator_type": indicator_type,
                "recorded_date": recorded_date,
            },
            {
                "$set": {
                    "value": value,
                    "source": "worldbank",
                }
            },
            upsert=True,
        )
        upserted += 1

    return upserted


def run():
    """Main entry-point — loop all countries × all indicators."""
    total = 0
    for code in COUNTRIES:
        log.info("🌍  Fetching data for %s …", code)
        for itype, wb_code in INDICATOR_MAP.items():
            n = fetch_indicator(code, itype, wb_code)
            total += n
            log.info("    %s → %d records", itype, n)
            time.sleep(0.3)  # polite rate-limiting

    log.info("✅  World Bank fetch complete — %d total upserts.", total)
    return total


if __name__ == "__main__":
    run()
