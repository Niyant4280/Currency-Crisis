"""
app.py
======
Flask application entry-point for Currency Crisis EWS API.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from datetime import timezone

from api.db import db, ensure_indexes          # noqa: F401  — triggers index creation
from api.routes.countries import countries_bp
from api.routes.crisis import crisis_bp

app = Flask(__name__)
# Maximum CORS Compatibility
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    """Fallback CORS headers directly onto every response."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
    return response

@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler to ensure JSON responses even on crashes."""
    return jsonify({
        "success": False, 
        "error": str(e),
        "message": "Institutional Intelligence Suite Internal Error"
    }), 500

# ── Register blueprints ────────────────────────────────────
app.register_blueprint(countries_bp, url_prefix="/api")
app.register_blueprint(crisis_bp, url_prefix="/api")


# ── Root Landing ─────────────────────────────────────────────
@app.route("/")
def index():
    return jsonify({
        "success": True,
        "message": "Currency Crisis EWS Analytical Engine is Live",
        "endpoints": ["/api/health", "/api/status", "/api/leaderboard", "/api/calendar"]
    })


# ── Health check ────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})


# ── System Status ─────────────────────────────────────────────
@app.route("/api/status")
def status():
    """Return last data update timestamps for the live indicator."""
    latest_score = db.stress_scores.find_one(
        {}, sort=[("computed_at", -1)]
    )
    latest_fx = db.indicators.find_one(
        {"indicator_type": "fx_volatility"}, sort=[("recorded_date", -1)]
    )
    latest_wb = db.indicators.find_one(
        {"indicator_type": "inflation"}, sort=[("recorded_date", -1)]
    )

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


import json
import os

@app.route("/api/calendar")
def get_calendar():
    """Return seeded macro-economic events from JSON file."""
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "calendar_data.json")
        with open(path, "r") as f:
            data = json.load(f)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


from api.services.scraper import update_fx_and_scores

@app.route("/api/internal/cron")
def internal_cron():
    """Triggered by Vercel Cron. Updates FX and recomputes all scores."""
    # Verification (Optional: require a secret header from Vercel)
    try:
        msg = update_fx_and_scores()
        return jsonify({"success": True, "message": msg})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
