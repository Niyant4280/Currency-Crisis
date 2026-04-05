import os
import requests
from datetime import datetime, timezone
import pandas as pd
from api.db import db  # relative import from api/ folder

# --- Constants ---
EXCHANGE_API_KEY = os.getenv("EXCHANGE_API_KEY")
COUNTRIES = [
    "IND", "TUR", "ARG", "PAK", "LKA", "EGY", "NGA", "BRA", "ZAF", "IDN",
    "MEX", "BGD", "GHA", "KEN", "PHL", "VEN", "COL", "PER", "CHL", "BOL",
    "UKR", "ROU", "HUN", "SRB", "KAZ", "LBN", "JOR", "TUN", "MAR", "DZA",
    "VNM", "THA", "MYS", "MMR", "ETH"
]

WEIGHTS = {
    "inflation": 0.30, "reserves": 0.25, "debt_gdp": 0.20,
    "current_account": 0.15, "fx_volatility": 0.10
}

def update_fx_and_scores():
    """Fetch latest exchange rates and recompute stress scores for all countries."""
    if not EXCHANGE_API_KEY:
        return "ERROR: EXCHANGE_API_KEY not set"
        
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_API_KEY}/latest/USD"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        rates = resp.json().get("conversion_rates", {})
    except Exception as e:
        return f"ERROR: FX Fetch failed: {e}"

    results = []
    # Simplified FX Volatility logic for the serverless cron (latest rate vs stored)
    for code in COUNTRIES:
        country = db.countries.find_one({"code": code})
        if not country or not country.get("currency_code"):
            continue
            
        rate = rates.get(country["currency_code"])
        if rate:
            # Store latest FX as an indicator point
            db.indicators.update_one(
                {"country_code": code, "indicator_type": "fx_volatility", "recorded_date": datetime.now(timezone.utc)},
                {"$set": {"value": rate, "source": "exchangerate-api"}},
                upsert=True
            )
        
        # 2. Recompute score (using latest available from DB)
        score_data = compute_single_country_score(code)
        if score_data:
            db.stress_scores.insert_one(score_data)
            results.append(code)
            
    return f"SUCCESS: Updated FX and Scores for {len(results)} countries."

def compute_single_country_score(country_code):
    """Re-port of pipeline/compute_stress_score.py logic."""
    z_scores = {}
    raw_score = 0.0
    
    for itype in WEIGHTS.keys():
        docs = list(db.indicators.find({"country_code": country_code, "indicator_type": itype}).sort("recorded_date", 1))
        if len(docs) < 2: continue
        
        values = [d["value"] for d in docs if d.get("value") is not None]
        if len(values) < 2: continue
        
        series = pd.Series(values)
        mean, std = series.mean(), series.std()
        if std == 0: z = 0.0
        else: z = (values[-1] - mean) / std
        
        z_scores[itype] = round(z, 4)
        raw_score += WEIGHTS[itype] * z
        
    if not z_scores: return None
    
    # Scale up if missing some indicators
    total_weight = sum(WEIGHTS[k] for k in z_scores)
    if 0 < total_weight < 1.0: raw_score /= total_weight
    
    score = round(min(max((raw_score + 3) / 6 * 100, 0), 100), 2)
    level = "LOW" if score < 30 else "MEDIUM" if score < 55 else "HIGH" if score < 75 else "CRITICAL"
    
    return {
        "country_code": country_code, "score": score, "risk_level": level,
        "z_scores": z_scores, "computed_at": datetime.now(timezone.utc)
    }
