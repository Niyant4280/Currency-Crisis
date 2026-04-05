"""
compute_stress_score.py
=======================
Computes weighted Z-score–based stress scores for every country
and inserts new documents into the `stress_scores` collection.

Formula
-------
1. For each of the 5 indicator types, compute Z = (latest - μ) / σ
   using the full historical series stored in MongoDB.
2. Weighted composite:
       raw = 0.30·z_inflation + 0.25·z_reserves + 0.20·z_debt_gdp
           + 0.15·z_current_account + 0.10·z_fx_volatility
3. Normalize to 0–100:
       score = clamp((raw + 3) / 6 × 100, 0, 100)
4. Risk level:
       0–30 LOW | 30–55 MEDIUM | 55–75 HIGH | 75–100 CRITICAL

Usage:
    python compute_stress_score.py
"""

import os
import sys
import logging
from datetime import datetime, timezone

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

# ── Weights ─────────────────────────────────────────────────
WEIGHTS = {
    "inflation":       0.30,
    "reserves":        0.25,
    "debt_gdp":        0.20,
    "current_account": 0.15,
    "fx_volatility":   0.10,
}

INDICATOR_TYPES = list(WEIGHTS.keys())


def risk_level(score: float) -> str:
    if score < 30:
        return "LOW"
    elif score < 55:
        return "MEDIUM"
    elif score < 75:
        return "HIGH"
    else:
        return "CRITICAL"


def compute_for_country(country_code: str) -> dict | None:
    """Compute the stress score for a single country."""
    z_scores = {}
    raw_score = 0.0
    missing = []

    for itype in INDICATOR_TYPES:
        docs = list(
            db.indicators.find(
                {"country_code": country_code, "indicator_type": itype}
            ).sort("recorded_date", 1)
        )
        if len(docs) < 2:
            missing.append(itype)
            continue

        values = [d["value"] for d in docs if d.get("value") is not None]
        if len(values) < 2:
            missing.append(itype)
            continue

        series = pd.Series(values, dtype=float)
        mean = series.mean()
        std = series.std()

        if std == 0:
            z = 0.0
        else:
            latest = values[-1]
            z = (latest - mean) / std

        z_scores[itype] = round(z, 4)
        raw_score += WEIGHTS[itype] * z

    if missing:
        log.warning("  ⚠  %s — missing indicators: %s", country_code, missing)

    if not z_scores:
        log.warning("  ⚠  %s — no indicator data at all, skipping.", country_code)
        return None

    # Re-weight if some indicators are missing
    total_weight = sum(WEIGHTS[k] for k in z_scores)
    if total_weight > 0 and total_weight < 1.0:
        raw_score = raw_score / total_weight  # scale up proportionally

    # Normalize to 0–100
    score = min(max((raw_score + 3) / 6 * 100, 0), 100)
    score = round(score, 2)

    level = risk_level(score)

    return {
        "country_code": country_code,
        "score": score,
        "risk_level": level,
        "z_scores": z_scores,
        "computed_at": datetime.now(timezone.utc),
    }


def run():
    """Compute stress scores for all countries in the DB."""
    countries = list(db.countries.find())
    log.info("📊  Computing stress scores for %d countries …", len(countries))

    computed = 0
    for c in countries:
        code = c["code"]
        result = compute_for_country(code)
        if result:
            db.stress_scores.insert_one(result)
            log.info("  %s  score=%.1f  risk=%s", code, result["score"], result["risk_level"])
            computed += 1

    log.info("✅  Computed %d / %d stress scores.", computed, len(countries))
    return computed


if __name__ == "__main__":
    run()
