import os
import sys
import random
from datetime import datetime, timezone
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from compute_stress_score import run as compute_scores

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

client = MongoClient(os.getenv("MONGO_URI"))
db = client["currency_ews"]

COUNTRIES = [
    "IND", "TUR", "ARG", "PAK", "LKA",
    "EGY", "NGA", "BRA", "ZAF", "IDN",
    "MEX", "BGD", "GHA", "KEN", "PHL",
]

INDICATOR_TYPES = ["inflation", "reserves", "debt_gdp", "current_account", "fx_volatility"]

def seed_mocks():
    print("Seeding mock economic data...")
    current_year = datetime.now(timezone.utc).year
    start_year = current_year - 10
    
    for code in COUNTRIES:
        # Generate some synthetic trend for this country
        baseline_inf = random.uniform(2, 60)
        baseline_res = random.uniform(10e9, 500e9)
        baseline_debt = random.uniform(30, 120)
        baseline_ca = random.uniform(-10, 5)
        baseline_fx = random.uniform(5, 40)
        
        for year in range(start_year, current_year + 1):
            date = datetime(year, 1, 1, tzinfo=timezone.utc)
            
            # Add some noise
            inf = max(0, baseline_inf + random.uniform(-5, 10))
            res = max(1e9, baseline_res + random.uniform(-5e9, 5e9))
            debt = max(10, baseline_debt + random.uniform(-5, 5))
            ca = baseline_ca + random.uniform(-2, 2)
            fx = max(1, baseline_fx + random.uniform(-5, 8))
            
            # Upsert indicators
            for itype, val in [("inflation", inf), ("reserves", res), ("debt_gdp", debt), ("current_account", ca), ("fx_volatility", fx)]:
                db.indicators.update_one(
                    {"country_code": code, "indicator_type": itype, "recorded_date": date},
                    {"$set": {"value": val, "source": "mock"}},
                    upsert=True
                )
    print("Mock data seeded successfully!")

if __name__ == "__main__":
    seed_mocks()
    print("Computing stress scores from mock data...")
    compute_scores()
    print("Done!")
