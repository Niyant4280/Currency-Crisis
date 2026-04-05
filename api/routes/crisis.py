"""
routes/crisis.py
================
Crisis-history API endpoint.
"""

from flask import Blueprint, jsonify
from db import db

crisis_bp = Blueprint("crisis", __name__)


def _serialize(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# ── GET /api/crisis-history ────────────────────────────────
@crisis_bp.route("/crisis-history")
def get_crisis_history():
    """All documents from the crisis_history collection."""
    docs = list(db.crisis_history.find().sort("year", -1))
    return jsonify({"success": True, "data": [_serialize(d) for d in docs]})
