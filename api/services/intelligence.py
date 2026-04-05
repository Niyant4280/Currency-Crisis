import pandas as pd
from datetime import datetime, timezone

def calculate_market_sentiment(indicators, stress_history):
    """
    Deterministic sentiment model for sovereign risk.
    Scores from -1 (Extremely Bearish/Bloody) to +1 (Bullish/Optimistic).
    """
    if not indicators or not stress_history:
        return {"score": 0, "label": "Neutral", "color": "text-slate-400"}

    score = 0
    
    # 1. FX Volatility Component (High weight)
    fx = indicators.get("fx_volatility", {})
    if fx.get("trend") == "↑": # Depreciation
        score -= 0.4
    elif fx.get("trend") == "↓": # Appreciation
        score += 0.2
        
    # 2. Reserves Trend (Liquidity indicator)
    res = indicators.get("reserves", {})
    if res.get("trend") == "↓": # Depletion
        score -= 0.3
    elif res.get("trend") == "↑":
        score += 0.1

    # 3. Stress Velocity (Is it accelerating?)
    if len(stress_history) >= 2:
        latest = stress_history[-1].get("score", 50)
        prev = stress_history[-2].get("score", 50)
        velocity = latest - prev
        if velocity > 5: # Rapid worsening
            score -= 0.3
        elif velocity < -3: # Recovery
            score += 0.2

    # Final normalization
    score = max(min(score, 1), -1)
    
    label = "Bullish" if score > 0.4 else "Optimistic" if score > 0.1 else "Neutral" if score > -0.1 else "Bearish" if score > -0.4 else "Extremely Bearish"
    color = "text-emerald-400" if score > 0.1 else "text-slate-400" if score > -0.1 else "text-rose-400"
    
    return {
        "score": round(score, 2),
        "label": label,
        "color": color,
        "indicator_drivers": [
             {"name": "Liquidity", "status": "Stable" if res.get("trend") != "↓" else "Tightening"},
             {"name": "Currency", "status": "Strong" if fx.get("trend") != "↑" else "Bleeding"}
        ]
    }

def calculate_forecast(history):
    """
    7rd Day Linear Drift Projection.
    Returns array of {year: 'Forecast', score: value}
    """
    if len(history) < 3:
        return []
        
    scores = [h['score'] for h in history]
    series = pd.Series(scores)
    
    # Simple linear regression (last 3 points)
    last_points = scores[-3:]
    x = [0, 1, 2]
    y = last_points
    
    # y = mx + c
    n = len(x)
    m = (n*sum(i*j for i,j in zip(x,y)) - sum(x)*sum(y)) / (n*sum(i**2 for i in x) - (sum(x)**2))
    
    # Project 7 units (days/steps) forward
    projection_val = scores[-1] + (m * 2) # Weighted drift
    final_score = max(min(projection_val, 100), 0)
    
    return [
        {"year": "Current", "score": scores[-1]},
        {"year": "T+7 Forecast", "score": final_score, "isForecast": True}
    ]
