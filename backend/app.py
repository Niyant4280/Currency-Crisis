"""
app.py
======
Unified Flask entry-point for the Currency Crisis EWS Institutional Suite.
Consolidated with '/api' for 100% production-parity.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone
import os
import json

from db import db, ensure_indexes
from routes.countries import countries_bp
from routes.crisis import crisis_bp

app = Flask(__name__)
# High-Compatibility Institutional CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def add_cors_headers(response):
    """Deep-Inject CORS fallback for mobile-to-cloud security bypass."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
    return response

# ── Register blueprints ────────────────────────────────────
app.register_blueprint(countries_bp, url_prefix="/api")
app.register_blueprint(crisis_bp, url_prefix="/api")

# ── Institutional Heartbeat (Cold-Start Detection) ──────────
@app.route("/api/heartbeat")
def heartbeat():
    return jsonify({
        "success": True, 
        "data": {"status": "Institutional Suite is Pulse-Active", "timestamp": datetime.now(timezone.utc).isoformat()}
    })

@app.route("/api/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})

# ── System Status ─────────────────────────────────────────────
@app.route("/api/status")
def status():
    """Return last data update timestamps for the live indicator."""
    latest_score = db.stress_scores.find_one({}, sort=[("computed_at", -1)])
    latest_fx = db.indicators.find_one({"indicator_type": "fx_volatility"}, sort=[("recorded_date", -1)])
    latest_wb = db.indicators.find_one({"indicator_type": "inflation"}, sort=[("recorded_date", -1)])

    return jsonify({
        "success": True,
        "data": {
            "last_score_update": latest_score["computed_at"].isoformat() if latest_score and latest_score.get("computed_at") else None,
            "last_fx_update": latest_fx["recorded_date"].isoformat() if latest_fx and latest_fx.get("recorded_date") else None,
            "last_wb_update": latest_wb["recorded_date"].isoformat() if latest_wb and latest_wb.get("recorded_date") else None,
            "total_countries": db.countries.count_documents({}),
            "total_indicators": db.indicators.count_documents({}),
        }
    })

@app.route("/api/calendar")
def get_calendar():
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "calendar_data.json")
        with open(path, "r") as f:
            data = json.load(f)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/")
def dev_index():
    return jsonify({"success": True, "message": "Institutional Analytics Engine (v2.2.1) is Live"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
