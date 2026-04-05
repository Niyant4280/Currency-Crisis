import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database()

# 1. Update Country Metadata with Regions
REGIONS = {
    "Africa": ["NGA", "KEN", "ETH", "EGY", "ZAF", "GHA", "TUN", "MAR", "DZA"],
    "Asia": ["IND", "PAK", "LKA", "IDN", "BGD", "PHL", "VNM", "THA", "MYS", "MMR"],
    "LatAm": ["ARG", "BRA", "MEX", "VEN", "COL", "PER", "CHL", "BOL"],
    "Europe_ME": ["TUR", "UKR", "ROU", "HUN", "SRB", "KAZ", "LBN", "JOR"]
}

print("UPDATING COUNTRY REGIONS...")
for region, codes in REGIONS.items():
    res = db.countries.update_many({"code": {"$in": codes}}, {"$set": {"region": region}})
    print(f"- {region}: Updated {res.modified_count} countries.")

# 2. Populate Baselines Collection
BASELINES = [
    { "region": "GLB", "inflation": 6.8, "reserves": 45.0, "debt_gdp": 55.0, "current_account": -1.5, "fx_volatility": 1.2 },
    { "region": "Africa", "inflation": 14.2, "reserves": 12.5, "debt_gdp": 68.0, "current_account": -3.8, "fx_volatility": 2.4 },
    { "region": "Asia", "inflation": 3.4, "reserves": 85.0, "debt_gdp": 42.0, "current_account": 1.1, "fx_volatility": 0.6 },
    { "region": "LatAm", "inflation": 22.0, "reserves": 35.0, "debt_gdp": 61.0, "current_account": -2.1, "fx_volatility": 1.8 },
    { "region": "Europe_ME", "inflation": 8.5, "reserves": 42.0, "debt_gdp": 48.0, "current_account": -0.8, "fx_volatility": 1.4 }
]

print("\nSEEDING BASELINES...")
db.baselines.delete_many({}) # Clear old
db.baselines.insert_many(BASELINES)
print(f"SUCCESS: Seeded {len(BASELINES)} regional baseline sets.")

# 3. Create Gap-Fulfillment Helper
def fill_gaps():
    print("\nFILLING DATA GAPS ACROSS ALL 35 COUNTRIES...")
    countries = list(db.countries.find())
    indicators = ["inflation", "reserves", "debt_gdp", "current_account", "fx_volatility"]
    from datetime import datetime, timezone
    
    for c in countries:
        region = c.get("region", "GLB")
        baseline = db.baselines.find_one({"region": region}) or db.baselines.find_one({"region": "GLB"})
        
        filled_count = 0
        for itype in indicators:
            # Check if this indicator exists for this country
            existing = db.indicators.find_one({"country_code": c["code"], "indicator_type": itype})
            if not existing:
                # Insert a baseline value as an "estimated" indicator
                db.indicators.insert_one({
                    "country_code": c["code"],
                    "indicator_type": itype,
                    "value": baseline[itype],
                    "recorded_date": datetime(2023, 12, 31, tzinfo=timezone.utc),
                    "is_estimate": True,
                    "source": "Institutional Baseline (Regional Average)"
                })
                filled_count += 1
        
        if filled_count > 0:
            print(f"- {c['code']}: Filled {filled_count} indicators using {region} baseline.")

fill_gaps()
print("\nDATABASE COMPLETENESS TASK FINISHED.")
