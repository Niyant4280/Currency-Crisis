"""
fetch_exchangerates.py
======================
Fetches daily exchange rates vs USD using the Frankfurter API (free, no key).
Computes 90-day rolling standard deviation as fx_volatility
and stores results in the `indicators` and `exchange_rates` collections.

Usage:
    python fetch_exchangerates.py
"""

import os
import sys
import logging
from datetime import datetime, timezone, timedelta

import requests
import pandas as pd
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

# ── Currency → Country mapping ──────────────────────────────
CURRENCY_COUNTRY = {
    # Original 15
    "INR": "IND",
    "TRY": "TUR",
    "ARS": "ARG",
    "PKR": "PAK",
    "LKR": "LKA",
    "EGP": "EGY",
    "NGN": "NGA",
    "BRL": "BRA",
    "ZAR": "ZAF",
    "IDR": "IDN",
    "MXN": "MEX",
    "BDT": "BGD",
    "GHS": "GHA",
    "KES": "KEN",
    "PHP": "PHL",
    # 20 New Countries
    "COP": "COL",   # Colombia
    "PEN": "PER",   # Peru
    "CLP": "CHL",   # Chile
    "BOB": "BOL",   # Bolivia
    "UAH": "UKR",   # Ukraine
    "RON": "ROU",   # Romania
    "HUF": "HUN",   # Hungary
    "RSD": "SRB",   # Serbia
    "KZT": "KAZ",   # Kazakhstan
    "LBP": "LBN",   # Lebanon
    "JOD": "JOR",   # Jordan
    "TND": "TUN",   # Tunisia
    "MAD": "MAR",   # Morocco
    "DZD": "DZA",   # Algeria
    "VND": "VNM",   # Vietnam
    "THB": "THA",   # Thailand
    "MYR": "MYS",   # Malaysia
    "MMK": "MMR",   # Myanmar
    "ETB": "ETH",   # Ethiopia
    # Venezuela - VEF/VES is not on Frankfurter, skip for FX; WB data still fetched
}

FRANKFURTER_BASE = "https://api.frankfurter.app"


def fetch_rates_for_currency(currency_code: str, country_code: str):
    """
    Fetch ~1 year of daily rates for a single currency from Frankfurter,
    store in exchange_rates, and compute 90-day rolling volatility.
    """
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=365)

    url = f"{FRANKFURTER_BASE}/{start_date}..{end_date}"
    params = {"from": "USD", "to": currency_code}

    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        log.warning("  ⚠  Frankfurter error for %s: %s", currency_code, exc)
        return

    rates = data.get("rates", {})
    if not rates:
        log.warning("  ⚠  No rate data for %s", currency_code)
        return

    # ── Store daily rates ───────────────────────────────────
    records = []
    for date_str, rate_dict in sorted(rates.items()):
        rate = rate_dict.get(currency_code)
        if rate is None:
            continue
        recorded_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        db.exchange_rates.update_one(
            {"country_code": country_code, "recorded_date": recorded_date},
            {"$set": {"currency_code": currency_code, "rate_vs_usd": rate}},
            upsert=True,
        )
        records.append({"date": recorded_date, "rate": rate})

    log.info("    Stored %d daily rates for %s", len(records), currency_code)

    # ── Compute 90-day rolling volatility ───────────────────
    if len(records) < 10:
        log.warning("    Too few records for volatility — skipping %s", currency_code)
        return

    df = pd.DataFrame(records).sort_values("date")
    df["pct_change"] = df["rate"].pct_change()
    df["rolling_vol"] = df["pct_change"].rolling(window=90, min_periods=20).std() * 100  # as %

    latest_vol = df["rolling_vol"].dropna().iloc[-1] if not df["rolling_vol"].dropna().empty else 0.0

    # Store as an indicator with type fx_volatility
    db.indicators.update_one(
        {
            "country_code": country_code,
            "indicator_type": "fx_volatility",
            "recorded_date": datetime(end_date.year, 1, 1, tzinfo=timezone.utc),
        },
        {
            "$set": {
                "value": round(float(latest_vol), 4),
                "source": "frankfurter",
            }
        },
        upsert=True,
    )
    log.info("    FX volatility for %s: %.4f%%", currency_code, latest_vol)


def run():
    """Main entry-point — fetch rates for all 15 currencies."""
    log.info("💱  Fetching exchange rates …")
    for currency_code, country_code in CURRENCY_COUNTRY.items():
        log.info("  %s (%s) …", currency_code, country_code)
        fetch_rates_for_currency(currency_code, country_code)

    log.info("✅  Exchange-rate fetch complete.")


if __name__ == "__main__":
    run()
