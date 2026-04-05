"""
routes/countries.py
===================
All country-related API endpoints.
"""

from flask import Blueprint, jsonify
from bson import ObjectId
from api.db import db
from api.services.intelligence import calculate_market_sentiment, calculate_forecast

countries_bp = Blueprint("countries", __name__)

# ── Helpers ─────────────────────────────────────────────────

def _serialize(doc):
    """Convert MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def _get_latest_stress(country_code: str):
    """Return the most recent stress-score document for a country."""
    doc = db.stress_scores.find_one(
        {"country_code": country_code},
        sort=[("computed_at", -1)],
    )
    return _serialize(doc)


def _get_latest_indicators(country_code: str):
    """Return latest value for each of the 5 indicator types, with regional baseline fallbacks."""
    indicator_types = ["inflation", "reserves", "debt_gdp", "current_account", "fx_volatility"]
    
    # 1. Look up country's region for a more specific fallback
    country = db.countries.find_one({"code": country_code})
    region = country.get("region", "GLB") if country else "GLB"
    baseline = db.baselines.find_one({"region": region}) or db.baselines.find_one({"region": "GLB"})
    
    results = {}
    for itype in indicator_types:
        latest = db.indicators.find_one(
            {"country_code": country_code, "indicator_type": itype},
            sort=[("recorded_date", -1)],
        )
        prev = db.indicators.find_one(
            {"country_code": country_code, "indicator_type": itype},
            sort=[("recorded_date", -1)],
            skip=1,
        )
        
        if latest:
            entry = _serialize(latest)
            if prev and prev.get("value") is not None and latest.get("value") is not None:
                entry["trend"] = "↑" if latest["value"] > prev["value"] else "↓"
            else:
                entry["trend"] = "—"
            results[itype] = entry
        elif baseline and itype in baseline:
            results[itype] = {
                "value": baseline[itype],
                "indicator_type": itype,
                "is_estimate": True,
                "trend": "—",
                "source": f"Institutional Regional Baseline ({region})"
            }
    return results


# ── GET /api/countries ──────────────────────────────────────
@countries_bp.route("/countries")
def list_countries():
    """All countries with their latest stress score."""
    countries = list(db.countries.find())
    data = []
    for c in countries:
        c = _serialize(c)
        stress = _get_latest_stress(c["code"])
        c["latest_stress"] = stress
        data.append(c)
    return jsonify({"success": True, "data": data})


# ── GET /api/countries/<code> ───────────────────────────────
@countries_bp.route("/countries/<code>")
def get_country(code):
    """Single country + latest stress score + indicator snapshots."""
    code = code.upper()
    country = db.countries.find_one({"code": code})
    if not country:
        return jsonify({"success": False, "error": "Country not found"}), 404

    country = _serialize(country)
    latest_stress = _get_latest_stress(code)
    indicators = _get_latest_indicators(code)
    
    # Get history for intelligence models
    history_docs = list(db.stress_scores.find({"country_code": code}).sort("computed_at", 1))
    history = [_serialize(d) for d in history_docs]

    country["latest_stress"] = latest_stress
    country["indicators"] = indicators
    country["sentiment"] = calculate_market_sentiment(indicators, history)
    country["forecast"] = calculate_forecast(history)
    
    return jsonify({"success": True, "data": country})


# ── GET /api/countries/<code>/indicators ────────────────────
@countries_bp.route("/countries/<code>/indicators")
def get_indicators(code):
    """10 years of indicator data grouped by type."""
    code = code.upper()
    # Regional baseline lookup
    country = db.countries.find_one({"code": code})
    region = country.get("region", "GLB") if country else "GLB"
    baseline = db.baselines.find_one({"region": region}) or db.baselines.find_one({"region": "GLB"})
    
    indicator_types = ["inflation", "reserves", "debt_gdp", "current_account", "fx_volatility"]
    grouped = {}
    for itype in indicator_types:
        docs = list(db.indicators.find({"country_code": code, "indicator_type": itype}).sort("recorded_date", 1))
        serialized = [_serialize(d) for d in docs]
        
        # If history is empty, inject baseline
        if not serialized and baseline and itype in baseline:
            serialized = [{
                "value": baseline[itype],
                "indicator_type": itype,
                "is_estimate": True,
                "recorded_date": "2024-01-01",
                "trend": "—"
            }]
        grouped[itype] = serialized
    return jsonify({"success": True, "data": grouped})


# ── GET /api/countries/<code>/stress-history ────────────────
@countries_bp.route("/countries/<code>/stress-history")
def get_stress_history(code):
    """Stress-score time-series for the last 2 years."""
    code = code.upper()
    docs = list(
        db.stress_scores
        .find({"country_code": code})
        .sort("computed_at", 1)
    )
    return jsonify({"success": True, "data": [_serialize(d) for d in docs]})


# ── GET /api/leaderboard ───────────────────────────────────
@countries_bp.route("/leaderboard")
def leaderboard():
    """All countries with their latest stress score (if any), sorted descending by score."""
    countries = list(db.countries.find())
    data = []
    
    for c in countries:
        # Get latest stress for this country
        stress = db.stress_scores.find_one(
            {"country_code": c["code"]},
            sort=[("computed_at", -1)]
        )
        
        data.append({
            "_id": str(c["_id"]),
            "country_code": c["code"],
            "country_name": c.get("name"),
            "flag_emoji": c.get("flag_emoji"),
            "currency_code": c.get("currency_code"),
            "score": stress["score"] if stress else 0,
            "risk_level": stress["risk_level"] if stress else "UNKNOWN",
            "computed_at": stress["computed_at"].isoformat() if stress and stress.get("computed_at") else None,
        })
    
    # Sort: highest score first, then alphabetically
    data.sort(key=lambda x: (-x["score"], x["country_name"]))
    
    return jsonify({"success": True, "data": data})
