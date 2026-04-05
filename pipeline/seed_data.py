"""
seed_data.py
============
Seed MongoDB Atlas with:
  - 15 countries
  - 4 crisis_history documents

Run once during project setup:
    python seed_data.py
"""

import os
import sys
from datetime import datetime, timezone

from pymongo import MongoClient
from dotenv import load_dotenv

# ── Load environment ────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌  MONGO_URI not found in .env — aborting.")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client["currency_ews"]

# ── Helpers ─────────────────────────────────────────────────
now = datetime.now(timezone.utc)


def seed_countries():
    """Insert 15 countries into the `countries` collection."""
    countries = [
        {"code": "IND", "name": "India",        "region": "Asia",    "flag_emoji": "🇮🇳", "currency_code": "INR"},
        {"code": "TUR", "name": "Turkey",       "region": "Europe",  "flag_emoji": "🇹🇷", "currency_code": "TRY"},
        {"code": "ARG", "name": "Argentina",    "region": "LatAm",   "flag_emoji": "🇦🇷", "currency_code": "ARS"},
        {"code": "PAK", "name": "Pakistan",     "region": "Asia",    "flag_emoji": "🇵🇰", "currency_code": "PKR"},
        {"code": "LKA", "name": "Sri Lanka",    "region": "Asia",    "flag_emoji": "🇱🇰", "currency_code": "LKR"},
        {"code": "EGY", "name": "Egypt",        "region": "Africa",  "flag_emoji": "🇪🇬", "currency_code": "EGP"},
        {"code": "NGA", "name": "Nigeria",      "region": "Africa",  "flag_emoji": "🇳🇬", "currency_code": "NGN"},
        {"code": "BRA", "name": "Brazil",       "region": "LatAm",   "flag_emoji": "🇧🇷", "currency_code": "BRL"},
        {"code": "ZAF", "name": "South Africa", "region": "Africa",  "flag_emoji": "🇿🇦", "currency_code": "ZAR"},
        {"code": "IDN", "name": "Indonesia",    "region": "Asia",    "flag_emoji": "🇮🇩", "currency_code": "IDR"},
        {"code": "MEX", "name": "Mexico",       "region": "LatAm",   "flag_emoji": "🇲🇽", "currency_code": "MXN"},
        {"code": "BGD", "name": "Bangladesh",   "region": "Asia",    "flag_emoji": "🇧🇩", "currency_code": "BDT"},
        {"code": "GHA", "name": "Ghana",        "region": "Africa",  "flag_emoji": "🇬🇭", "currency_code": "GHS"},
        {"code": "KEN", "name": "Kenya",        "region": "Africa",  "flag_emoji": "🇰🇪", "currency_code": "KES"},
        {"code": "PHL", "name": "Philippines",  "region": "Asia",    "flag_emoji": "🇵🇭", "currency_code": "PHP"},
        # 20 New Countries
        {"code": "VEN", "name": "Venezuela",    "region": "LatAm",   "flag_emoji": "🇻🇪", "currency_code": "VES"},
        {"code": "COL", "name": "Colombia",     "region": "LatAm",   "flag_emoji": "🇨🇴", "currency_code": "COP"},
        {"code": "PER", "name": "Peru",         "region": "LatAm",   "flag_emoji": "🇵🇪", "currency_code": "PEN"},
        {"code": "CHL", "name": "Chile",        "region": "LatAm",   "flag_emoji": "🇨🇱", "currency_code": "CLP"},
        {"code": "BOL", "name": "Bolivia",      "region": "LatAm",   "flag_emoji": "🇧🇴", "currency_code": "BOB"},
        {"code": "UKR", "name": "Ukraine",      "region": "Europe",  "flag_emoji": "🇺🇦", "currency_code": "UAH"},
        {"code": "ROU", "name": "Romania",      "region": "Europe",  "flag_emoji": "🇷🇴", "currency_code": "RON"},
        {"code": "HUN", "name": "Hungary",      "region": "Europe",  "flag_emoji": "🇭🇺", "currency_code": "HUF"},
        {"code": "SRB", "name": "Serbia",       "region": "Europe",  "flag_emoji": "🇷🇸", "currency_code": "RSD"},
        {"code": "KAZ", "name": "Kazakhstan",   "region": "Asia",    "flag_emoji": "🇰🇿", "currency_code": "KZT"},
        {"code": "LBN", "name": "Lebanon",      "region": "MENA",    "flag_emoji": "🇱🇧", "currency_code": "LBP"},
        {"code": "JOR", "name": "Jordan",       "region": "MENA",    "flag_emoji": "🇯🇴", "currency_code": "JOD"},
        {"code": "TUN", "name": "Tunisia",      "region": "MENA",    "flag_emoji": "🇹🇳", "currency_code": "TND"},
        {"code": "MAR", "name": "Morocco",      "region": "MENA",    "flag_emoji": "🇲🇦", "currency_code": "MAD"},
        {"code": "DZA", "name": "Algeria",      "region": "MENA",    "flag_emoji": "🇩🇿", "currency_code": "DZD"},
        {"code": "VNM", "name": "Vietnam",      "region": "Asia",    "flag_emoji": "🇻🇳", "currency_code": "VND"},
        {"code": "THA", "name": "Thailand",     "region": "Asia",    "flag_emoji": "🇹🇭", "currency_code": "THB"},
        {"code": "MYS", "name": "Malaysia",     "region": "Asia",    "flag_emoji": "🇲🇾", "currency_code": "MYR"},
        {"code": "MMR", "name": "Myanmar",      "region": "Asia",    "flag_emoji": "🇲🇲", "currency_code": "MMK"},
        {"code": "ETH", "name": "Ethiopia",     "region": "Africa",  "flag_emoji": "🇪🇹", "currency_code": "ETB"},
    ]

    for c in countries:
        c["created_at"] = now

    # Upsert so re-running is idempotent
    for c in countries:
        db.countries.update_one(
            {"code": c["code"]},
            {"$set": c},
            upsert=True,
        )

    print(f"✅  Seeded {len(countries)} countries.")


def seed_crisis_history():
    """Insert 4 historical crisis documents."""
    crises = [
        {
            "country_code": "TUR",
            "country_name": "Turkey",
            "year": 2018,
            "title": "Turkish Lira Crisis",
            "description": (
                "Inflation surged to 25 %, the lira lost 40 % of its value "
                "against the USD, and Turkey faced severe capital outflows "
                "amid rising geopolitical tensions and unorthodox monetary policy."
            ),
            "peak_stress_score": 91.2,
            "first_red_flag": "inflation",
            "timeline": [
                {"months_before_peak": 12, "stress_score": 48.0, "risk_level": "MEDIUM"},
                {"months_before_peak": 6,  "stress_score": 67.0, "risk_level": "HIGH"},
                {"months_before_peak": 3,  "stress_score": 81.0, "risk_level": "CRITICAL"},
            ],
            "indicators_at_peak": {
                "inflation": 24.5,
                "reserves": -18.2,
                "debt_gdp": 28.3,
                "current_account": -5.5,
                "fx_volatility": 38.1,
            },
        },
        {
            "country_code": "ARG",
            "country_name": "Argentina",
            "year": 2019,
            "title": "Argentine Peso Crash & Debt Default",
            "description": (
                "Surprise primary-election results triggered a 25 % single-day "
                "peso drop. Foreign reserves plummeted from $66 B to $44 B in weeks, "
                "capital controls were imposed, and the country eventually "
                "restructured ~$65 B in sovereign debt."
            ),
            "peak_stress_score": 88.7,
            "first_red_flag": "reserves",
            "timeline": [
                {"months_before_peak": 12, "stress_score": 52.0, "risk_level": "MEDIUM"},
                {"months_before_peak": 6,  "stress_score": 64.0, "risk_level": "HIGH"},
                {"months_before_peak": 3,  "stress_score": 79.0, "risk_level": "CRITICAL"},
            ],
            "indicators_at_peak": {
                "inflation": 53.8,
                "reserves": -32.5,
                "debt_gdp": 89.4,
                "current_account": -3.2,
                "fx_volatility": 42.7,
            },
        },
        {
            "country_code": "LKA",
            "country_name": "Sri Lanka",
            "year": 2022,
            "title": "Sri Lankan Economic Collapse",
            "description": (
                "Foreign-exchange reserves effectively hit zero, the country "
                "defaulted on its sovereign debt for the first time, fuel and "
                "medicine shortages sparked mass protests, and the president "
                "fled the country."
            ),
            "peak_stress_score": 95.3,
            "first_red_flag": "reserves",
            "timeline": [
                {"months_before_peak": 12, "stress_score": 58.0, "risk_level": "HIGH"},
                {"months_before_peak": 6,  "stress_score": 76.0, "risk_level": "CRITICAL"},
                {"months_before_peak": 3,  "stress_score": 89.0, "risk_level": "CRITICAL"},
            ],
            "indicators_at_peak": {
                "inflation": 69.8,
                "reserves": -95.0,
                "debt_gdp": 118.0,
                "current_account": -3.8,
                "fx_volatility": 55.2,
            },
        },
        {
            "country_code": "PAK",
            "country_name": "Pakistan",
            "year": 2023,
            "title": "Pakistan IMF Emergency Bailout",
            "description": (
                "Pakistan's rupee lost over 30 % in months, reserves fell below "
                "$3 B (< 1 month of imports), inflation crossed 38 %, and the "
                "country secured a last-minute $3 B IMF stand-by arrangement "
                "to avert sovereign default."
            ),
            "peak_stress_score": 87.5,
            "first_red_flag": "inflation",
            "timeline": [
                {"months_before_peak": 12, "stress_score": 45.0, "risk_level": "MEDIUM"},
                {"months_before_peak": 6,  "stress_score": 62.0, "risk_level": "HIGH"},
                {"months_before_peak": 3,  "stress_score": 78.0, "risk_level": "CRITICAL"},
            ],
            "indicators_at_peak": {
                "inflation": 38.0,
                "reserves": -55.0,
                "debt_gdp": 78.5,
                "current_account": -4.6,
                "fx_volatility": 35.8,
            },
        },
    ]

    for crisis in crises:
        db.crisis_history.update_one(
            {"country_code": crisis["country_code"], "year": crisis["year"]},
            {"$set": crisis},
            upsert=True,
        )

    print(f"✅  Seeded {len(crises)} crisis-history documents.")


# ── Main ────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🌍  Seeding Currency Crisis EWS database …")
    seed_countries()
    seed_crisis_history()
    print("🎉  Done!  Database: currency_ews")
